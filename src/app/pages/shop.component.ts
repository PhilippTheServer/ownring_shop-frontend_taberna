import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Item } from '../models';
import { ProductCardComponent } from '../components/product-card.component';
import { errorMessage } from '../core/format';

@Component({ imports:[ProductCardComponent], changeDetection:ChangeDetectionStrategy.OnPush, template:`
  <section class="shell py-14"><p class="eyebrow text-rust">{{i18n.t('shop.eyebrow')}}</p><h1 class="mt-3 font-display text-6xl font-bold">{{i18n.t('shop.title')}}</h1><p class="mt-4 max-w-2xl text-lg text-ink/65">{{i18n.t('shop.copy')}}</p>
  @if (loading()) { <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">@for (n of [1,2,3,4,5,6]; track n) {<div class="h-[28rem] animate-pulse rounded-2xl bg-ink/10"></div>}</div> }
  @else if (error()) { <div class="panel mt-10 p-8"><h2 class="font-display text-2xl font-bold">The shop could not be loaded</h2><p class="mt-2 text-rust">{{error()}}</p><button class="btn btn-primary mt-5" (click)="load()">Try again</button></div> }
  @else { <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">@for (item of items(); track item.uuid) {<app-product-card [item]="item" />}@if(!items().length){<p class="text-ink/55">{{i18n.t('shop.empty')}}</p>}</div> }
  </section>` })
export class ShopComponent {
  private readonly api=inject(ApiService); readonly i18n=inject(I18nService); readonly items=signal<Item[]>([]); readonly loading=signal(true); readonly error=signal('');
  constructor(){this.load();} load(){this.loading.set(true);this.error.set('');this.api.items().subscribe({next:r=>{this.items.set(r.items);this.loading.set(false)},error:e=>{this.error.set(errorMessage(e));this.loading.set(false)}})}
}
