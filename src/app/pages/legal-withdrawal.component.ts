import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';

@Component({
  imports: [], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-3xl py-16">
      <p class="eyebrow text-rust">OwnRing</p>
      <h1 class="mt-3 font-display text-5xl font-bold">{{ i18n.t('legal.withdrawal.title') }}</h1>
      <div class="mt-8 space-y-6 leading-7 text-ink/80">
        <h2 class="font-display text-2xl font-bold">Widerrufsbelehrung</h2>
        <p><strong>Widerrufsrecht</strong></p>
        <p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.</p>
        <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Philipp Lehmann, Bochum, Deutschland, E-Mail: philipp.lehmann@gruppe.ai) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das untenstehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.</p>
        <p>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>
        <p><strong>Folgen des Widerrufs</strong></p>
        <p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet. Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.</p>
        <p>Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden. Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.</p>

        <h2 class="font-display text-2xl font-bold">Muster-Widerrufsformular</h2>
        <div class="rounded-xl border border-ink/15 bg-paper p-6 text-sm">
          <p>Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.</p>
          <p class="mt-4">An: Philipp Lehmann, Bochum, Deutschland, E-Mail: philipp.lehmann@gruppe.ai</p>
          <p class="mt-4">Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*)</p>
          <p class="mt-4">Bestellt am (*) / erhalten am (*)</p>
          <p class="mt-4">Name des/der Verbraucher(s):<br>Anschrift des/der Verbraucher(s):<br>Datum und Unterschrift (nur bei Mitteilung auf Papier)</p>
          <p class="mt-4 text-ink/50">(*) Unzutreffendes streichen.</p>
        </div>
      </div>
    </section>
  `,
})
export class LegalWithdrawalComponent {
  readonly i18n = inject(I18nService);
}
