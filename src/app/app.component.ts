import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';
import { I18nService } from './core/i18n.service';
import { LogoComponent } from './components/logo.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col">
      <header class="sticky top-0 z-40 border-b hairline bg-screen/75 backdrop-blur-xl">
        <div class="shell flex h-16 items-center gap-8">
          <a routerLink="/" class="flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-tight">
            <app-logo class="h-6 w-6" />{{ i18n.t('brand') }}
          </a>
          <nav class="hidden items-center gap-7 text-sm text-muted md:flex" aria-label="Main">
            @for (link of links; track link.id) {
              <a routerLink="/" [fragment]="link.id" class="transition hover:text-ink">{{ i18n.t(link.key) }}</a>
            }
          </nav>
          <div class="ml-auto flex items-center gap-1 sm:gap-2">
            <button type="button" (click)="i18n.toggle()" class="label cursor-pointer rounded-full px-3 py-2 transition hover:text-ink" [attr.aria-label]="i18n.t('nav.lang')">
              {{ i18n.isDe() ? 'EN' : 'DE' }}
            </button>
            @if (auth.authenticated()) {
              <a routerLink="/account" class="hidden rounded-full px-3 py-2 text-sm text-muted transition hover:text-ink sm:inline">{{ auth.displayName() }}</a>
            } @else {
              <button type="button" (click)="auth.login()" class="hidden cursor-pointer rounded-full px-3 py-2 text-sm text-muted transition hover:text-ink sm:inline">{{ i18n.t('nav.signin') }}</button>
            }
            <a routerLink="/cart" class="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/5" [attr.aria-label]="i18n.t('nav.cart') + ': ' + cart.count()">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
              </svg>
              @if (cart.count()) {
                <span class="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-pulse px-1 font-mono text-[10px] font-semibold text-on-ink">{{ cart.count() }}</span>
              }
            </a>
            <a routerLink="/" fragment="buy" class="btn btn-primary btn-sm ml-1">{{ i18n.t('nav.buy') }}</a>
          </div>
        </div>
      </header>

      <main class="flex-1"><router-outlet /></main>

      <footer class="mt-24 border-t hairline">
        <div class="shell grid gap-10 py-14 text-sm md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <a routerLink="/" class="flex items-center gap-2.5 text-base font-semibold tracking-tight"><app-logo class="h-6 w-6" />OwnRing</a>
            <p class="mt-4 max-w-xs leading-6 text-muted">{{ i18n.t('footer.tagline') }}</p>
            <p class="mt-2 text-faint">{{ i18n.t('footer.made') }}</p>
          </div>
          <div>
            <p class="label">{{ i18n.t('footer.legal') }}</p>
            <ul class="mt-4 space-y-2.5 text-muted">
              <li><a routerLink="/impressum" class="transition hover:text-ink">{{ i18n.t('footer.impressum') }}</a></li>
              <li><a routerLink="/datenschutz" class="transition hover:text-ink">{{ i18n.t('footer.privacy') }}</a></li>
              <li><a routerLink="/widerruf" class="transition hover:text-ink">{{ i18n.t('footer.withdrawal') }}</a></li>
              <li><a routerLink="/produktsicherheit" class="transition hover:text-ink">{{ i18n.t('footer.safety') }}</a></li>
            </ul>
          </div>
          <div>
            <p class="label">OwnRing</p>
            <ul class="mt-4 space-y-2.5 text-muted">
              @for (link of links; track link.id) {
                <li><a routerLink="/" [fragment]="link.id" class="transition hover:text-ink">{{ i18n.t(link.key) }}</a></li>
              }
            </ul>
          </div>
        </div>
        <div class="shell flex justify-between border-t hairline py-6 font-mono text-xs text-faint">
          <span>© 2026 OwnRing</span><span>no cloud · no account · no subscription</span>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);
  readonly links = [
    { id: 'ring', key: 'nav.ring' },
    { id: 'app', key: 'nav.app' },
    { id: 'specs', key: 'nav.specs' },
    { id: 'faq', key: 'nav.faq' },
  ];

  constructor() {
    document.documentElement.lang = this.i18n.lang();
  }
}
