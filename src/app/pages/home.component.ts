import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../core/i18n.service';

@Component({
  imports: [RouterLink], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="overflow-hidden border-b border-ink/10">
      <div class="shell grid min-h-[72vh] items-center gap-10 py-16 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <p class="eyebrow text-rust">{{ i18n.t('home.eyebrow') }}</p>
          <h1 class="mt-5 max-w-4xl font-display text-6xl font-bold leading-[.94] tracking-tight sm:text-8xl">{{ i18n.t('home.title1') }}<br><span class="italic text-moss">{{ i18n.t('home.title2') }}</span></h1>
          <p class="mt-7 max-w-xl text-lg leading-8 text-ink/70">{{ i18n.t('home.copy') }}</p>
          <div class="mt-9 flex flex-wrap items-center gap-3">
            <a routerLink="/shop" class="btn btn-primary">{{ i18n.t('home.cta.shop') }}</a>
            <a href="#why" class="btn btn-secondary">{{ i18n.t('home.cta.why') }}</a>
          </div>
          <p class="mt-6 font-display text-2xl text-ink/80">{{ i18n.t('home.price') }}</p>
        </div>
        <div class="relative mx-auto aspect-[4/5] w-full max-w-md rounded-[2.5rem] bg-moss p-7 text-cream shadow-soft">
          <div class="flex h-full flex-col justify-between rounded-[1.8rem] border border-cream/25 p-7">
            <span class="font-display text-6xl">◍</span>
            <div>
              <p class="eyebrow text-sand">R02</p>
              <p class="mt-3 font-display text-4xl italic">{{ i18n.t('footer.tagline') }}</p>
            </div>
            <p class="text-sm text-cream/70">Android · GrapheneOS</p>
          </div>
        </div>
      </div>
    </section>
    <section id="why" class="shell py-24">
      <div class="max-w-2xl">
        <p class="eyebrow text-rust">OwnRing</p>
        <h2 class="mt-4 font-display text-5xl font-bold">{{ i18n.t('home.title2') }}</h2>
      </div>
      <div class="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 md:grid-cols-3">
        @for (point of points; track point.number) {
          <article class="bg-paper p-8">
            <span class="font-display text-4xl text-rust">{{ point.number }}</span>
            <h3 class="mt-10 font-display text-2xl font-bold">{{ i18n.t(point.key + '.title') }}</h3>
            <p class="mt-3 leading-7 text-ink/65">{{ i18n.t(point.key + '.copy') }}</p>
          </article>
        }
      </div>
    </section>
  `,
})
export class HomeComponent {
  readonly i18n = inject(I18nService);
  readonly points = [
    { number: '01', key: 'home.point1' },
    { number: '02', key: 'home.point2' },
    { number: '03', key: 'home.point3' },
  ];
}
