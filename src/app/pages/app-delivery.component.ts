import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { storefrontConfig } from '../storefront.config';

interface AppInfo {
  android?: { play_store?: string; apk?: string };
  ios?: { available?: boolean; note?: string };
}

/**
 * Post-purchase app delivery. Android gets a Play Store link and a direct
 * signed-APK download; iOS shows a "not yet available" note. The links come
 * from the R02 product's `custom.app` field in the catalog.
 */
@Component({
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-5xl py-14 lg:py-20">
      <p class="label">{{ i18n.t('app.label') }}</p>
      <h1 class="headline mt-4 text-4xl sm:text-5xl">{{ i18n.t('app.title') }}</h1>
      <p class="lede mt-5 max-w-2xl">{{ i18n.t('app.copy') }}</p>
      <div class="mt-12 grid gap-4 md:grid-cols-2">
        <article class="card p-8">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold tracking-tight">{{ i18n.t('app.android') }}</h2>
            <span class="dot bg-steps"></span>
          </div>
          <p class="mt-2 font-mono text-xs text-faint">{{ i18n.t('app.androidReq') }}</p>
          <div class="mt-8 flex flex-col gap-3">
            @if (app()?.android?.apk; as apk) { <a class="btn btn-primary" [href]="apk" rel="noopener">{{ i18n.t('app.apk') }}</a> }
            @if (app()?.android?.play_store; as store) { <a class="btn btn-ghost" [href]="store" target="_blank" rel="noopener">{{ i18n.t('app.playstore') }}</a> }
          </div>
        </article>
        <article class="card p-8">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold tracking-tight">{{ i18n.t('app.ios') }}</h2>
            <span class="label">{{ i18n.t('app.comingSoon') }}</span>
          </div>
          <p class="mt-6 leading-7 text-muted">{{ i18n.t('app.iosNote') }}</p>
        </article>
      </div>
      <a routerLink="/" class="btn btn-ghost mt-10">{{ i18n.t('cart.continue') }}</a>
    </section>
  `,
})
export class AppDeliveryComponent {
  private readonly api = inject(ApiService);
  readonly i18n = inject(I18nService);
  readonly app = signal<AppInfo | null>(null);

  constructor() {
    this.api.items(0, 10).subscribe({
      next: (page) => {
        const r02 = page.items.find((i) => i.sku === storefrontConfig.productSku) ?? page.items[0];
        this.app.set((r02?.custom?.['app'] as AppInfo | undefined) ?? null);
      },
      error: () => this.app.set(null),
    });
  }
}
