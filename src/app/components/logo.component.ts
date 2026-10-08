import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block shrink-0' },
  template: `
    <svg viewBox="0 0 24 24" class="h-full w-full" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2.6" />
      <circle cx="18.2" cy="6.4" r="2.6" class="animate-beat fill-pulse" style="transform-origin: 18.2px 6.4px" />
    </svg>
  `,
})
export class LogoComponent {}
