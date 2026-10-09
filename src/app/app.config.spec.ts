import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { appConfig } from './app.config';
import { AnalyticsService } from './core/analytics.service';
import { AuthService } from './core/auth.service';
import { ErrorReportingService } from './core/error-reporting.service';

describe('Global frontend error capture', () => {
  it('reports window errors and unhandled promise rejections', async () => {
    const report = vi.fn();
    const suppress = (event: Event) => event.preventDefault();
    window.addEventListener('error', suppress, true);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { init: () => Promise.resolve() } },
        { provide: AnalyticsService, useValue: { init: () => undefined } },
        { provide: ErrorReportingService, useValue: { report, flushNow: () => undefined } },
      ],
    });
    try {
      const initializers = TestBed.inject(ApplicationInitStatus);
      await initializers.donePromise;
      const thrown = new Error('global test error');
      window.dispatchEvent(new ErrorEvent('error', { error: thrown, cancelable: true }));
      const rejected = new Error('global test rejection');
      const event = new Event('unhandledrejection');
      Object.defineProperty(event, 'reason', { value: rejected });
      window.dispatchEvent(event);
      expect(report).toHaveBeenCalledWith(thrown);
      expect(report).toHaveBeenCalledWith(rejected);
    } finally {
      TestBed.resetTestingModule();
      window.removeEventListener('error', suppress, true);
      vi.restoreAllMocks();
    }
  });
});
