import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AnalyticsService } from './analytics.service';
import { storefrontConfig } from '../storefront.config';

/**
 * The privacy promise and the "never degrade the shop" rule are both properties
 * of this class, so they are pinned here.
 */
describe('AnalyticsService', () => {
  const configuredEnabled = storefrontConfig.analytics.enabled;
  let sent: Array<Record<string, unknown>>;
  let service: AnalyticsService;
  let originalFetch: typeof globalThis.fetch;

  function configure(enabled: boolean) {
    // storefrontConfig is `as const`; tests need to flip the flag.
    (storefrontConfig.analytics as { enabled: boolean }).enabled = enabled;

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: Router, useValue: { events: new Subject() } },
      ],
    });
    return TestBed.inject(AnalyticsService);
  }

  beforeEach(() => {
    sent = [];
    originalFetch = globalThis.fetch;
    globalThis.fetch = ((_url: string, init?: RequestInit) => {
      sent.push(JSON.parse(String(init?.body)));
      return Promise.resolve(new Response(null, { status: 202 }));
    }) as typeof globalThis.fetch;
    sessionStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (storefrontConfig.analytics as { enabled: boolean }).enabled = configuredEnabled;
  });

  // -------------------------------------------------------------------------
  // OwnRing opts in; operators can still switch analytics off
  // -------------------------------------------------------------------------

  it('is enabled in the OwnRing configuration', () => {
    expect(storefrontConfig.analytics.enabled).toBe(true);
  });

  it('sends nothing at all when disabled', () => {
    service = configure(false);
    for (let i = 0; i < 50; i++) {
      service.track('page_view', { path: '/shop' });
    }
    expect(sent.length).toBe(0);
  });

  it('creates no session identifier when disabled', () => {
    service = configure(false);
    service.track('product_view', { sku: 'X' });
    // Nothing is stored, so a deployment that has not opted in leaves no trace
    // in the visitor's browser whatsoever.
    expect(sessionStorage.getItem('opentaberna-analytics-session')).toBeNull();
  });

  // -------------------------------------------------------------------------
  // What is sent
  // -------------------------------------------------------------------------

  it('flushes once a full batch accumulates', () => {
    service = configure(true);
    for (let i = 0; i < 10; i++) {
      service.track('page_view', { path: '/shop' });
    }
    expect(sent.length).toBe(1);
    expect(sent[0]['events']).toHaveLength(10);
  });

  it('identifies a shopper only by an opaque session id', () => {
    service = configure(true);
    for (let i = 0; i < 10; i++) {
      service.track('product_view', { sku: 'RED-1' });
    }

    const event = (sent[0]['events'] as Array<Record<string, unknown>>)[0];

    // Only fields from the agreed vocabulary reach the wire. Anything outside
    // this set would be a field nobody decided to collect.
    const allowed = ['event_type', 'occurred_at', 'order_id', 'path', 'session_id', 'sku'];
    expect(Object.keys(event).every((key) => allowed.includes(key))).toBe(true);

    expect(event['session_id']).toBeTruthy();
    // No field that could name a person is present, in this event or any other.
    const payload = JSON.stringify(sent[0]);
    for (const forbidden of ['email', 'customer_id', 'first_name', 'ip', 'user_agent']) {
      expect(payload).not.toContain(forbidden);
    }
  });

  it('strips query strings before they leave the browser', () => {
    service = configure(true);
    for (let i = 0; i < 10; i++) {
      service.track('page_view', { path: '/shop?email=someone@example.com&t=1' });
    }

    const event = (sent[0]['events'] as Array<Record<string, unknown>>)[0];
    expect(event['path']).toBe('/shop');
    expect(JSON.stringify(sent[0])).not.toContain('someone@example.com');
  });

  it('keeps the session id in sessionStorage, not a cookie or localStorage', () => {
    service = configure(true);
    service.track('page_view', { path: '/' });

    // sessionStorage dies with the tab. A cookie would be a persistent
    // identifier, which is what requires a consent banner.
    expect(sessionStorage.getItem('opentaberna-analytics-session')).toBeTruthy();
    expect(document.cookie).not.toContain('opentaberna-analytics-session');
  });

  it('reuses one session id across events', () => {
    service = configure(true);
    for (let i = 0; i < 10; i++) {
      service.track('page_view', { path: `/p${i}` });
    }

    const events = sent[0]['events'] as Array<Record<string, unknown>>;
    const ids = new Set(events.map((e) => e['session_id']));
    expect(ids.size).toBe(1);
  });

  // -------------------------------------------------------------------------
  // Never degrade the shop
  // -------------------------------------------------------------------------

  it('swallows a failing endpoint rather than throwing into the page', () => {
    service = configure(true);
    globalThis.fetch = (() => Promise.reject(new Error('network down'))) as typeof globalThis.fetch;

    expect(() => {
      for (let i = 0; i < 10; i++) {
        service.track('page_view', { path: '/shop' });
      }
    }).not.toThrow();
  });

  it('drops events rather than retrying them', () => {
    service = configure(true);
    let calls = 0;
    globalThis.fetch = (() => {
      calls++;
      return Promise.reject(new Error('down'));
    }) as typeof globalThis.fetch;

    for (let i = 0; i < 10; i++) {
      service.track('page_view', { path: '/shop' });
    }

    // Retrying into a queue during an incident turns a quiet failure loud.
    expect(calls).toBe(1);
  });

  it('survives sessionStorage being unavailable', () => {
    service = configure(true);
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('private browsing');
    };

    try {
      expect(() => service.track('page_view', { path: '/shop' })).not.toThrow();
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});
