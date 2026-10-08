import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AnalyticsService } from '../core/analytics.service';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { I18nService } from '../core/i18n.service';
import { PendingCheckout, PendingCheckoutService } from '../core/pending-checkout.service';
import { Address, AddressInput, CheckoutResponse, Customer, Order } from '../models';
import { errorMessage, money } from '../core/format';
import { storefrontConfig } from '../storefront.config';

type Provider = 'stripe' | 'paypal';

interface StripeElement { mount(target: HTMLElement): void; unmount(): void; }
interface StripeElements { create(type: 'payment', options?: Record<string,unknown>): StripeElement; }
interface StripeResult { error?: { message?: string }; paymentIntent?: { status: string }; }
interface StripeClient { elements(options:{clientSecret:string;appearance?:Record<string,unknown>}):StripeElements; confirmPayment(options:{elements:StripeElements;confirmParams:{return_url:string};redirect:'if_required'}):Promise<StripeResult>; }
interface PayPalButtons { render(el: HTMLElement): void; close(): void; isRendered(): boolean; }
interface PayPalSdk { Buttons(options: Record<string, unknown>): PayPalButtons; }
declare global {
  interface Window {
    Stripe?: (key: string) => StripeClient;
    paypal?: PayPalSdk;
  }
}

/** Countries the ring ships to: the EU, Germany first. */
const SHIPPING_COUNTRIES = ['DE', 'AT', 'BE', 'BG', 'CY', 'CZ', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];

