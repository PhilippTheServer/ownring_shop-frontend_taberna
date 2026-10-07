import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../core/api.service';
import { AnalyticsService } from '../core/analytics.service';
import { CartService } from '../core/cart.service';
import { I18nService } from '../core/i18n.service';
import { errorMessage, money } from '../core/format';
import { Item } from '../models';

@Component({ imports:[RouterLink], changeDetection:ChangeDetectionStrategy.OnPush, template:`
  <section class="shell py-12"><a routerLink="/shop" class="text-sm font-bold text-moss">{{i18n.t('product.back')}}</a>
  @if (error()) {<div class="panel mt-8 p-8 text-rust">{{error()}}</div>} @else if (!item()) {<div class="mt-10 h-96 animate-pulse rounded-3xl bg-ink/10"></div>} @else { @let product=item()!;
    <div class="mt-8 grid gap-10 lg:grid-cols-2">
      <div class="overflow-hidden rounded-3xl bg-sand/35 shadow-soft">@if(product.media.main_image){<img [src]="product.media.main_image" [alt]="product.name" class="aspect-square h-full w-full object-cover">}@else{<div class="grid aspect-square place-items-center font-display text-8xl text-ink/20">✦</div>}</div>
      <div class="py-4"><p class="eyebrow text-rust">{{product.brand || 'OwnRing'}} · {{product.sku}}</p><h1 class="mt-4 font-display text-5xl font-bold sm:text-6xl">{{product.name}}</h1><p class="mt-5 text-xl leading-8 text-ink/65">{{product.short_description}}</p><div class="mt-7 flex items-end gap-3"><strong class="font-display text-4xl">{{price(product)}}</strong>@if(product.price.original_amount){<del class="pb-1 text-ink/45">{{moneyValue(product.price.original_amount,product.price.currency)}}</del>}</div>
      <div class="mt-8 flex flex-wrap gap-3"><button class="btn btn-primary" [disabled]="!available(product)" (click)="cart.add(product)">{{available(product)?i18n.t('product.add'):i18n.t('product.unavailable')}}</button><a routerLink="/cart" class="btn btn-secondary">{{i18n.t('product.viewbag')}}</a></div>
      <div class="mt-10 border-t border-ink/15 pt-8 leading-7 text-ink/70" [innerHTML]="description()"></div>
      @if(product.attributes && entries(product.attributes).length){<dl class="mt-8 grid grid-cols-2 gap-3">@for(attribute of entries(product.attributes);track attribute[0]){<div class="rounded-xl bg-paper p-4"><dt class="eyebrow text-ink/45">{{attribute[0]}}</dt><dd class="mt-1 font-semibold">{{attribute[1]}}</dd></div>}</dl>}
      </div>
    </div> }
  </section>` })
export class ProductComponent {
  private readonly route=inject(ActivatedRoute);private readonly api=inject(ApiService);private readonly analytics=inject(AnalyticsService);private readonly sanitizer=inject(DomSanitizer);readonly cart=inject(CartService);readonly i18n=inject(I18nService);readonly item=signal<Item|null>(null);readonly error=signal('');readonly description=signal<SafeHtml>('');
  constructor(){const id=this.route.snapshot.paramMap.get('id')!;this.api.item(id).subscribe({next:item=>{this.item.set(item);this.analytics.track('product_view',{sku:item.sku,path:`/shop/${id}`});this.description.set(this.sanitizer.bypassSecurityTrustHtml(item.description||item.short_description||''))},error:e=>this.error.set(errorMessage(e))});}
  price(i:Item){return money(i.price.amount,i.price.currency)} moneyValue=money; available(i:Item){return i.inventory.stock_status==='in_stock'||i.inventory.allow_backorder} entries(value:Record<string,unknown>){return Object.entries(value)}
}
