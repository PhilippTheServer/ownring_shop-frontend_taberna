import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';

@Component({
  imports: [], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-3xl py-14 lg:py-20">
      <p class="label">OwnRing</p>
      <h1 class="headline mt-4 text-4xl sm:text-5xl">{{ i18n.t('legal.privacy.title') }}</h1>
      <div class="prose-legal mt-8 space-y-4">
        <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist Philipp Lehmann, Bochum, Deutschland, E-Mail: philipp.lehmann@gruppe.ai.</p>

        <h2>1. Datenverarbeitung beim Kauf</h2>
        <p>Beim Bestellvorgang verarbeiten wir die für die Abwicklung notwendigen Daten: Name, Lieferadresse, E-Mail-Adresse und die bestellten Artikel. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragsdurchführung). Diese Daten geben wir nur an die mit der Lieferung beauftragten Dienstleister weiter.</p>

        <h2>2. Zahlungsdienstleister (Stripe und PayPal)</h2>
        <p>Die Zahlung wird über <strong>Stripe</strong> (Stripe Europe s.à r.l., Luxemburg) und <strong>PayPal</strong> (PayPal (Europe) S.à r.l. et Cie, S.C.A., Luxemburg) abgewickelt. Beide sind Auftragsverarbeiter im Sinne von Art. 28 DSGVO. Sie verarbeiten die für die Zahlung notwendigen Daten (Konto- bzw. Kartendaten, Betrag, Bestellreferenz). Stripe und PayPal geben die Daten nur in dem Umfang weiter, der für die Zahlungsabwicklung erforderlich ist. Weitere Informationen: <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripe Datenschutz</a> und <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener">PayPal Datenschutz</a>.</p>

        <h2>3. Cookies und Tracking</h2>
        <p>Diese Website verwendet keine Tracking-Cookies. Für die Shop-Statistik werden Seiten- und Produktaufrufe, Warenkorb- und Checkout-Ereignisse mit einer zufälligen Sitzungskennung im sessionStorage erfasst. Die Kennung bleibt auf den jeweiligen Tab beschränkt; Checkout-Ereignisse können eine Bestellkennung enthalten. Technische Fehlerberichte enthalten Fehlermeldung, Stacktrace, Seitenpfad sowie Browserfamilie und Hauptversion. Die Daten werden auf dem eigenen Server gespeichert, nicht an einen externen Analysedienst übertragen. Fehlermeldungen können personenbezogene Angaben enthalten. Rechtsgrundlage, Einwilligung und Löschfristen müssen vor einer öffentlichen Bereitstellung geprüft und ergänzt werden.</p>

        <h2>4. Ihre Rechte</h2>
        <p>Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21). Zudem besteht ein Beschwerderecht bei der zuständigen Aufsichtsbehörde. Wenden Sie sich dazu an die oben genannte E-Mail-Adresse.</p>

        <h2>5. Speicherdauer</h2>
        <p>Bestelldaten werden bis zum Ablauf der gesetzlichen Aufbewahrungsfristen (bis zu 10 Jahre) gespeichert und danach gelöscht, sofern keine weitere gesetzliche Pflicht besteht.</p>
      </div>
    </section>
  `,
})
export class LegalPrivacyComponent {
  readonly i18n = inject(I18nService);
}
