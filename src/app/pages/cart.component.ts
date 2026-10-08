import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { I18nService } from '../core/i18n.service';
import { money } from '../core/format';

@Component({
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-5xl py-14 lg:py-20">
      <p class="label">{{ i18n.t('cart.label') }}</p>
      <h1 class="headline mt-4 text-4xl sm:text-5xl">{{ i18n.t('cart.title') }}</h1>

      @if (!cart.lines().length) {
        <div class="card mt-10 p-10 text-center">
          <img src="/img/ring-thumb.webp" width="360" height="354" alt="" class="mx-auto w-28 opacity-80">
          <p class="mt-6 text-xl">{{ i18n.t('cart.empty') }}</p>
          <a routerLink="/" class="btn btn-primary mt-6">{{ i18n.t('cart.continue') }}</a>
        </div>
      } @else {
        <div class="mt-10 grid items-start gap-4 lg:grid-cols-[1fr_22rem]">
          <div class="card divide-y divide-white/[.06]">
            @for (line of cart.lines(); track line.item.uuid) {
              <article class="grid grid-cols-[5.5rem_1fr] items-center gap-5 p-5 sm:grid-cols-[6.5rem_1fr_auto]">
                <div class="inset grid aspect-square place-items-center p-2"><img src="/img/ring-thumb.webp" width="360" height="354" [alt]="line.item.name"></div>
                <div>
                  <a routerLink="/" class="text-lg font-semibold tracking-tight">{{ line.item.name }}</a>
                  <p class="mt-0.5 font-mono text-xs text-faint">{{ line.item.sku }}</p>
                  <div class="mt-4 flex items-center gap-2">
                    <button type="button" class="grid h-8 w-8 cursor-pointer place-items-center rounded-full border hairline hover:bg-white/5" [attr.aria-label]="i18n.t('cart.less')" (click)="cart.quantity(line.item.uuid, line.quantity - 1)">−</button>
                    <span class="min-w-6 text-center font-mono">{{ line.quantity }}</span>
                    <button type="button" class="grid h-8 w-8 cursor-pointer place-items-center rounded-full border hairline hover:bg-white/5" [attr.aria-label]="i18n.t('cart.more')" (click)="cart.quantity(line.item.uuid, line.quantity + 1)">+</button>
                    <button type="button" class="ml-3 cursor-pointer text-sm text-muted hover:text-pulse" (click)="cart.remove(line.item.uuid)">{{ i18n.t('cart.remove') }}</button>
                  </div>
                </div>
                <strong class="col-start-2 font-mono text-lg sm:col-auto">{{ format(line.item.price.amount * line.quantity, line.item.price.currency) }}</strong>
              </article>
            }
          </div>
          <aside class="card p-6 lg:sticky lg:top-24">
            <div class="flex justify-between text-sm text-muted"><span>{{ i18n.t('cart.shipping') }}</span><span>{{ i18n.t('cart.shippingFree') }}</span></div>
            <div class="mt-4 flex items-baseline justify-between border-t hairline pt-4">
              <span>{{ i18n.t('cart.total') }}</span><strong class="font-mono text-2xl">{{ format(cart.total()) }}</strong>
            </div>
            <p class="mt-3 text-xs leading-5 text-faint">{{ i18n.t('cart.taxNote') }}</p>
            <a routerLink="/checkout" class="btn btn-primary mt-6 w-full">{{ i18n.t('cart.checkout') }}</a>
            <a routerLink="/" class="mt-4 block text-center text-sm text-muted hover:text-ink">{{ i18n.t('cart.continue') }}</a>
          </aside>
        </div>
      }
    </section>
  `,
})
export class CartComponent {
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);
  format(amount: number, currency = 'EUR') { return money(amount, currency, this.i18n.lang()); }
}
