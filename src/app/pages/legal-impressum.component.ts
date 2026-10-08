import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';

@Component({
  imports: [], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-3xl py-14 lg:py-20">
      <p class="label">OwnRing</p>
      <h1 class="headline mt-4 text-4xl sm:text-5xl">{{ i18n.t('legal.impressum.title') }}</h1>
      <div class="prose-legal mt-8 space-y-4">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          Philipp Lehmann<br>
          Bochum<br>
          Deutschland
        </p>
        <h2>Kontakt</h2>
        <p>E-Mail: <a href="mailto:philipp.lehmann@gruppe.ai">philipp.lehmann@gruppe.ai</a></p>
        <h2>Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br>
          <span class="text-muted">Kleinunternehmer gemäß § 19 UStG — es wird keine Umsatzsteuer berechnet und ausgewiesen.</span>
        </p>
        <h2>EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr/</a>.
          Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
        <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
        <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </div>
    </section>
  `,
})
export class LegalImpressumComponent {
  readonly i18n = inject(I18nService);
}
