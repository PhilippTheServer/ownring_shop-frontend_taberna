import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Item } from '../models';
import { CartService } from '../core/cart.service';
import { I18nService } from '../core/i18n.service';
import { money } from '../core/format';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <a [routerLink]="['/shop', item().uuid]" class="aspect-[4/3] overflow-hidden bg-sand/35">
        @if (item().media.main_image) { <img [src]="item().media.main_image" [alt]="item().name" class="h-full w-full object-cover transition duration-500 group-hover:scale-105"> }
        @else { <div class="grid h-full place-items-center font-display text-5xl text-ink/20">✦</div> }
      </a>
      <div class="flex flex-1 flex-col p-5">
        <p class="eyebrow text-moss">{{ item().brand || 'OwnRing' }}</p>
        <a [routerLink]="['/shop', item().uuid]" class="mt-2 font-display text-2xl font-bold">{{ item().name }}</a>
        <p class="mt-2 flex-1 text-sm leading-6 text-ink/65">{{ item().short_description }}</p>
        <div class="mt-5 flex items-center justify-between gap-3">
          <strong>{{ price(item()) }}</strong>
          <button type="button" class="btn btn-primary !min-h-9 !px-4 !py-2 text-sm" [disabled]="!available(item())" (click)="cart.add(item())">{{ available(item()) ? i18n.t('product.add') : i18n.t('product.unavailable') }}</button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  readonly item = input.required<Item>();
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);
  price(item: Item) { return money(item.price.amount, item.price.currency); }
  available(item: Item) { return item.inventory.stock_status === 'in_stock' || item.inventory.allow_backorder; }
}
