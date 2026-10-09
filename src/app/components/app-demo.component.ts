import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { I18nService } from '../core/i18n.service';

const RANGES = ['day', 'week', 'month', 'year'] as const;
type DemoRange = typeof RANGES[number];
const LIVE_SAMPLES = [72, 74, 71, 73, 75, 70, 72, 69];

/** Invented readings only; never copy health data or captures into the shop. */
const METRICS = [
  { id: 'hr', unit: 'bpm', color: 'var(--color-pulse)', values: {
    day: [72, 54, 58, 57, 55, 60, 88, 84, 69, 87, 79, 76, 82, 94],
    week: [68, 72, 70, 66, 74, 69, 71], month: [70, 68, 73, 71, 67, 72, 69, 74], year: [72, 70, 69, 71, 68, 67, 70, 73, 69, 71, 68, 70],
  } },
  { id: 'hrv', unit: 'ms', color: 'var(--color-hrv)', values: {
    day: [42, 48, 54, 46, 39, 43, 51, 49, 55, 52, 58, 56],
    week: [44, 49, 46, 52, 48, 55, 51], month: [45, 48, 52, 47, 54, 50, 56, 53], year: [43, 46, 48, 45, 51, 54, 50, 47, 55, 52, 56, 54],
  } },
  { id: 'stress', unit: '', color: 'var(--color-stress)', values: {
    day: [24, 20, 18, 29, 42, 51, 38, 34, 47, 31, 26, 22],
    week: [28, 35, 31, 24, 38, 29, 26], month: [32, 28, 35, 30, 26, 34, 29, 25], year: [34, 31, 29, 33, 28, 26, 30, 32, 27, 29, 25, 28],
  } },
  { id: 'spo2', unit: '%', color: 'var(--color-spo2)', values: {
    day: [97, 98, 98, 97, 96, 98, 99, 98, 97, 98, 99, 98],
    week: [98, 97, 98, 99, 98, 97, 98], month: [97, 98, 99, 98, 97, 98, 98, 99], year: [98, 97, 98, 98, 99, 98, 97, 98, 99, 98, 97, 98],
  } },
  { id: 'steps', unit: '', color: 'var(--color-steps)', values: {
    day: [0, 0, 0, 120, 640, 1050, 420, 280, 1380, 860, 510, 960],
    week: [5200, 7100, 6400, 8300, 5900, 9200, 6220], month: [6100, 7400, 6800, 8200, 5900, 7600, 6900, 8100], year: [5800, 6200, 7100, 7600, 8200, 7900, 8600, 8100, 7200, 6800, 6100, 6400],
  } },
];

