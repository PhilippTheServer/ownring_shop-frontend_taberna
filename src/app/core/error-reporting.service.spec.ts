import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import {
  ErrorReportingService,
  TelemetryErrorHandler,
} from './error-reporting.service';
import { storefrontConfig } from '../storefront.config';

/**
 * The failure mode being reported on is a component throwing inside a render
 * loop. These pin the guards that stop a reporter turning that into a request
 * loop — and that stop it making anything worse.
 */
describe('ErrorReportingService', () => {
  const configuredEnabled = storefrontConfig.errorReporting.enabled;
  let sent: Array<{ errors: Array<Record<string, unknown>> }>;
  let calls: number;
  let originalFetch: typeof globalThis.fetch;

  function configure(enabled: boolean) {
    (storefrontConfig.errorReporting as { enabled: boolean }).enabled = enabled;
    TestBed.configureTestingModule({
      providers: [
        ErrorReportingService,
        { provide: Router, useValue: { url: '/checkout?token=secret' } },
      ],
    });
    return TestBed.inject(ErrorReportingService);
  }

  beforeEach(() => {
    sent = [];
    calls = 0;
    originalFetch = globalThis.fetch;
    globalThis.fetch = ((_url: string, init?: RequestInit) => {
      calls++;
      sent.push(JSON.parse(String(init?.body)));
      return Promise.resolve(new Response(null, { status: 202 }));
    }) as typeof globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (storefrontConfig.errorReporting as { enabled: boolean }).enabled = configuredEnabled;
  });

  // -------------------------------------------------------------------------
  // OwnRing opts in; operators can still switch reporting off
  // -------------------------------------------------------------------------

  it('is enabled in the OwnRing configuration', () => {
    expect(storefrontConfig.errorReporting.enabled).toBe(true);
  });

  it('sends nothing when disabled', () => {
    const service = configure(false);
    for (let i = 0; i < 20; i++) {
      service.report(new Error(`boom ${i}`));
    }
    expect(calls).toBe(0);
  });

  // -------------------------------------------------------------------------
  // A render loop must not become a request loop
  // -------------------------------------------------------------------------

  it('reports an identical error at most three times per session', () => {
    const service = configure(true);

    for (let i = 0; i < 500; i++) {
      service.report(new TypeError('same failure every frame'));
    }
    service.flushNow();

    const reported = sent.flatMap((batch) => batch.errors);
    expect(reported.length).toBe(3);
  });

  it('still reports genuinely different errors', () => {
    const service = configure(true);

    service.report(new TypeError('first'));
    service.report(new RangeError('second'));
    service.flushNow();

    const messages = sent.flatMap((b) => b.errors).map((e) => e['message']);
    expect(messages).toContain('first');
    expect(messages).toContain('second');
  });

  it('stops entirely after a per-session ceiling', () => {
    const service = configure(true);

    // 100 distinct signatures, so per-signature capping cannot be what stops it.
    for (let i = 0; i < 100; i++) {
      service.report(new Error(`distinct ${i}`));
    }
    service.flushNow();

    const reported = sent.flatMap((b) => b.errors);
    expect(reported.length).toBeLessThanOrEqual(50);
  });

  // -------------------------------------------------------------------------
  // What gets sent
  // -------------------------------------------------------------------------

  it('strips the query string from the reported path', () => {
    const service = configure(true);
    service.report(new Error('boom'));
    service.flushNow();

    const report = sent[0].errors[0];
    expect(report['path']).toBe('/checkout');
    expect(JSON.stringify(sent)).not.toContain('secret');
  });

  it('handles a thrown string without assuming an Error shape', () => {
    const service = configure(true);
    // JavaScript lets anything be thrown, and frameworks do.
    expect(() => service.report('just a string')).not.toThrow();
    service.flushNow();

    expect(sent[0].errors[0]['name']).toBe('UnknownError');
    expect(sent[0].errors[0]['message']).toBe('just a string');
  });

  it('handles a thrown object with no message', () => {
    const service = configure(true);
    expect(() => service.report({ status: 500 })).not.toThrow();
    service.flushNow();

    expect(sent[0].errors[0]['name']).toBe('UnknownError');
  });

  it('handles null without throwing', () => {
    const service = configure(true);
    expect(() => service.report(null)).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // Never make things worse
  // -------------------------------------------------------------------------

  it('swallows a failing endpoint', () => {
    const service = configure(true);
    globalThis.fetch = (() =>
      Promise.reject(new Error('network down'))) as typeof globalThis.fetch;

    expect(() => {
      service.report(new Error('boom'));
      service.flushNow();
    }).not.toThrow();
  });
});

describe('TelemetryErrorHandler', () => {
  it('still logs to the console', () => {
    // Swallowing this would remove what a developer looks at first, in exchange
    // for a report they cannot see locally.
    const logged: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => logged.push(args[0]);

    TestBed.configureTestingModule({
      providers: [
        TelemetryErrorHandler,
        { provide: ErrorReportingService, useValue: { report: () => undefined } },
      ],
    });

    try {
      const error = new Error('visible');
      TestBed.inject(TelemetryErrorHandler).handleError(error);
      expect(logged).toContain(error);
    } finally {
      console.error = original;
    }
  });

  it('does not let a broken reporter mask the original error', () => {
    const original = console.error;
    const logged: unknown[] = [];
    console.error = (...args: unknown[]) => logged.push(args[0]);

    TestBed.configureTestingModule({
      providers: [
        TelemetryErrorHandler,
        {
          provide: ErrorReportingService,
          useValue: {
            report: () => {
              throw new Error('reporter is broken');
            },
          },
        },
      ],
    });

    try {
      const error = new Error('the real problem');
      expect(() =>
        TestBed.inject(TelemetryErrorHandler).handleError(error),
      ).not.toThrow();
      expect(logged).toContain(error);
    } finally {
      console.error = original;
    }
  });
});
