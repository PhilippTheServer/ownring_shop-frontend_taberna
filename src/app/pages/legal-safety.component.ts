import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';

@Component({
  imports: [], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-3xl py-14 lg:py-20">
      <p class="label">OwnRing</p>
      <h1 class="headline mt-4 text-4xl sm:text-5xl">{{ i18n.t('legal.safety.title') }}</h1>
      <div class="prose-legal mt-8 space-y-4">
        <p>Der OwnRing R02 ist ein Wellness- und Fitness-Smart-Ring. Er misst Schlaf, Aktivität und Herzfrequenz. <strong>Er ist kein Medizinprodukt und dient nicht der Erkennung, Diagnose oder Behandlung von Krankheiten.</strong> Die angezeigten Werte sind ausschließlich für Wellness- und Fitnesszwecke bestimmt.</p>

        <h2>Hersteller / Inverkehrbringer</h2>
        <p>
          Philipp Lehmann<br>
          Bochum<br>
          Deutschland<br>
          E-Mail: philipp.lehmann@gruppe.ai
        </p>

        <h2>Produktidentifikation</h2>
        <p>
          Produkt: OwnRing R02<br>
          Typ: Wellness-Smart-Ring<br>
          Modell: R02
        </p>

        <h2>Sicherheitshinweise</h2>
        <ul class="list-disc space-y-2 pl-6">
          <li>Nicht tragen, wenn die Haut gereizt, allergisch reagiert oder verletzt ist.</li>
          <li>Bei anhaltendem Unwohlsein, Schmerzen oder Hautreaktionen die Nutzung einstellen und ärztlichen Rat einholen.</li>
          <li>Nur mit dem mitgelieferten Ladecase (USB-C) laden. Keine beschädigten Kabel verwenden.</li>
          <li>Den Ring nicht über Nacht am Körper tragen, wenn Sie dazu neigen, im Schlaf stark zu schwitzen.</li>
          <li>Ausreichend Abstand zu starken Magnetfeldern und Resonanzbildgebung (MRT) halten.</li>
          <li>Wasser- und Schweißbeständigkeit ist begrenzt; den Ring nicht in heißen Bädern, Saunen oder unter starkem Wasserdruck verwenden.</li>
          <li>Außerhalb der Reichweite von Kleinkindern aufbewahren (Verschluckungsgefahr der kleinen Teile).</li>
        </ul>

        <h2>Akkus und Entsorgung</h2>
        <p>Der Ring enthält einen wiederaufladbaren Lithium-Ionen-Akkumulator. Das Produkt und der Akkumulator dürfen nicht im Hausmüll entsorgt werden. Bitte nutzen Sie die Sammelstellen für Elektro- und Elektronikaltgeräte (ElektroG). Der Akkumulator ist gemäß der Batterieverordnung gekennzeichnet.</p>
      </div>
    </section>
  `,
})
export class LegalSafetyComponent {
  readonly i18n = inject(I18nService);
}