@Component({
  selector: 'app-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-[360px]">
      <p class="label mb-4 text-center text-pulse">{{ i18n.t('demo.title') }}</p>
      <section class="demo-phone" [attr.aria-label]="i18n.t('demo.title')">
        <div class="demo-scroll" tabindex="0" [attr.aria-label]="i18n.t('demo.scroll')">
          @if (screen() === 'today') {
            <p class="text-[13px] text-muted">{{ i18n.t('demo.date') }}</p>
            <h3 class="mt-1 text-[28px] font-semibold tracking-[-0.02em]">{{ i18n.t('showcase.today') }}</h3>
            <button type="button" class="demo-status" (click)="screen.set('devices')" data-testid="demo-status">
              <span class="text-steps" aria-hidden="true">▰</span> 76 % <span class="text-muted">· {{ i18n.t(synced() ? 'demo.syncedNow' : 'demo.synced') }}</span><span class="ml-auto" aria-hidden="true">›</span>
            </button>
            <div class="card p-4">
              <div class="flex items-center justify-between gap-2">
                <p class="flex items-center gap-2 text-[13px] text-muted"><span class="dot" [class.bg-pulse]="live()" [class.bg-muted]="!live()"></span>{{ i18n.t('demo.live') }}</p>
                <button type="button" class="demo-pill" [disabled]="!connected()" [attr.aria-pressed]="live()" (click)="live.set(!live())" data-testid="demo-live">{{ i18n.t(live() ? 'demo.stop' : 'demo.start') }}</button>
              </div>
              <p class="mt-4 flex items-baseline gap-2" aria-live="polite"><span class="text-[64px] font-medium leading-none tracking-[-0.04em]" [class.text-muted]="!live()" data-testid="demo-live-value">{{ live() ? liveValue() : '—' }}</span><span class="text-[15px] text-muted">bpm</span></p>
              <p class="mt-2 text-xs text-muted">{{ i18n.t(!connected() ? 'demo.disconnected' : live() ? 'demo.liveSample' : 'demo.paused') }}</p>
              <svg viewBox="0 0 280 50" class="mt-4 h-16 w-full" aria-hidden="true" data-testid="demo-live-chart">
                <polyline [attr.points]="live() ? livePoints() : '0,30 280,30'" fill="none" [attr.stroke]="live() ? 'var(--color-pulse)' : 'var(--color-faint)'" stroke-width="2" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="mt-6 flex flex-wrap items-center justify-between gap-2">
              <h4 class="text-[15px] font-semibold">{{ i18n.t('demo.metrics') }}</h4>
              <div class="demo-segment" role="group" [attr.aria-label]="i18n.t('demo.range')">
                @for (r of ranges; track r) {
                  <button type="button" [attr.aria-pressed]="range() === r" (click)="range.set(r)" [attr.data-testid]="'demo-range-' + r">{{ i18n.t('demo.' + r) }}</button>
                }
              </div>
            </div>
            <p class="my-4 text-center text-[13px] text-muted" data-testid="demo-period">{{ i18n.t('demo.period.' + range()) }}</p>
            @for (m of metrics(); track m.id) {
              <article class="card mt-3 overflow-hidden">
                <button type="button" class="demo-metric" [attr.aria-expanded]="open() === m.id" [attr.aria-controls]="'demo-chart-' + m.id" (click)="open.set(open() === m.id ? null : m.id)" [attr.data-testid]="'demo-metric-' + m.id">
                  <span class="min-w-0 text-left">
                    <span class="flex items-center gap-2 text-[13px] text-muted"><span class="dot" [style.background]="m.color"></span>{{ i18n.t('measure.' + m.id) }}</span>
                    <span class="mt-2 flex items-baseline gap-2"><span class="text-[26px] font-medium tracking-[-0.02em]" [attr.data-testid]="'demo-value-' + m.id">{{ number(m.value) }}</span> <span class="text-[13px] text-muted">{{ m.unit }}</span></span>
                  </span>
                  <svg viewBox="0 0 280 100" class="ml-auto h-8 w-20" aria-hidden="true"><polyline [attr.points]="m.points" fill="none" [attr.stroke]="m.color" stroke-width="5" stroke-linejoin="round" /></svg>
                  <span class="text-muted" aria-hidden="true">{{ open() === m.id ? '⌃' : '⌄' }}</span>
                </button>
                @if (open() === m.id) {
                  <div class="mx-4 border-t hairline pb-4 pt-3" [id]="'demo-chart-' + m.id">
                    <p class="mb-3 text-xs text-muted">{{ i18n.t(range() === 'day' ? 'demo.sample' : 'demo.dailyAverage') }}</p>
                    <svg viewBox="0 0 280 100" class="h-32 w-full" role="img" [attr.aria-label]="i18n.t('measure.' + m.id) + ' · ' + i18n.t('demo.period.' + range()) + ' · ' + i18n.t('demo.sample')">
                      <path d="M0 10 H280 M0 50 H280 M0 90 H280" stroke="var(--color-control)" stroke-dasharray="2 3" />
                      @if (m.id === 'steps') {
                        @for (bar of m.bars; track $index) { <rect [attr.x]="bar.x" [attr.y]="90 - bar.height" [attr.width]="bar.width" [attr.height]="bar.height" rx="2" [attr.fill]="m.color" /> }
                      } @else {
                        <polygon [attr.points]="'0,90 ' + m.points + ' 280,90'" [attr.fill]="m.color" opacity=".1" />
                        <polyline [attr.points]="m.points" fill="none" [attr.stroke]="m.color" stroke-width="2" stroke-linejoin="round" />
                      }
                    </svg>
                    <dl class="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      @for (stat of [{ key: 'min', value: m.min }, { key: 'avg', value: m.avg }, { key: 'max', value: m.max }]; track stat.key) {
                        <div class="inset px-1 py-3"><dt class="text-[11px] text-muted">{{ i18n.t('demo.' + stat.key) }}</dt><dd class="mt-2 flex flex-wrap items-baseline justify-center gap-1 text-[15px] font-medium"><span>{{ number(stat.value) }}</span><span class="text-[11px] text-muted">{{ m.unit }}</span></dd></div>
                      }
                    </dl>
                  </div>
                }
              </article>
            }
          } @else {
            <p class="text-xs text-muted">{{ i18n.t('demo.known') }}</p>
            <h3 class="mb-5 mt-1 text-[28px] font-semibold tracking-[-0.02em]">{{ i18n.t('showcase.devices') }}</h3>
            <article class="card p-4">
              <div class="flex flex-wrap items-center gap-3">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-inset text-3xl text-muted" aria-hidden="true">○</span>
                <div><h4 class="font-semibold">R02_DEMO</h4><p class="mt-1 flex items-center gap-2 text-xs text-muted" aria-live="polite" data-testid="demo-connection"><span class="dot" [class.bg-steps]="connected()" [class.bg-muted]="!connected()"></span>{{ i18n.t(connected() ? 'demo.connected' : 'demo.disconnected') }}</p></div>
                <button type="button" class="demo-pill ml-auto" [disabled]="!connected()" (click)="synced.set(true)" data-testid="demo-sync">{{ i18n.t('demo.sync') }}</button>
              </div>
              <div class="inset mt-4 p-4">
                <p class="text-xs text-muted">{{ i18n.t('demo.battery') }}</p><p class="mt-2 text-4xl">76 %</p>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-control"><div class="h-full w-[76%] bg-steps"></div></div>
              </div>
              <dl class="inset mt-4 divide-y divide-white/5 text-xs">
                <div class="p-4"><dt class="text-muted">{{ i18n.t('demo.firmware') }}</dt><dd class="mt-2 break-all font-mono">RY02R_3.01.00_250611</dd></div>
                <div class="flex justify-between gap-2 p-4"><dt class="text-muted">{{ i18n.t('demo.lastSync') }}</dt><dd aria-live="polite">{{ i18n.t(synced() ? 'demo.now' : 'demo.minuteAgo') }}</dd></div>
                <div class="p-4"><dt class="text-muted">{{ i18n.t('demo.metrics') }}</dt><dd class="mt-2 leading-5">{{ i18n.t('demo.schedule') }}</dd></div>
              </dl>
              <button type="button" class="demo-pill mt-4 w-full py-3!" (click)="toggleConnection()" data-testid="demo-connect">{{ i18n.t(connected() ? 'demo.disconnect' : 'demo.connect') }}</button>
            </article>
            <div class="card mt-3 flex flex-wrap items-center justify-between gap-2 p-4">
              <p class="text-sm text-muted">{{ i18n.t('demo.language') }}</p>
              <div class="demo-segment" role="group" [attr.aria-label]="i18n.t('demo.language')">
                @for (lang of ['de', 'en']; track lang) {
                  <button type="button" [attr.aria-pressed]="i18n.lang() === lang" (click)="i18n.lang() !== lang && i18n.toggle()" [attr.data-testid]="'demo-lang-' + lang">{{ lang === 'de' ? 'Deutsch' : 'English' }}</button>
                }
              </div>
            </div>
            <p class="mt-5 text-center text-xs leading-5 text-muted">{{ i18n.t('demo.description') }}</p>
          }
        </div>
        <nav class="demo-nav" [attr.aria-label]="i18n.t('demo.navigation')">
          @for (tab of ['today', 'devices']; track tab) {
            <button type="button" [attr.aria-pressed]="screen() === tab" (click)="screen.set(tab)" [attr.data-testid]="'demo-tab-' + tab">{{ i18n.t('showcase.' + tab) }}</button>
          }
        </nav>
      </section>
      <p class="mt-5 text-center text-sm leading-6 text-muted">{{ i18n.t('demo.hint') }}</p>
      <p class="mt-2 text-center text-xs leading-5 text-muted">{{ i18n.t('demo.description') }}</p>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .demo-phone { border: 6px solid #232327; border-radius: 2.5rem; overflow: hidden; background: var(--color-screen); box-shadow: 0 30px 80px rgb(0 0 0 / 60%); }
    .demo-scroll { height: 640px; overflow-y: auto; padding: 22px 14px; scrollbar-width: thin; scrollbar-color: var(--color-control) transparent; overscroll-behavior-y: contain; }
    .demo-status { display: flex; align-items: center; gap: 7px; width: 100%; padding: 16px 2px; text-align: left; font-size: 11px; cursor: pointer; }
    .demo-pill { border-radius: 999px; padding: 9px 13px; background: var(--color-control); font-size: 12px; cursor: pointer; }
    .demo-pill:disabled { opacity: .4; cursor: not-allowed; }
    .demo-segment { display: flex; padding: 3px; border-radius: 999px; background: var(--color-card); }
    .demo-segment button { border-radius: 999px; padding: 7px 10px; font-size: 11px; color: var(--color-muted); cursor: pointer; }
    .demo-segment button[aria-pressed="true"] { background: var(--color-control); color: var(--color-ink); }
    .demo-metric { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; cursor: pointer; }
    .demo-nav { display: flex; border-top: 1px solid var(--color-control); padding: 10px; }
    .demo-nav button { position: relative; flex: 1; padding: 16px 8px 8px; font-size: 13px; color: var(--color-muted); cursor: pointer; }
    .demo-nav button[aria-pressed="true"] { color: var(--color-ink); }
    .demo-nav button[aria-pressed="true"]::before { content: ''; position: absolute; top: 3px; left: calc(50% - 8px); width: 16px; height: 2px; border-radius: 2px; background: var(--color-ink); }
  `],
})
export class AppDemoComponent {
  readonly i18n = inject(I18nService);
  readonly screen = signal('today');
  readonly range = signal<DemoRange>('day');
  readonly open = signal<string | null>('hr');
  readonly connected = signal(true);
  readonly synced = signal(false);
  readonly live = signal(false);
  readonly ranges = RANGES;
  private readonly liveSample = signal(0);
  readonly liveValue = computed(() => LIVE_SAMPLES[this.liveSample() % LIVE_SAMPLES.length]);
  readonly livePoints = computed(() => LIVE_SAMPLES.map((_, index) =>
    `${index * 280 / (LIVE_SAMPLES.length - 1)},${44 - (LIVE_SAMPLES[(index + this.liveSample()) % LIVE_SAMPLES.length] - 60) * 2}`,
  ).join(' '));

  /** Advances invented readings every 3.5 seconds; cleans up on stop or destruction. */
  constructor() {
    effect((onCleanup) => {
      if (!this.live()) return;
      this.liveSample.set(0);
      const timer = setInterval(() => this.liveSample.update((index) => index + 1), 3500);
      onCleanup(() => clearInterval(timer));
    });
  }

  /** Summaries and chart coordinates derived from the selected sample period. */
  readonly metrics = computed(() => METRICS.map((metric) => {
    const values = metric.values[this.range()];
    const min = Math.min(...values), max = Math.max(...values);
    const sum = values.reduce((total, value) => total + value, 0);
    const avg = Math.round(sum / values.length);
    const span = max - min || 1;
    return {
      ...metric, min, max, avg,
      value: this.range() !== 'day' ? avg : metric.id === 'steps' ? sum : values[values.length - 1],
      points: values.map((value, index) => `${index * 280 / (values.length - 1)},${90 - (value - min) / span * 80}`).join(' '),
      bars: values.map((value, index) => ({ x: index * 280 / values.length + 2, width: 280 / values.length - 4, height: value / (max || 1) * 80 })),
    };
  }));

  /** Formats a sample reading in the shop's selected language. */
  number(value: number): string { return new Intl.NumberFormat(this.i18n.lang()).format(value); }

  /** Simulates connecting or disconnecting; disconnecting also stops live pulse. */
  toggleConnection(): void {
    this.connected.update((connected) => !connected);
    if (!this.connected()) this.live.set(false);
  }
}
