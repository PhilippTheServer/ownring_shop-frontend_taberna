import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';
import { I18nService } from './core/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen">
      <header class="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
        <div class="shell flex min-h-18 items-center justify-between gap-5">
          <a routerLink="/" class="font-display text-2xl font-bold tracking-tight">◍ {{ i18n.t('brand') }}</a>
          <nav class="flex items-center gap-2 text-sm font-semibold sm:gap-5" aria-label="Main navigation">
            <a routerLink="/" routerLinkActive="text-rust" [routerLinkActiveOptions]="{exact:true}" class="hidden sm:inline">{{ i18n.t('nav.home') }}</a>
            <a routerLink="/shop" routerLinkActive="text-rust">{{ i18n.t('nav.shop') }}</a>
            @if (auth.authenticated()) {
              <a routerLink="/account" routerLinkActive="text-rust" class="hidden sm:inline">{{ auth.displayName() }}</a>
            } @else {
              <button type="button" (click)="auth.login()" class="cursor-pointer">{{ i18n.t('nav.signin') }}</button>
            }
            <a routerLink="/cart" class="rounded-full border border-ink/20 px-3 py-2">{{ i18n.t('nav.bag') }} <span class="ml-1 rounded-full bg-ink px-1.5 py-0.5 text-xs text-white">{{ cart.count() }}</span></a>
            <button type="button" (click)="i18n.toggle()" class="cursor-pointer rounded-full border border-ink/20 px-3 py-2 text-xs font-bold" [attr.aria-label]="'Switch language'">{{ i18n.isDe() ? 'EN' : 'DE' }}</button>
          </nav>
        </div>
      </header>
      <main><router-outlet /></main>
      <footer class="mt-20 border-t border-ink/15 py-10">
        <div class="shell flex flex-col justify-between gap-6 text-sm sm:flex-row">
          <div>
            <strong class="font-display text-lg">OwnRing</strong>
            <p class="mt-1 text-ink/65">{{ i18n.t('footer.tagline') }}</p>
          </div>
          <div>
            <p class="eyebrow text-ink/45">{{ i18n.t('footer.legal') }}</p>
            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <a routerLink="/impressum" class="hover:text-rust">{{ i18n.t('footer.impressum') }}</a>
              <a routerLink="/datenschutz" class="hover:text-rust">{{ i18n.t('footer.privacy') }}</a>
              <a routerLink="/widerruf" class="hover:text-rust">{{ i18n.t('footer.withdrawal') }}</a>
              <a routerLink="/produktsicherheit" class="hover:text-rust">{{ i18n.t('footer.safety') }}</a>
            </div>
          </div>
          <p class="text-ink/55">© 2026 OwnRing</p>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);
}
