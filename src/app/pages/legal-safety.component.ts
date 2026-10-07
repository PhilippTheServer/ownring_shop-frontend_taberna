import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';

@Component({
  imports: [], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-3xl py-16">
      <p class="eyebrow text-rust">OwnRing</p>
      <h1 class="mt-3 font-display text-5xl font-bold">{{ i18n.t('legal.safety.title') }}</h1>
      <div class="mt-8 space-y-6 leading-7 text-ink/80">
        <p>Der OwnRing R02 ist ein Wellness- und Fitness-Smart-Ring. Er misst Schlaf, Aktivität und Herzfrequenz. <strong>Er ist kein Medizinprodukt und dient nicht der Erkennung, Diagnose oder Behandlung von Krankheiten.</strong> Die angezeigten Werte sind ausschließlich für Wellness- und Fitnesszwecke bestimmt.</p>

        <h2 class="font-display text-2xl font-bold">Hersteller / Inverkehrbringer</h2>
        <p>
          Philipp Lehmann<br>
          Bochum<br>
          Deutschland<br>
          E-Mail: philipp.lehmann@gruppe.ai
        </p>

        <h2 class="font-display text-2xl font-bold">Produktidentifikation</h2>
        <p>
          Produkt: OwnRing R02<br>
          Typ: Wellness-Smart-Ring<br>
          Modell: R02
        </p>

        <h2 class="font-display text-2xl font-bold">Sicherheitshinweise</h2>
        <ul class="list-disc space-y-2 pl-6">
          <li>Nicht tragen, wenn die Haut gereizt, allergisch reagiert oder verletzt ist.</li>
          <li>Bei anhaltendem Unwohlsein, Schmerzen oder Hautreaktionen die Nutzung einstellen und ärztlichen Rat einholen.</li>
          <li>Nur mit dem mitgelieferten Ladecase (USB-C) laden. Keine beschädigten Kabel verwenden.</li>
          <li>Den Ring nicht über Nacht am Körper tragen, wenn Sie dazu neigen, im Schlaf stark zu schwitzen.</li>
          <li>Ausreichend Abstand zu starken Magnetfeldern und Resonanzbildgebung (MRT) halten.</li>
          <li>Wasser- und Schweißbeständigkeit ist begrenzt; den Ring nicht in heißen Bädern, Saunen oder unter starkem Wasserdruck verwenden.</li>
          <li>Außerhalb der Reichweite von Kleinkindern aufbewahren (Verschluckungsgefahr der kleinen Teile).</li>
        </ul>

        <h2 class="font-display text-2xl font-bold">Akkus und Entsorgung</h2>
        <p>Der Ring enthält einen wiederaufladbaren Lithium-Ionen-Akkumulator. Das Produkt und der Akkumulator dürfen nicht im Hausmüll entsorgt werden. Bitte nutzen Sie die Sammelstellen für Elektro- und Elektronikaltgeräte (ElektroG). Der Akkumulator ist gemäß der Batterieverordnung gekennzeichnet.</p>
      </div>
    </section>
  `,
})
export class LegalSafetyComponent {
  readonly i18n = inject(I18nService);
}
