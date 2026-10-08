import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AnalyticsService } from '../core/analytics.service';
import { ApiService } from '../core/api.service';
import { CartService } from '../core/cart.service';
import { I18nService } from '../core/i18n.service';
import { money, ringSize } from '../core/format';
import { Item } from '../models';
import { storefrontConfig } from '../storefront.config';

/** Draws a sparkline into a 120 × 36 box. */
function line(values: number[]): string {
  const min = Math.min(...values), span = Math.max(...values) - min || 1;
  return values.map((v, i) => `${i ? 'L' : 'M'}${(i * 120) / (values.length - 1)},${32 - ((v - min) / span) * 28}`).join(' ');
}

@Component({
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(56rem_34rem_at_72%_32%,rgb(250_135_133/8%),transparent_70%)]"></div>
      <div class="shell grid items-center gap-8 pb-20 pt-6 sm:pt-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-4 lg:pb-28 lg:pt-20">
        <div>
          <p class="label">{{ i18n.t('hero.eyebrow') }}</p>
          <h1 class="headline mt-6 text-[2.9rem] sm:text-7xl lg:text-[5.2rem]">
            {{ i18n.t('hero.title1') }}<br>{{ i18n.t('hero.title2') }}<br><span class="text-pulse">{{ i18n.t('hero.title3') }}</span>
          </h1>
          <p class="lede mt-7 max-w-xl">{{ i18n.t('hero.copy') }}</p>
          <ul class="mt-7 flex flex-wrap gap-2">
            @for (chip of chips; track chip) {
              <li class="flex items-center gap-2 rounded-full border hairline px-3.5 py-1.5 font-mono text-xs text-muted"><span class="dot bg-steps"></span>{{ i18n.t(chip) }}</li>
            }
          </ul>

          <div id="buy" class="card mt-10 max-w-xl p-6 sm:p-7">
            <div class="flex flex-wrap items-baseline justify-between gap-4">
              <p class="flex items-baseline gap-3">
                <span class="text-5xl font-semibold tracking-tight" data-testid="price">{{ price() }}</span>
                <span class="text-muted">{{ i18n.t('price.oneTime') }}</span>
              </p>
              @if (sizes().length) {
                <p class="flex items-center gap-2 text-sm">
                  <span class="dot" [class.bg-steps]="inStock()" [class.bg-stress]="!inStock()"></span>{{ inStock() ? i18n.t('stock.in') : i18n.t('stock.out') }}
                </p>
              }
            </div>
            <fieldset class="mt-6">
              <legend class="flex w-full items-baseline justify-between text-sm">
                <span>{{ i18n.t('size.pick') }}</span>
                <a routerLink="/" fragment="faq" class="text-muted transition hover:text-ink">{{ i18n.t('size.help') }}</a>
              </legend>
              <div class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                @for (s of sizes(); track s.uuid) {
                  <button type="button" class="size" [class.selected]="selected()?.uuid === s.uuid" [disabled]="!available(s)"
                    [attr.aria-pressed]="selected()?.uuid === s.uuid" [attr.data-testid]="'size-' + size(s)" (click)="selected.set(s)">
                    <span class="block text-lg font-semibold">{{ size(s) }}</span>
                    <span class="block font-mono text-[11px] text-faint">Ø {{ diameter(s) }}</span>
                  </button>
                }
              </div>
            </fieldset>
            <button type="button" class="btn btn-primary mt-6 w-full text-base" data-testid="buy" [disabled]="!canBuy()" (click)="buy()">
              @if (selected(); as s) { {{ i18n.t('buy.cta') }} · {{ i18n.t('size.label') }} {{ size(s) }} } @else { {{ i18n.t('buy.pickSize') }} }
            </button>
            @if (loadError()) { <p class="mt-4 text-sm text-pulse">{{ i18n.t('buy.loadError') }}</p> }
            <p class="mt-5 border-t hairline pt-4 text-sm text-muted">{{ i18n.t('buy.trust') }}</p>
            <p class="mt-1.5 text-xs leading-5 text-faint">{{ i18n.t('price.note') }}</p>
          </div>
        </div>

        <div class="relative order-first mx-auto w-full max-w-[18rem] sm:max-w-[28rem] lg:order-none lg:max-w-[34rem]">
          <div class="glow absolute inset-[-8%] -z-10 rounded-full"></div>
          <svg viewBox="0 0 600 120" class="absolute inset-x-[-10%] top-1/2 -z-10 w-[120%] -translate-y-1/2 opacity-40" aria-hidden="true">
            <path pathLength="1" class="animate-trace" fill="none" stroke="var(--color-pulse)" stroke-width="1.5" stroke-linejoin="round"
              d="M0 60 H170 L185 60 L195 30 L208 98 L220 12 L232 84 L242 60 H360 L372 60 L380 44 L390 76 L398 60 H600" />
          </svg>
          <img src="/img/ring-hero.webp" width="1667" height="1637" fetchpriority="high" [alt]="i18n.t('hero.alt')" class="animate-float w-full drop-shadow-[0_40px_60px_rgb(0_0_0/60%)]">
          <div class="card absolute bottom-[6%] left-0 flex items-center gap-3 px-4 py-3 shadow-2xl sm:left-[-4%]" aria-hidden="true">
            <span class="dot animate-beat bg-pulse"></span>
            <span class="font-mono text-sm"><span class="text-2xl font-semibold tracking-tight">72</span> bpm</span>
            <span class="label !text-[10px]">live</span>
          </div>
        </div>
      </div>
    </section>

    <!-- What it measures -->
    <section id="ring" class="shell py-20 lg:py-28">
      <div class="max-w-2xl">
        <p class="label">{{ i18n.t('measure.label') }}</p>
        <h2 class="headline mt-5 text-4xl sm:text-5xl">{{ i18n.t('measure.title') }}</h2>
        <p class="lede mt-5">{{ i18n.t('measure.copy') }}</p>
      </div>
      <div class="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        @for (m of metrics; track m.key) {
          <article class="card p-5">
            <p class="flex items-center gap-2 font-medium"><span class="dot" [style.background]="m.color"></span>{{ i18n.t(m.key) }}</p>
            <svg viewBox="0 -2 120 38" class="mt-5 h-10 w-full overflow-visible" aria-hidden="true">
              @if (m.bars) {
                @for (v of m.values ?? []; track $index) {
                  <rect [attr.x]="$index * 12 + 1" [attr.y]="34 - v * 3" width="8" [attr.height]="v * 3" rx="2" [attr.fill]="m.color" opacity=".9" />
                }
              } @else {
                <path [attr.d]="m.path" fill="none" [attr.stroke]="m.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              }
            </svg>
            <p class="mt-4 text-sm leading-6 text-muted">{{ i18n.t(m.key + '.copy') }}</p>
          </article>
        }
      </div>
      <p class="mt-4 font-mono text-xs text-faint">{{ i18n.t('measure.note') }}</p>

      <div class="card mt-10 grid items-center overflow-hidden lg:grid-cols-[1.25fr_.75fr]">
        <div class="relative px-6 pt-8 lg:p-10">
          <img src="/img/ring-inside.webp" width="1800" height="1196" loading="lazy" [alt]="i18n.t('inside.alt')" class="w-full">
          @for (pin of pins; track $index) {
            <span class="absolute grid h-6 w-6 -translate-x-1/2 -translate-y-[160%] place-items-center rounded-full bg-ink font-mono text-xs font-semibold text-on-ink shadow-lg"
              [style.left]="pin.x" [style.top]="pin.y" aria-hidden="true">{{ pin.n }}</span>
          }
        </div>
        <div class="p-6 pt-2 lg:p-10">
          <h3 class="text-2xl font-semibold tracking-tight">{{ i18n.t('inside.title') }}</h3>
          <ol class="mt-6 space-y-4">
            @for (key of insideKeys; track key; let n = $index) {
              <li class="flex gap-3 text-muted"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full border hairline font-mono text-xs text-ink">{{ n + 1 }}</span>{{ i18n.t(key) }}</li>
            }
          </ol>
        </div>
      </div>
    </section>

    <!-- Why -->
    <section id="why" class="border-t hairline">
      <div class="shell py-20 lg:py-28">
        <div class="max-w-2xl">
          <p class="label">{{ i18n.t('why.label') }}</p>
          <h2 class="headline mt-5 text-4xl sm:text-5xl">{{ i18n.t('why.title') }}</h2>
          <p class="lede mt-5">{{ i18n.t('why.copy') }}</p>
        </div>
        <div class="mt-12 grid gap-3 lg:grid-cols-3">
          <article class="card min-w-0 p-7 lg:col-span-2">
            <h3 class="text-xl font-semibold tracking-tight">{{ i18n.t('why.cloud.title') }}</h3>
            <p class="mt-3 max-w-xl leading-7 text-muted">{{ i18n.t('why.cloud.copy') }}</p>
            <pre class="inset mt-6 overflow-x-auto p-4 font-mono text-[13px] leading-6"><span class="text-faint">$</span> aapt2 dump permissions app-release.apk | grep -c INTERNET
0
<span class="text-faint">$</span> tool/check_release_permissions.sh
<span class="text-steps">OK: keine INTERNET-Berechtigung im Release-APK</span></pre>
          </article>
          <article class="card flex min-w-0 flex-col p-7">
            <h3 class="text-xl font-semibold tracking-tight">{{ i18n.t('why.sub.title') }}</h3>
            <p class="mt-3 leading-7 text-muted">{{ i18n.t('why.sub.copy') }}</p>
            <p class="mt-auto pt-8 font-mono text-3xl font-semibold tracking-tight text-pulse">{{ i18n.t('why.sub.figure') }}</p>
          </article>
          <article class="card min-w-0 p-7">
            <h3 class="text-xl font-semibold tracking-tight">{{ i18n.t('why.account.title') }}</h3>
            <p class="mt-3 leading-7 text-muted">{{ i18n.t('why.account.copy') }}</p>
          </article>
          <article class="card min-w-0 p-7 lg:col-span-2">
            <h3 class="text-xl font-semibold tracking-tight">{{ i18n.t('why.clean.title') }}</h3>
            <p class="mt-3 max-w-xl leading-7 text-muted">{{ i18n.t('why.clean.copy') }}</p>
            <pre class="inset mt-6 overflow-x-auto p-4 font-mono text-[13px] leading-6"><span class="text-faint">→</span> <span class="text-pulse">69 01 01</span> 00 00 00 00 00 00 00 00 00 00 00 00 <span class="text-hrv">6b</span>  <span class="text-faint"># {{ i18n.t('why.hex.start') }}</span>
<span class="text-faint">←</span> <span class="text-pulse">69 01 00</span> <span class="text-steps">48</span> …                                  <span class="text-faint"># {{ i18n.t('why.hex.reply') }}</span></pre>
          </article>
          <article class="card grid min-w-0 gap-6 p-7 lg:col-span-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 class="text-xl font-semibold tracking-tight">{{ i18n.t('why.android.title') }}</h3>
              <p class="mt-3 max-w-2xl leading-7 text-muted">{{ i18n.t('why.android.copy') }}</p>
            </div>
            <ul class="space-y-1.5 font-mono text-xs text-muted">
              <li><span class="text-steps">✓</span> BLUETOOTH_SCAN <span class="text-faint">neverForLocation</span></li>
              <li><span class="text-steps">✓</span> BLUETOOTH_CONNECT</li>
              <li><span class="text-pulse">✕</span> INTERNET</li>
              <li><span class="text-pulse">✕</span> ACCESS_FINE_LOCATION</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <!-- App -->
    <section id="app" class="border-t hairline">
      <div class="shell grid items-center gap-14 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p class="label">{{ i18n.t('showcase.label') }}</p>
          <h2 class="headline mt-5 text-4xl sm:text-5xl">{{ i18n.t('showcase.title') }}</h2>
          <p class="lede mt-5">{{ i18n.t('showcase.copy') }}</p>
          <ul class="mt-8 grid gap-3 sm:grid-cols-2">
            @for (f of features; track f.key) {
              <li class="card flex items-center gap-3 px-4 py-3.5 text-sm"><span class="dot" [style.background]="f.color"></span>{{ i18n.t(f.key) }}</li>
            }
          </ul>
          <p class="mt-6 font-mono text-xs text-faint">{{ i18n.t('showcase.req') }}</p>
        </div>
        <div class="relative flex justify-center gap-4 sm:gap-6">
          <div class="glow absolute inset-0 -z-10 rounded-full opacity-70"></div>
          @for (shot of shots; track shot.src; let i = $index) {
            <figure class="w-[46%] max-w-[16.5rem]" [class.translate-y-10]="i === 1">
              <div class="rounded-[2.4rem] border border-white/10 bg-black p-[5px] shadow-[0_30px_80px_rgb(0_0_0/70%)]">
                <img [src]="shot.src" width="720" height="1493" loading="lazy" [alt]="i18n.t(shot.alt)" class="w-full rounded-[2.1rem]">
              </div>
              <figcaption class="label mt-4 text-center">{{ i18n.t(shot.caption) }}</figcaption>
            </figure>
          }
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="shell py-20 lg:py-28">
      <div class="card grid gap-10 p-7 sm:p-10 lg:grid-cols-[auto_1fr] lg:p-14">
        <div class="relative grid h-28 w-28 place-items-center rounded-full border-[6px] border-ink/90 font-mono text-2xl font-semibold">
          PL<span class="dot animate-beat absolute right-0 top-1 h-5! w-5! border-4 border-card bg-pulse"></span>
        </div>
        <div class="max-w-3xl">
          <p class="label">{{ i18n.t('about.label') }}</p>
          <h2 class="headline mt-5 text-4xl sm:text-5xl">{{ i18n.t('about.title') }}</h2>
          <div class="mt-6 space-y-4 text-lg leading-8 text-ink/80">
            <p>{{ i18n.t('about.p1') }}</p>
            <p>{{ i18n.t('about.p2') }}</p>
            <p>{{ i18n.t('about.p3') }}</p>
          </div>
          <div class="mt-8 flex flex-wrap items-center gap-5">
            <span class="font-mono text-sm text-muted">— {{ i18n.t('about.sign') }}</span>
            <a href="mailto:philipp.lehmann@gruppe.ai" class="btn btn-ghost btn-sm">{{ i18n.t('about.mail') }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Specs -->
    <section id="specs" class="border-t hairline">
      <div class="shell grid gap-12 py-20 lg:grid-cols-[.8fr_1.2fr] lg:py-28">
        <div>
          <p class="label">{{ i18n.t('specs.label') }}</p>
          <h2 class="headline mt-5 text-4xl sm:text-5xl">{{ i18n.t('specs.title') }}</h2>
          <img src="/img/ring-thumb.webp" width="360" height="354" loading="lazy" alt="" class="mt-10 hidden w-56 opacity-90 lg:block">
        </div>
        <dl class="border-t hairline">
          @for (row of specs; track row.key) {
            <div class="grid gap-1 border-b hairline py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <dt class="label pt-0.5">{{ i18n.t(row.key) }}</dt>
              <dd class="m-0">{{ row.value ?? i18n.t(row.key + '.value') }}</dd>
            </div>
          }
        </dl>
      </div>
    </section>

    <!-- Limits -->
    <section class="shell">
      <div class="card p-7 sm:p-10">
        <p class="label">{{ i18n.t('limits.label') }}</p>
        <h2 class="headline mt-5 text-3xl sm:text-4xl">{{ i18n.t('limits.title') }}</h2>
        <ul class="mt-8 grid gap-4 md:grid-cols-2">
          @for (key of limits; track key) {
            <li class="flex gap-3 leading-7 text-muted"><span class="font-mono text-faint">—</span>{{ i18n.t(key) }}</li>
          }
        </ul>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="shell grid gap-12 py-20 lg:grid-cols-[.8fr_1.2fr] lg:py-28">
      <div>
        <p class="label">{{ i18n.t('faq.label') }}</p>
        <h2 class="headline mt-5 text-4xl sm:text-5xl">{{ i18n.t('faq.title') }}</h2>
      </div>
      <div class="border-t hairline">
        @for (n of faq; track n) {
          <details class="group border-b hairline">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
              {{ i18n.t('faq.q' + n) }}
              <span class="font-mono text-xl text-muted transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p class="pb-6 leading-7 text-muted">
              {{ i18n.t('faq.a' + n) }}
              @if (n === 6) { <a routerLink="/widerruf" class="link ml-1">{{ i18n.t('faq.a6.link') }}</a> }
            </p>
          </details>
        }
      </div>
    </section>

    <!-- Final call to action -->
    <section class="shell">
      <div class="card relative overflow-hidden px-6 py-16 text-center sm:py-20">
        <div class="glow absolute left-1/2 top-0 -z-0 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/3 rounded-full"></div>
        <img src="/img/ring-thumb.webp" width="360" height="354" loading="lazy" alt="" class="relative mx-auto w-40">
        <h2 class="headline relative mt-8 text-4xl sm:text-6xl">{{ i18n.t('cta.title') }}</h2>
        <p class="lede relative mt-4">{{ i18n.t('cta.copy') }}</p>
        <button type="button" class="btn btn-primary relative mt-9 text-base" [disabled]="!inStock()" (click)="selected() ? buy() : pickSize()">{{ i18n.t('buy.cta') }} · {{ price() }}</button>
      </div>
    </section>
  `,
  styles: [`
    .size { cursor: pointer; border: 1px solid rgb(255 255 255 / 10%); border-radius: 14px; padding: .55rem .25rem; text-align: center; transition: border-color .15s ease, background .15s ease; }
    .size:not(:disabled):hover { border-color: rgb(255 255 255 / 28%); }
    .size.selected { border-color: var(--color-pulse); background: rgb(250 135 133 / 8%); }
    .size:disabled { cursor: not-allowed; opacity: .35; text-decoration: line-through; }
  `],
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);

  /** The R02 in every size, smallest first; each size is its own catalogue item. */
  readonly sizes = signal<Item[]>([]);
  readonly selected = signal<Item | null>(null);
  readonly loadError = signal(false);
  readonly inStock = computed(() => this.sizes().some((s) => this.available(s)));
  readonly canBuy = computed(() => {
    const s = this.selected();
    return !!s && this.available(s);
  });
  readonly price = computed(() => {
    const p = this.selected() ?? this.sizes()[0];
    return p ? money(p.price.amount, p.price.currency, this.i18n.lang()) : '— €';
  });

  readonly chips = ['hero.chip.cloud', 'hero.chip.account', 'hero.chip.sub'];
  readonly metrics: Array<{ key: string; color: string; path?: string; bars?: boolean; values?: number[] }> = [
    { key: 'measure.hr', color: 'var(--color-pulse)', path: line([64, 62, 66, 63, 71, 76, 69, 73, 66, 62, 64, 61]) },
    { key: 'measure.hrv', color: 'var(--color-hrv)', path: line([41, 44, 39, 47, 45, 50, 46, 52, 49, 53, 50, 55]) },
    { key: 'measure.stress', color: 'var(--color-stress)', path: line([30, 34, 45, 52, 41, 38, 55, 47, 36, 31, 29, 26]) },
    { key: 'measure.spo2', color: 'var(--color-spo2)', path: line([97, 98, 97, 96, 98, 97, 99, 98, 97, 98, 98, 97]) },
    { key: 'measure.steps', color: 'var(--color-steps)', bars: true, values: [1, 2, 6, 9, 4, 3, 7, 10, 5, 2] },
  ];
  /** Positions of the sensor window and the two charging pads in ring-inside.webp. */
  readonly pins = [{ n: 1, x: '50%', y: '24%' }, { n: 2, x: '37%', y: '30%' }, { n: 2, x: '63%', y: '30%' }];
  readonly insideKeys = ['inside.sensor', 'inside.pads', 'inside.motion'];
  readonly features = [
    { key: 'showcase.f1', color: 'var(--color-pulse)' },
    { key: 'showcase.f2', color: 'var(--color-hrv)' },
    { key: 'showcase.f3', color: 'var(--color-spo2)' },
    { key: 'showcase.f4', color: 'var(--color-steps)' },
  ];
  readonly shots = [
    { src: '/img/app-today.webp', alt: 'showcase.alt.today', caption: 'showcase.today' },
    { src: '/img/app-devices.webp', alt: 'showcase.alt.devices', caption: 'showcase.devices' },
  ];
  readonly specs: Array<{ key: string; value?: string }> = [
    { key: 'specs.hardware', value: 'COLMi R02' },
    { key: 'specs.firmware', value: 'RY02R_3.01.00_250611' },
    { key: 'specs.sensors' }, { key: 'specs.battery' }, { key: 'specs.charging' }, { key: 'specs.radio' },
    { key: 'specs.water' }, { key: 'specs.size' }, { key: 'specs.app' }, { key: 'specs.box' }, { key: 'specs.price' },
  ];
  readonly limits = ['limits.1', 'limits.2', 'limits.3', 'limits.4'];
  readonly faq = [1, 7, 2, 3, 4, 5, 6];

  constructor() {
    this.api.items().subscribe({
      next: (page) => {
        const sizes = page.items
          .filter((i) => i.sku.startsWith(storefrontConfig.productSkuPrefix) && ringSize(i))
          .sort((a, b) => ringSize(a)! - ringSize(b)!);
        this.sizes.set(sizes);
        if (sizes.length) this.analytics.track('product_view', { sku: storefrontConfig.productSkuPrefix.slice(0, -1), path: '/' });
      },
      error: () => this.loadError.set(true),
    });
  }

  available(item: Item): boolean { return item.inventory.stock_status === 'in_stock' || item.inventory.allow_backorder; }
  size(item: Item): number | null { return ringSize(item); }
  diameter(item: Item): string {
    const mm = Number(item.attributes?.['inner_diameter_mm']);
    return `${new Intl.NumberFormat(this.i18n.lang() === 'de' ? 'de-DE' : 'en-IE', { minimumFractionDigits: 1 }).format(mm)} mm`;
  }

  /** One ring per click is the common case, so buying goes straight to checkout. */
  buy(): void {
    const item = this.selected();
    if (!item || !this.available(item)) return;
    if (!this.cart.lines().some((line) => line.item.uuid === item.uuid)) this.cart.add(item);
    void this.router.navigateByUrl('/checkout');
  }

  pickSize(): void { void this.router.navigate([], { fragment: 'buy' }); }
}
