import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { AnalyticsService } from './core/analytics.service';
import {
  ErrorReportingService,
  TelemetryErrorHandler,
} from './core/error-reporting.service';
import { AuthService } from './core/auth.service';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })),
    provideAppInitializer(() => inject(AuthService).init()),
    provideAppInitializer(() => inject(AnalyticsService).init()),
    { provide: ErrorHandler, useClass: TelemetryErrorHandler },
    provideAppInitializer(() => {
      const reporter = inject(ErrorReportingService);
      if (typeof document !== 'undefined') {
        // A closing tab is the usual way a partial batch is lost.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') reporter.flushNow();
        });
      }
    }),
  ],
};
