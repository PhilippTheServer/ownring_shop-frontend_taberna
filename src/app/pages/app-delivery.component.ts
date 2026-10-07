import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Item } from '../models';

interface AppInfo {
  android?: { play_store?: string; apk?: string };
  ios?: { available?: boolean; note?: string };
}

/**
 * Post-purchase app delivery. Android gets a Play Store link and a direct
 * signed-APK download; iOS shows a "not yet on the App Store" note. The links
 * come from the R02 product's `custom.app` field in the catalog.
 */
@Component({ imports:[RouterLink], changeDetection:ChangeDetectionStrategy.OnPush, template:`
  <section class="shell py-16">
    <p class="eyebrow text-rust">{{ i18n.t('app.eyebrow') }}</p>
    <h1 class="mt-3 font-display text-6xl font-bold">{{ i18n.t('app.title') }}</h1>
    <p class="mt-4 max-w-2xl text-lg text-ink/65">{{ i18n.t('app.copy') }}</p>
    <div class="mt-12 grid gap-6 md:grid-cols-2">
      <article class="panel p-8">
        <div class="flex items-center gap-3"><span class="text-3xl">🤖</span><h2 class="font-display text-3xl font-bold">{{ i18n.t('app.android') }}</h2></div>
        <div class="mt-6 flex flex-col gap-3">
          <a class="btn btn-primary" [href]="app()?.android?.play_store" target="_blank" rel="noopener">{{ i18n.t('app.playstore') }}</a>
          <a class="btn btn-secondary" [href]="app()?.android?.apk" target="_blank" rel="noopener">{{ i18n.t('app.apk') }}</a>
        </div>
      </article>
      <article class="panel p-8">
        <div class="flex items-center gap-3"><span class="text-3xl"></span><h2 class="font-display text-3xl font-bold">{{ i18n.t('app.ios') }}</h2></div>
        <p class="mt-6 text-ink/65">{{ i18n.t('app.iosNote') }}</p>
        <span class="mt-4 inline-block rounded-full bg-moss/15 px-4 py-1.5 text-sm font-bold text-moss">{{ i18n.t('app.comingSoon') }}</span>
      </article>
    </div>
    <a routerLink="/shop" class="btn btn-secondary mt-10">{{ i18n.t('cart.continue') }}</a>
  </section>
  `,
})
export class AppDeliveryComponent {
  private readonly api = inject(ApiService);
  readonly i18n = inject(I18nService);
  readonly app = signal<AppInfo | null>(null);

  constructor() {
    // The app links live on the R02 product; fetch the active catalog and
    // read the first item's custom.app.
    this.api.items(0, 10).subscribe({
      next: (page) => {
        const r02: Item | undefined = page.items.find(i => i.sku === 'OWNRING-R02') ?? page.items[0];
        this.app.set((r02?.custom as AppInfo | undefined) ?? null);
      },
      error: () => this.app.set(null),
    });
  }
}