@Component({
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-6xl py-14 lg:py-20">
      <p class="label">{{ i18n.t('checkout.label') }}</p>
      <h1 class="headline mt-4 text-4xl sm:text-5xl">{{ i18n.t('checkout.title') }}</h1>
      @if (error()) { <div class="mt-7 rounded-2xl border border-pulse/30 bg-pulse/10 p-4 text-pulse" role="alert">{{ error() }}</div> }

      @if (success()) {
        <div class="card mt-10 p-10 text-center sm:p-14">
          <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-steps/15 text-2xl text-steps">✓</div>
          <h2 class="headline mt-6 text-3xl sm:text-4xl">{{ i18n.t('checkout.success.title') }}</h2>
          <p class="mt-4 text-muted">{{ i18n.t('checkout.success.copy') }} <span class="font-mono text-ink">{{ order()?.id }}</span></p>
          <p class="mt-1 text-muted">{{ i18n.t('checkout.success.finalize') }}</p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <a routerLink="/app" class="btn btn-primary">{{ i18n.t('checkout.success.app') }}</a>
            <a routerLink="/" class="btn btn-ghost">{{ i18n.t('cart.continue') }}</a>
          </div>
        </div>
      } @else if (loading()) {
        <div class="mt-10 h-96 animate-pulse rounded-[22px] bg-card"></div>
      } @else {
        <div class="mt-10 grid items-start gap-4 lg:grid-cols-[1fr_22rem]">
          <form class="space-y-4" (submit)="$event.preventDefault()">
            <section class="card p-6 sm:p-7">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="flex items-center gap-3 text-xl font-semibold tracking-tight"><span class="step">1</span>{{ i18n.t('checkout.contact') }}</h2>
                @if (guest()) {
                  <p class="text-sm text-muted">{{ i18n.t('checkout.haveAccount') }} <button type="button" class="link cursor-pointer" (click)="auth.login()">{{ i18n.t('checkout.signin') }}</button></p>
                }
              </div>
              @if (guest()) {
                <p class="mt-3 text-sm leading-6 text-muted">{{ i18n.t('checkout.guestHint') }}</p>
                <div class="mt-5 grid gap-4 sm:grid-cols-2">
                  <label class="field-label sm:col-span-2">{{ i18n.t('checkout.email') }}<input class="field mt-1.5" type="email" name="email" autocomplete="email" required [(ngModel)]="contact.email" [disabled]="paymentReady()"></label>
                  <label class="field-label">{{ i18n.t('checkout.firstName') }}<input class="field mt-1.5" name="first_name" autocomplete="given-name" required [(ngModel)]="contact.first_name" [disabled]="paymentReady()"></label>
                  <label class="field-label">{{ i18n.t('checkout.lastName') }}<input class="field mt-1.5" name="last_name" autocomplete="family-name" required [(ngModel)]="contact.last_name" [disabled]="paymentReady()"></label>
                </div>
              } @else if (customer(); as profile) {
                <div class="inset mt-5 p-4">
                  <p class="text-xs text-faint">{{ i18n.t('checkout.signedInAs') }}</p>
                  <strong class="mt-1 block">{{ profile.first_name }} {{ profile.last_name }}</strong>
                  <p class="text-sm text-muted">{{ profile.email }}</p>
                </div>
              }
            </section>

            <section class="card p-6 sm:p-7">
              <h2 class="flex items-center gap-3 text-xl font-semibold tracking-tight"><span class="step">2</span>{{ i18n.t('checkout.shipping') }}</h2>
              <div class="mt-5 grid gap-4 sm:grid-cols-[9rem_1fr]">
                <label class="field-label sm:col-span-2">{{ i18n.t('checkout.street') }}<input class="field mt-1.5" name="street" autocomplete="street-address" required [(ngModel)]="address.street" [disabled]="paymentReady()"></label>
                <label class="field-label">{{ i18n.t('checkout.zip') }}<input class="field mt-1.5" name="zip" autocomplete="postal-code" required [(ngModel)]="address.zip_code" [disabled]="paymentReady()"></label>
                <label class="field-label">{{ i18n.t('checkout.city') }}<input class="field mt-1.5" name="city" autocomplete="address-level2" required [(ngModel)]="address.city" [disabled]="paymentReady()"></label>
                <label class="field-label sm:col-span-2">{{ i18n.t('checkout.country') }}
                  <select class="field mt-1.5" name="country" autocomplete="country" [(ngModel)]="address.country" [disabled]="paymentReady()">
                    @for (c of countries(); track c.code) { <option [value]="c.code">{{ c.name }}</option> }
                  </select>
                </label>
              </div>
            </section>

            <section class="card p-6 sm:p-7">
              <h2 class="flex items-center gap-3 text-xl font-semibold tracking-tight"><span class="step">3</span>{{ i18n.t('checkout.payment') }}</h2>
              @if (!paymentReady()) {
                <div class="mt-5 grid gap-3 sm:grid-cols-2">
                  @for (p of providers; track p.id) {
                    <button type="button" class="option cursor-pointer rounded-2xl border p-4 text-left transition" [class.selected]="provider() === p.id" [attr.aria-pressed]="provider() === p.id" (click)="provider.set(p.id)">
                      <strong class="block">{{ i18n.t(p.label) }}</strong>
                      <span class="mt-1 block text-sm text-muted">{{ i18n.t(p.hint) }}</span>
                    </button>
                  }
                </div>
                <p class="mt-5 text-sm leading-6 text-muted">{{ i18n.t('checkout.reserveHint') }}</p>
                <button type="submit" class="btn btn-primary mt-5 w-full sm:w-auto" [disabled]="working() || !cart.lines().length" (click)="startCheckout()">{{ working() ? i18n.t('checkout.processing') : i18n.t('checkout.reserve') }}</button>
              } @else {
                @if (provider() === 'stripe') {
                  <div class="inset mt-6 p-4"><div #paymentElement></div></div>
                  <button type="button" class="btn btn-primary mt-5 w-full" [disabled]="working()" (click)="payStripe()">{{ working() ? i18n.t('checkout.processing') : i18n.t('checkout.pay') + ' · ' + total() }}</button>
                } @else {
                  <div class="inset mt-6 p-4"><div #paypalElement></div></div>
                }
                <p class="mt-3 text-xs text-faint">{{ i18n.t('checkout.sessionNote') }}</p>
              }
            </section>
          </form>

          <aside class="card p-6 lg:sticky lg:top-24">
            <h2 class="text-lg font-semibold tracking-tight">{{ i18n.t('checkout.summary') }}</h2>
            <div class="mt-5 space-y-4">
              @for (line of cart.lines(); track line.item.uuid) {
                <div class="flex items-center gap-4">
                  <div class="inset grid h-16 w-16 shrink-0 place-items-center p-1.5"><img src="/img/ring-thumb.webp" width="360" height="354" alt=""></div>
                  <div class="flex-1 text-sm"><p class="font-medium">{{ line.item.name }}</p><p class="font-mono text-xs text-faint">{{ line.quantity }} ×</p></div>
                  <strong class="font-mono">{{ format(line.item.price.amount * line.quantity) }}</strong>
                </div>
              }
            </div>
            <div class="mt-6 flex justify-between border-t hairline pt-4 text-sm text-muted"><span>{{ i18n.t('cart.shipping') }}</span><span>{{ i18n.t('cart.shippingFree') }}</span></div>
            <div class="mt-3 flex items-baseline justify-between"><span>{{ i18n.t('cart.total') }}</span><strong class="font-mono text-2xl">{{ total() }}</strong></div>
            <p class="mt-3 text-xs leading-5 text-faint">{{ i18n.t('cart.taxNote') }}</p>
            @if (order()) { <p class="mt-4 break-all font-mono text-[11px] text-faint">#{{ order()?.id }}</p> }
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`.option { border-color: rgb(255 255 255 / 7%); } .option.selected { border-color: var(--color-pulse); background: rgb(250 135 133 / 6%); } .step { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 999px; background: var(--color-ink); color: var(--color-on-ink); font-family: var(--font-mono); font-size: .8rem; }`],
})
export class CheckoutComponent implements OnDestroy {
  @ViewChild('paymentElement') paymentElement?: ElementRef<HTMLElement>;
  @ViewChild('paypalElement') paypalElement?: ElementRef<HTMLElement>;
  private readonly api = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);
  private readonly pending = inject(PendingCheckoutService);
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);

  readonly customer = signal<Customer | null>(null);
  readonly addresses = signal<Address[]>([]);
  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly working = signal(false);
  readonly paymentReady = signal(false);
  readonly success = signal(false);
  readonly error = signal('');
  readonly provider = signal<Provider>('stripe');
  readonly guest = computed(() => !this.auth.authenticated());
  readonly countries = computed(() => {
    const names = new Intl.DisplayNames([this.i18n.lang()], { type: 'region' });
    const [home, ...rest] = SHIPPING_COUNTRIES.map((code) => ({ code, name: names.of(code) ?? code }));
    return [home, ...rest.sort((a, b) => a.name.localeCompare(b.name))];
  });
  readonly providers: Array<{ id: Provider; label: string; hint: string }> = [
    { id: 'stripe', label: 'checkout.method.card', hint: 'checkout.method.cardHint' },
    { id: 'paypal', label: 'checkout.method.paypal', hint: 'checkout.method.paypalHint' },
  ];

  contact = { email: '', first_name: '', last_name: '' };
  address: AddressInput = { street: '', city: '', zip_code: '', country: 'DE', is_default: true };
  private defaultAddress: Address | null = null;
  private stripe: StripeClient | null = null;
  private elements: StripeElements | null = null;
  private element: StripeElement | null = null;
  private paypalButtons: PayPalButtons | null = null;

  constructor() {
    if (!this.cart.lines().length && !this.pending.get()) { void this.router.navigateByUrl('/cart'); return; }
    if (this.guest()) {
      this.loading.set(false);
      const saved = this.pending.get();
      if (saved) this.resume(saved, saved.customerId);
      return;
    }
    this.api.me().subscribe({
      next: (c) => {
        this.customer.set(c);
        this.api.addresses().subscribe({
          next: (a) => {
            this.addresses.set(a);
            this.defaultAddress = a.find((x) => x.is_default) ?? a[0] ?? null;
            if (this.defaultAddress) this.address = { street: this.defaultAddress.street, city: this.defaultAddress.city, zip_code: this.defaultAddress.zip_code, country: this.defaultAddress.country, is_default: true };
            this.loading.set(false);
            const saved = this.pending.get();
            if (saved && saved.customerId === c.id) this.resume(saved, c.id);
          },
          error: (e) => this.fail(e),
        });
      },
      error: (e) => this.fail(e),
    });
  }

  ngOnDestroy() { this.element?.unmount(); this.paypalButtons?.close(); }

  startCheckout() {
    if (!this.validAddress() || (this.guest() && !this.validContact())) { this.error.set(this.i18n.t('checkout.incomplete')); return; }
    this.working.set(true);
    this.error.set('');
    const lines = this.cart.lines().map((l) => ({ sku: l.item.sku, quantity: l.quantity }));
    if (this.guest()) {
      const { street, city, zip_code, country } = this.address;
      this.api.guestCheckout({ ...this.contact, email: this.contact.email.trim(), address: { street, city, zip_code, country: country.toUpperCase() }, items: lines, currency: 'EUR' }, this.provider())
        .subscribe({ next: (checkout) => this.begin(checkout, checkout.customer_id), error: (e) => this.fail(e) });
      return;
    }
    this.saveAddress().subscribe({
      next: () => {
        const c = this.customer()!;
        this.api.createOrder(c.id, lines).subscribe({
          next: (o) => {
            this.order.set(o);
            this.api.checkout(c.id, o.id, this.provider()).subscribe({ next: (checkout) => this.begin(checkout, c.id), error: (e) => this.fail(e) });
          },
          error: (e) => this.fail(e),
        });
      },
      error: (e) => this.fail(e),
    });
  }

  async payStripe() {
    if (!this.stripe || !this.elements) return;
    this.working.set(true);
    this.error.set('');
    const result = await this.stripe.confirmPayment({ elements: this.elements, confirmParams: { return_url: `${location.origin}/checkout` }, redirect: 'if_required' });
    if (result.error) { this.error.set(result.error.message ?? 'Payment was not completed.'); this.working.set(false); return; }
    if (result.paymentIntent?.status === 'succeeded' || result.paymentIntent?.status === 'processing') { this.pending.clear(); this.cart.clear(); this.success.set(true); }
    else this.error.set(`Payment status: ${result.paymentIntent?.status ?? 'unknown'}`);
    this.working.set(false);
  }

  private begin(checkout: CheckoutResponse, customerId: string) {
    this.order.set(checkout);
    this.analytics.track('checkout_started', { orderId: checkout.id });
    const provider = checkout.provider ?? this.provider();
    const value: PendingCheckout = { orderId: checkout.id, customerId, clientSecret: checkout.client_secret, provider, createdAt: new Date().toISOString() };
    this.pending.set(value);
    void this.mountPayment(checkout.client_secret, provider);
  }

  private resume(saved: PendingCheckout, customerId: string) {
    this.order.set({ id: saved.orderId, customer_id: customerId, currency: 'EUR', status: 'pending_payment', total_amount: this.cart.total(), created_at: saved.createdAt, updated_at: saved.createdAt });
    const provider: Provider = saved.provider === 'paypal' ? 'paypal' : 'stripe';
    this.provider.set(provider);
    void this.mountPayment(saved.clientSecret, provider);
  }

  private async mountPayment(clientSecret: string, provider: Provider) {
    try {
      if (provider === 'paypal') {
        await this.loadPayPal();
        this.paypalButtons = window.paypal!.Buttons({ clientId: storefrontConfig.paypalClientId, style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' }, createOrder: () => clientSecret, onApprove: () => this.onPaypalApprove(), onCancel: () => this.error.set('PayPal payment was cancelled.'), onError: () => this.error.set('PayPal could not be loaded. Try a card instead.') });
        this.paymentReady.set(true);
        this.working.set(false);
        setTimeout(() => { if (this.paypalElement) this.paypalButtons!.render(this.paypalElement.nativeElement); });
        return;
      }
      if (!storefrontConfig.stripePublishableKey) throw new Error('Add your Stripe publishable key to src/app/storefront.config.ts.');
      await this.loadStripe();
      this.stripe = window.Stripe!(storefrontConfig.stripePublishableKey);
      this.elements = this.stripe.elements({ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#fa8785', colorBackground: '#1c1c1f', colorText: '#f4f4f2', borderRadius: '12px', fontFamily: 'Geist, system-ui, sans-serif' } } });
      this.element = this.elements.create('payment');
      this.paymentReady.set(true);
      this.working.set(false);
      setTimeout(() => { if (this.paymentElement) this.element!.mount(this.paymentElement.nativeElement); });
    } catch (e) { this.fail(e); }
  }

  private onPaypalApprove() { this.pending.clear(); this.cart.clear(); this.success.set(true); }
  private loadStripe() { return this.loadScript('https://js.stripe.com/v3/', 'Stripe.js could not be loaded.', () => !!window.Stripe); }
  private loadPayPal() { return this.loadScript(`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(storefrontConfig.paypalClientId)}&currency=EUR&intent=capture`, 'PayPal.js could not be loaded.', () => !!window.paypal); }
  private loadScript(src: string, failure: string, loaded: () => boolean) {
    if (loaded()) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
      if (existing) { existing.addEventListener('load', () => resolve()); existing.addEventListener('error', reject); return; }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(failure));
      document.head.appendChild(script);
    });
  }
  private saveAddress() { const body = { ...this.address, country: this.address.country.toUpperCase(), is_default: true }; return this.defaultAddress ? this.api.updateAddress(this.defaultAddress.id, body) : this.api.createAddress(body); }
  private validAddress() { return !!(this.address.street.trim() && this.address.city.trim() && this.address.zip_code.trim() && this.address.country.trim().length === 2); }
  private validContact() { return !!(this.contact.email.includes('@') && this.contact.first_name.trim() && this.contact.last_name.trim()); }
  private fail(e: unknown) { this.error.set(errorMessage(e)); this.loading.set(false); this.working.set(false); }
  format(amount: number) { return money(amount, 'EUR', this.i18n.lang()); }
  total() { return this.format(this.cart.total()); }
}
