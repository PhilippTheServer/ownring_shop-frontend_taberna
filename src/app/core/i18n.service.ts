import { Injectable, computed, signal } from '@angular/core';

export type Lang = 'de' | 'en';

const KEY = 'ownring-lang';

/**
 * Tiny i18n service. German is the default; the toggle persists in
 * localStorage. Keys are flat (e.g. "nav.shop"); missing keys fall back to
 * the key itself so a typo is visible rather than silent.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly langState = signal<Lang>(this.restore());
  readonly lang = this.langState.asReadonly();
  readonly isDe = computed(() => this.langState() === 'de');

  toggle(): void {
    this.langState.set(this.langState() === 'de' ? 'en' : 'de');
    localStorage.setItem(KEY, this.langState());
    document.documentElement.lang = this.langState();
  }

  t(key: string): string {
    const table = this.langState() === 'de' ? DE : EN;
    return table[key] ?? key;
  }

  private restore(): Lang {
    const stored = localStorage.getItem(KEY);
    return stored === 'en' ? 'en' : 'de';
  }
}

const DE: Record<string, string> = {
  'brand': 'OwnRing',
  'nav.home': 'Start',
  'nav.shop': 'Shop',
  'nav.account': 'Konto',
  'nav.bag': 'Tasche',
  'nav.signin': 'Anmelden',
  'footer.tagline': 'Der Smart-Ring ohne Cloud.',
  'footer.legal': 'Rechtliches',
  'footer.impressum': 'Impressum',
  'footer.privacy': 'Datenschutz',
  'footer.withdrawal': 'Widerruf',
  'footer.safety': 'Produktsicherheit (GPSR)',
  'home.eyebrow': 'Wellness-Smart-Ring',
  'home.title1': 'Deine Daten.',
  'home.title2': 'Nur bei dir.',
  'home.copy': 'Der OwnRing R02 misst Schlaf, Aktivität und Herzfrequenz — ohne Cloud, ohne Abo, ohne Konto. Alles bleibt auf deinem Gerät und in der OwnRing-App.',
  'home.cta.shop': 'Den R02 ansehen →',
  'home.cta.why': 'Warum ohne Cloud?',
  'home.price': '99 € · inkl. MwSt.',
  'home.point1.title': 'Ohne Cloud',
  'home.point1.copy': 'Keine Server, keine Abos, kein Konto. Deine Gesundheitsdaten verlassen dein Gerät nicht.',
  'home.point2.title': 'Ohne Abo',
  'home.point2.copy': 'Einmal kaufen, dauerhaft nutzen. Die App ist im Preis enthalten.',
  'home.point3.title': 'Lokal & privat',
  'home.point3.copy': 'Made for Android & GrapheneOS. Tracking, Schlaf, Herzfrequenz — alles lokal.',
  'shop.eyebrow': 'Der Shop',
  'shop.title': 'Wähle deinen OwnRing.',
  'shop.copy': 'Die Produktangaben kommen aus dem Katalog. Die endgültige Verfügbarkeit wird beim Start der Kasse gegen den Lagerbestand geprüft.',
  'shop.empty': 'Noch keine Produkte geladen.',
  'product.back': '← Zurück zum Shop',
  'product.add': 'In den Warenkorb',
  'product.unavailable': 'Derzeit nicht verfügbar',
  'product.viewbag': 'Warenkorb ansehen',
  'product.inbox': 'In der Box',
  'cart.eyebrow': 'Deine Auswahl',
  'cart.title': 'Dein Warenkorb',
  'cart.empty': 'Dein Warenkorb ist leer.',
  'cart.continue': 'Weiter einkaufen',
  'cart.checkout': 'Zur Kasse',
  'cart.total': 'Gesamt',
  'cart.remove': 'Entfernen',
  'cart.taxNote': 'Preis inkl. MwSt. (Kleinunternehmer, § 19 UStG). Der Bestand wird beim Start der Kasse geprüft und reserviert.',
  'checkout.title': 'Bestellung abschließen.',
  'checkout.customer': 'Kunde',
  'checkout.shipping': 'Lieferadresse',
  'checkout.payment': 'Zahlung',
  'checkout.street': 'Straße',
  'checkout.zip': 'PLZ',
  'checkout.city': 'Ort',
  'checkout.country': 'Land (Code)',
  'checkout.reserve': 'Bestand reservieren & weiter',
  'checkout.reserveHint': 'Beim Starten der Zahlung wird der Lagerbestand geprüft und die verfügbaren Einheiten reserviert.',
  'checkout.pay': 'Zahlen',
  'checkout.processing': 'Wird verarbeitet…',
  'checkout.summary': 'Bestellübersicht',
  'checkout.success.title': 'Zahlung eingereicht',
  'checkout.success.copy': 'Deine Bestellnummer ist',
  'checkout.success.finalize': '. Der Webhook bestätigt den Zahlungseingang.',
  'checkout.method.card': 'Karte (Stripe)',
  'checkout.method.paypal': 'PayPal',
  'checkout.sessionNote': 'Deine Zahlungssitzung wird in diesem Tab gespeichert. Du kannst die Seite verlassen und später fortsetzen.',
  'app.eyebrow': 'App laden',
  'app.title': 'Deine OwnRing-App',
  'app.copy': 'Nach dem Kauf lade die OwnRing-App, um deinen Ring einzurichten.',
  'app.android': 'Android',
  'app.ios': 'iOS',
  'app.playstore': 'Im Play Store',
  'app.apk': 'APK direkt laden',
  'app.iosNote': 'Die iOS-App ist noch nicht im App Store verfügbar.',
  'app.comingSoon': 'Bald verfügbar',
  'legal.impressum.title': 'Impressum',
  'legal.privacy.title': 'Datenschutzerklärung',
  'legal.withdrawal.title': 'Widerrufsbelehrung',
  'legal.safety.title': 'Produktsicherheit (GPSR)',
};

const EN: Record<string, string> = {
  'brand': 'OwnRing',
  'nav.home': 'Home',
  'nav.shop': 'Shop',
  'nav.account': 'Account',
  'nav.bag': 'Bag',
  'nav.signin': 'Sign in',
  'footer.tagline': 'The smart ring without a cloud.',
  'footer.legal': 'Legal',
  'footer.impressum': 'Imprint',
  'footer.privacy': 'Privacy',
  'footer.withdrawal': 'Withdrawal',
  'footer.safety': 'Product safety (GPSR)',
  'home.eyebrow': 'Wellness smart ring',
  'home.title1': 'Your data.',
  'home.title2': 'Yours alone.',
  'home.copy': 'The OwnRing R02 tracks sleep, activity and heart rate — no cloud, no subscription, no account. Everything stays on your device and in the OwnRing app.',
  'home.cta.shop': 'See the R02 →',
  'home.cta.why': 'Why no cloud?',
  'home.price': '€99 · incl. VAT',
  'home.point1.title': 'No cloud',
  'home.point1.copy': 'No servers, no subscriptions, no account. Your health data never leaves your device.',
  'home.point2.title': 'No subscription',
  'home.point2.copy': 'Buy once, keep it forever. The app is included in the price.',
  'home.point3.title': 'Local & private',
  'home.point3.copy': 'Made for Android & GrapheneOS. Tracking, sleep, heart rate — all local.',
  'shop.eyebrow': 'The shop',
  'shop.title': 'Choose your OwnRing.',
  'shop.copy': 'Catalogue details come from the item store. Final availability is checked against warehouse inventory when checkout begins.',
  'shop.empty': 'No products loaded yet.',
  'product.back': '← Back to shop',
  "product.add": 'Add to bag',
  'product.unavailable': 'Currently unavailable',
  'product.viewbag': 'View bag',
  'product.inbox': "What's in the box",
  'cart.eyebrow': 'Your selection',
  'cart.title': 'Your bag',
  'cart.empty': 'Your bag is empty.',
  'cart.continue': 'Continue shopping',
  'cart.checkout': 'Checkout',
  'cart.total': 'Total',
  'cart.remove': 'Remove',
  'cart.taxNote': 'Price includes VAT where applicable (Kleinunternehmer, § 19 UStG). Stock is verified and reserved when checkout starts.',
  'checkout.title': 'Complete your order.',
  'checkout.customer': 'Customer',
  'checkout.shipping': 'Shipping address',
  'checkout.payment': 'Payment',
  'checkout.street': 'Street',
  'checkout.zip': 'Postal code',
  'checkout.city': 'City',
  'checkout.country': 'Country (code)',
  'checkout.reserve': 'Reserve stock & continue',
  'checkout.reserveHint': 'Starting payment verifies warehouse inventory and reserves the available units.',
  'checkout.pay': 'Pay',
  'checkout.processing': 'Processing…',
  'checkout.summary': 'Order summary',
  'checkout.success.title': 'Payment submitted',
  'checkout.success.copy': 'Your order reference is',
  'checkout.success.finalize': '. The webhook will finalize the paid status.',
  'checkout.method.card': 'Card (Stripe)',
  'checkout.method.paypal': 'PayPal',
  'checkout.sessionNote': 'Your payment session is saved in this tab. You can leave and return to resume it.',
  'app.eyebrow': 'Get the app',
  'app.title': 'Get the OwnRing app',
  'app.copy': 'After purchase, download the OwnRing app to set up your ring.',
  'app.android': 'Android',
  'app.ios': 'iOS',
  'app.playstore': 'Get it on the Play Store',
  'app.apk': 'Download APK directly',
  'app.iosNote': 'The iOS app is not yet available on the App Store.',
  'app.comingSoon': 'Coming soon',
  'legal.impressum.title': 'Imprint',
  'legal.privacy.title': 'Privacy policy',
  'legal.withdrawal.title': 'Right of withdrawal',
  'legal.safety.title': 'Product safety (GPSR)',
};
