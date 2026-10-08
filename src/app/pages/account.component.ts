import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Address, AddressInput, Customer } from '../models';
import { errorMessage } from '../core/format';

@Component({
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shell max-w-5xl py-14 lg:py-20">
      <div class="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p class="label">{{ i18n.t('account.label') }}</p>
          <h1 class="headline mt-4 text-4xl sm:text-5xl">{{ i18n.t('account.hello') }}, {{ customer()?.first_name || auth.displayName() }}.</h1>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn btn-ghost btn-sm" (click)="auth.accountManagement()">{{ i18n.t('account.settings') }}</button>
          <button type="button" class="btn btn-primary btn-sm" (click)="auth.logout()">{{ i18n.t('account.signout') }}</button>
        </div>
      </div>
      @if (error()) { <div class="mt-8 rounded-2xl border border-pulse/30 bg-pulse/10 p-4 text-pulse" role="alert">{{ error() }}</div> }

      @if (customer(); as profile) {
        <div class="mt-10 grid gap-4 lg:grid-cols-2">
          <section class="card p-7">
            <h2 class="text-xl font-semibold tracking-tight">{{ i18n.t('account.profile') }}</h2>
            <dl class="mt-6 grid gap-5">
              <div><dt class="label">{{ i18n.t('account.name') }}</dt><dd class="m-0 mt-1.5">{{ profile.first_name }} {{ profile.last_name }}</dd></div>
              <div><dt class="label">{{ i18n.t('account.email') }}</dt><dd class="m-0 mt-1.5">{{ profile.email }}</dd></div>
              <div><dt class="label">{{ i18n.t('account.customerId') }}</dt><dd class="m-0 mt-1.5 break-all font-mono text-sm text-muted">{{ profile.id }}</dd></div>
            </dl>
            <p class="mt-6 text-sm leading-6 text-faint">{{ i18n.t('account.synced') }}</p>
          </section>

          <section class="card p-7">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold tracking-tight">{{ i18n.t('account.addresses') }}</h2>
              <button type="button" class="btn btn-ghost btn-sm" (click)="newAddress()">{{ i18n.t('account.add') }}</button>
            </div>
            @if (!addresses().length) { <p class="mt-6 text-muted">{{ i18n.t('account.none') }}</p> }
            @for (address of addresses(); track address.id) {
              <article class="inset mt-4 p-5">
                <div class="flex justify-between gap-3">
                  <address class="not-italic leading-6">{{ address.street }}<br>{{ address.zip_code }} {{ address.city }}<br>{{ address.country }}</address>
                  @if (address.is_default) { <span class="h-fit rounded-full bg-steps/15 px-2.5 py-1 font-mono text-[11px] text-steps">{{ i18n.t('account.default') }}</span> }
                </div>
                <div class="mt-4 flex gap-5 text-sm">
                  <button type="button" class="cursor-pointer text-muted hover:text-ink" (click)="editAddress(address)">{{ i18n.t('account.edit') }}</button>
                  <button type="button" class="cursor-pointer text-muted hover:text-pulse" (click)="removeAddress(address)">{{ i18n.t('account.delete') }}</button>
                </div>
              </article>
            }
          </section>
        </div>
      }

      @if (editing()) {
        <div class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" (click)="closeEditor()">
          <form class="card w-full max-w-lg p-7" (submit)="saveAddress(); $event.preventDefault()" (click)="$event.stopPropagation()">
            <h2 class="text-2xl font-semibold tracking-tight">{{ editingId() ? i18n.t('account.editTitle') : i18n.t('account.addTitle') }}</h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-[9rem_1fr]">
              <label class="field-label sm:col-span-2">{{ i18n.t('checkout.street') }}<input class="field mt-1.5" required name="street" [(ngModel)]="form.street"></label>
              <label class="field-label">{{ i18n.t('checkout.zip') }}<input class="field mt-1.5" required name="zip" [(ngModel)]="form.zip_code"></label>
              <label class="field-label">{{ i18n.t('checkout.city') }}<input class="field mt-1.5" required name="city" [(ngModel)]="form.city"></label>
              <label class="field-label sm:col-span-2">{{ i18n.t('checkout.country') }}<input class="field mt-1.5 uppercase" required maxlength="2" name="country" [(ngModel)]="form.country"></label>
              <label class="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="default" class="accent-pulse" [(ngModel)]="form.is_default"> {{ i18n.t('account.makeDefault') }}</label>
            </div>
            <div class="mt-7 flex justify-end gap-2">
              <button type="button" class="btn btn-ghost btn-sm" (click)="closeEditor()">{{ i18n.t('account.cancel') }}</button>
              <button class="btn btn-primary btn-sm" [disabled]="saving()">{{ saving() ? i18n.t('account.saving') : i18n.t('account.save') }}</button>
            </div>
          </form>
        </div>
      }
    </section>
  `,
})
export class AccountComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  readonly customer = signal<Customer | null>(null);
  readonly addresses = signal<Address[]>([]);
  readonly error = signal('');
  readonly editing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  form: AddressInput = { street: '', city: '', zip_code: '', country: 'DE', is_default: false };

  constructor() { this.load(); }
  load() { this.api.me().subscribe({ next: (c) => { this.customer.set(c); this.loadAddresses(); }, error: (e) => this.error.set(errorMessage(e)) }); }
  loadAddresses() { this.api.addresses().subscribe({ next: (a) => this.addresses.set(a), error: (e) => this.error.set(errorMessage(e)) }); }
  newAddress() { this.form = { street: '', city: '', zip_code: '', country: 'DE', is_default: !this.addresses().length }; this.editingId.set(null); this.editing.set(true); }
  editAddress(a: Address) { this.form = { street: a.street, city: a.city, zip_code: a.zip_code, country: a.country, is_default: a.is_default }; this.editingId.set(a.id); this.editing.set(true); }
  closeEditor() { this.editing.set(false); }
  saveAddress() {
    this.saving.set(true);
    const request = this.editingId() ? this.api.updateAddress(this.editingId()!, this.form) : this.api.createAddress(this.form);
    request.subscribe({ next: () => { this.saving.set(false); this.closeEditor(); this.loadAddresses(); }, error: (e) => { this.saving.set(false); this.error.set(errorMessage(e)); } });
  }
  removeAddress(a: Address) {
    if (!confirm(`${this.i18n.t('account.deleteConfirm')}\n${a.street}`)) return;
    this.api.deleteAddress(a.id).subscribe({ next: () => this.loadAddresses(), error: (e) => this.error.set(errorMessage(e)) });
  }
}
