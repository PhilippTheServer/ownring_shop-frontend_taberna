import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';

@Component({
  imports: [], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-3xl py-16">
      <p class="eyebrow text-rust">OwnRing</p>
      <h1 class="mt-3 font-display text-5xl font-bold">{{ i18n.t('legal.impressum.title') }}</h1>
      <div class="mt-8 space-y-6 leading-7 text-ink/80">
        <h2 class="font-display text-2xl font-bold">Angaben gemäß § 5 DDG</h2>
        <p>
          Philipp Lehmann<br>
          Bochum<br>
          Deutschland
        </p>
        <h2 class="font-display text-2xl font-bold">Kontakt</h2>
        <p>E-Mail: <a class="text-moss underline" href="mailto:philipp.lehmann@gruppe.ai">philipp.lehmann@gruppe.ai</a></p>
        <h2 class="font-display text-2xl font-bold">Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br>
          <span class="text-ink/55">Kleinunternehmer gemäß § 19 UStG — es wird keine Umsatzsteuer berechnet und ausgewiesen.</span>
        </p>
        <h2 class="font-display text-2xl font-bold">EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          <a class="text-moss underline" href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr/</a>.
          Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
        <h2 class="font-display text-2xl font-bold">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
        <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </div>
    </section>
  `,
})
export class LegalImpressumComponent {
  readonly i18n = inject(I18nService);
}
