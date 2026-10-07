import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AnalyticsService } from '../core/analytics.service';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { I18nService } from '../core/i18n.service';
import { PendingCheckout, PendingCheckoutService } from '../core/pending-checkout.service';
import { Address, AddressInput, Customer, Order } from '../models';
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

@Component({ imports:[FormsModule,RouterLink], changeDetection:ChangeDetectionStrategy.OnPush, template:`
  <section class="shell py-14"><p class="eyebrow text-rust">Secure checkout</p><h1 class="mt-3 font-display text-6xl font-bold">{{i18n.t('checkout.title')}}</h1>
  @if(error()){<div class="mt-7 rounded-xl bg-rust/10 p-4 text-rust">{{error()}}</div>}
  @if(success()){<div class="panel mt-10 p-10 text-center"><div class="text-5xl text-moss">✓</div><h2 class="mt-4 font-display text-4xl font-bold">{{i18n.t('checkout.success.title')}}</h2><p class="mt-3 text-ink/65">{{i18n.t('checkout.success.copy')}} <span class="font-mono">{{order()?.id}}</span>{{i18n.t('checkout.success.finalize')}}</p><a routerLink="/app" class="btn btn-primary mt-7">{{i18n.t('app.title')}}</a><a routerLink="/shop" class="btn btn-secondary mt-7 ml-3">{{i18n.t('cart.continue')}}</a></div>}
  @else if(loading()){<div class="mt-10 h-96 animate-pulse rounded-2xl bg-ink/10"></div>}
  @else if(customer();as profile){<div class="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_23rem]"><div class="space-y-6">
    <section class="panel p-7"><div class="flex items-center gap-3"><span class="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-white">1</span><h2 class="font-display text-2xl font-bold">{{i18n.t('checkout.customer')}}</h2></div><div class="mt-5 rounded-xl bg-white/60 p-4"><strong>{{profile.first_name}} {{profile.last_name}}</strong><p class="text-sm text-ink/60">{{profile.email}}</p></div></section>
    <section class="panel p-7"><div class="flex items-center gap-3"><span class="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-white">2</span><h2 class="font-display text-2xl font-bold">{{i18n.t('checkout.shipping')}}</h2></div><div class="mt-5 grid gap-4"><label>{{i18n.t('checkout.street')}}<input class="field mt-1" name="street" [(ngModel)]="address.street" [disabled]="paymentReady()"></label><div class="grid grid-cols-[8rem_1fr] gap-3"><label>{{i18n.t('checkout.zip')}}<input class="field mt-1" name="zip" [(ngModel)]="address.zip_code" [disabled]="paymentReady()"></label><label>{{i18n.t('checkout.city')}}<input class="field mt-1" name="city" [(ngModel)]="address.city" [disabled]="paymentReady()"></label></div><label>{{i18n.t('checkout.country')}}<input class="field mt-1 uppercase" maxlength="2" name="country" [(ngModel)]="address.country" [disabled]="paymentReady()"></label></div></section>
    <section class="panel p-7"><div class="flex items-center gap-3"><span class="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-white">3</span><h2 class="font-display text-2xl font-bold">{{i18n.t('checkout.payment')}}</h2></div>
      @if(!paymentReady()){
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" class="rounded-xl border-2 p-4 text-left" [class.border-rust]="provider()==='stripe'" [class.border-ink/15]="provider()!=='stripe'" (click)="provider.set('stripe')"><strong class="font-display text-lg">{{i18n.t('checkout.method.card')}}</strong><p class="mt-1 text-sm text-ink/55">Visa · Mastercard · Amex</p></button>
          <button type="button" class="rounded-xl border-2 p-4 text-left" [class.border-rust]="provider()==='paypal'" [class.border-ink/15]="provider()!=='paypal'" (click)="provider.set('paypal')"><strong class="font-display text-lg">{{i18n.t('checkout.method.paypal')}}</strong><p class="mt-1 text-sm text-ink/55">PayPal Checkout</p></button>
        </div>
        <p class="mt-5 text-sm leading-6 text-ink/60">{{i18n.t('checkout.reserveHint')}}</p>
        <button class="btn btn-primary mt-5" [disabled]="working()||!cart.lines().length" (click)="startCheckout()">{{working()?'…':i18n.t('checkout.reserve')}}</button>
      }
      @else {
        @if(provider()==='stripe'){
          <div class="mt-6 rounded-xl bg-white p-4"><div #paymentElement></div></div>
          <button class="btn btn-primary mt-5 w-full" [disabled]="working()" (click)="payStripe()">{{working()?i18n.t('checkout.processing'):i18n.t('checkout.pay')+' '+total()}}</button>
        } @else {
          <div class="mt-6 rounded-xl bg-white p-4"><div #paypalElement></div></div>
        }
        <p class="mt-3 text-xs text-ink/50">{{i18n.t('checkout.sessionNote')}}</p>
      }
    </section>
  </div><aside class="panel p-6 lg:sticky lg:top-24"><h2 class="font-display text-2xl font-bold">{{i18n.t('checkout.summary')}}</h2><div class="mt-5 space-y-4">@for(line of cart.lines();track line.item.uuid){<div class="flex justify-between gap-4 text-sm"><span>{{line.quantity}} × {{line.item.name}}</span><strong>{{linePrice(line.item.price.amount,line.quantity)}}</strong></div>}</div><div class="mt-6 flex justify-between border-t border-ink/15 pt-5"><span>{{i18n.t('cart.total')}}</span><strong class="text-xl">{{total()}}</strong></div>@if(order()){<p class="mt-5 break-all text-xs text-ink/45">Order {{order()?.id}}</p>}</aside></div>}
  </section>` })
export class CheckoutComponent implements OnDestroy {
  @ViewChild('paymentElement') paymentElement?:ElementRef<HTMLElement>;
  @ViewChild('paypalElement') paypalElement?:ElementRef<HTMLElement>;
  private readonly api=inject(ApiService);private readonly analytics=inject(AnalyticsService);private readonly router=inject(Router);readonly auth=inject(AuthService);readonly cart=inject(CartService);private readonly pending=inject(PendingCheckoutService);readonly i18n=inject(I18nService);
  readonly customer=signal<Customer|null>(null);readonly addresses=signal<Address[]>([]);readonly order=signal<Order|null>(null);readonly loading=signal(true);readonly working=signal(false);readonly paymentReady=signal(false);readonly success=signal(false);readonly error=signal('');
  readonly provider=signal<Provider>('stripe');
  address:AddressInput={street:'',city:'',zip_code:'',country:'DE',is_default:true};private defaultAddress:Address|null=null;private stripe:StripeClient|null=null;private elements:StripeElements|null=null;private element:StripeElement|null=null;private paypalButtons:PayPalButtons|null=null;
  constructor(){if(!this.cart.lines().length&&!this.pending.get()){void this.router.navigateByUrl('/cart');return;}this.api.me().subscribe({next:c=>{this.customer.set(c);this.api.addresses().subscribe({next:a=>{this.addresses.set(a);this.defaultAddress=a.find(x=>x.is_default)??a[0]??null;if(this.defaultAddress)this.address={street:this.defaultAddress.street,city:this.defaultAddress.city,zip_code:this.defaultAddress.zip_code,country:this.defaultAddress.country,is_default:true};this.loading.set(false);const saved=this.pending.get();if(saved&&saved.customerId===c.id){this.order.set({id:saved.orderId,customer_id:c.id,currency:'EUR',status:'pending_payment',total_amount:this.cart.total(),created_at:saved.createdAt,updated_at:saved.createdAt});this.provider.set(saved.provider==='paypal'?'paypal':'stripe');void this.mountPayment(saved.clientSecret,saved.provider==='paypal'?'paypal':'stripe');}},error:e=>this.fail(e)});},error:e=>this.fail(e)});}
  ngOnDestroy(){this.element?.unmount();this.paypalButtons?.close();}
  startCheckout(){if(!this.validAddress()){this.error.set('Please complete the shipping address.');return;}this.working.set(true);this.error.set('');this.saveAddress().subscribe({next:()=>{const c=this.customer()!;this.api.createOrder(c.id,this.cart.lines().map(l=>({sku:l.item.sku,quantity:l.quantity}))).subscribe({next:o=>{this.order.set(o);this.api.checkout(c.id,o.id,this.provider()).subscribe({next:checkout=>{this.order.set(checkout);this.analytics.track('checkout_started',{orderId:o.id});const value:PendingCheckout={orderId:o.id,customerId:c.id,clientSecret:checkout.client_secret,provider:checkout.provider??this.provider(),createdAt:new Date().toISOString()};this.pending.set(value);void this.mountPayment(checkout.client_secret,checkout.provider??this.provider())},error:e=>this.fail(e)})},error:e=>this.fail(e)})},error:e=>this.fail(e)});}
  async payStripe(){if(!this.stripe||!this.elements)return;this.working.set(true);this.error.set('');const result=await this.stripe.confirmPayment({elements:this.elements,confirmParams:{return_url:`${location.origin}/checkout`},redirect:'if_required'});if(result.error){this.error.set(result.error.message??'Payment was not completed.');this.working.set(false);return;}if(result.paymentIntent?.status==='succeeded'||result.paymentIntent?.status==='processing'){this.pending.clear();this.cart.clear();this.success.set(true);}else this.error.set(`Payment status: ${result.paymentIntent?.status??'unknown'}`);this.working.set(false)}
  private async mountPayment(clientSecret:string,provider:Provider){try{if(provider==='paypal'){await this.loadPayPal();this.paypalButtons=window.paypal!.Buttons({clientId:storefrontConfig.paypalClientId,style:{layout:'vertical',color:'gold',shape:'pill',label:'pay'},createOrder:()=>clientSecret,onApprove:()=>this.onPaypalApprove(),onCancel:()=>this.error.set('PayPal payment was cancelled.'),onError:()=>this.error.set('PayPal could not be loaded. Try a card instead.')});this.paymentReady.set(true);this.working.set(false);setTimeout(()=>{if(this.paypalElement)this.paypalButtons!.render(this.paypalElement.nativeElement)});return;}if(!storefrontConfig.stripePublishableKey)throw new Error('Add your Stripe publishable key to src/app/storefront.config.ts.');await this.loadStripe();this.stripe=window.Stripe!(storefrontConfig.stripePublishableKey);this.elements=this.stripe.elements({clientSecret,appearance:{theme:'stripe',variables:{colorPrimary:'#20211e',borderRadius:'10px'}}});this.element=this.elements.create('payment');this.paymentReady.set(true);this.working.set(false);setTimeout(()=>{if(this.paymentElement)this.element!.mount(this.paymentElement.nativeElement)});}catch(e){this.fail(e)}}
  private onPaypalApprove(){this.pending.clear();this.cart.clear();this.success.set(true);}
  private loadStripe(){if(window.Stripe)return Promise.resolve();return new Promise<void>((resolve,reject)=>{const existing=document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]');if(existing){existing.addEventListener('load',()=>resolve());existing.addEventListener('error',reject);return;}const script=document.createElement('script');script.src='https://js.stripe.com/v3/';script.onload=()=>resolve();script.onerror=()=>reject(new Error('Stripe.js could not be loaded.'));document.head.appendChild(script);});}
  private loadPayPal(){if(window.paypal)return Promise.resolve();return new Promise<void>((resolve,reject)=>{const existing=document.querySelector<HTMLScriptElement>('script[src^="https://www.paypal.com/sdk/js"]');if(existing){existing.addEventListener('load',()=>resolve());existing.addEventListener('error',reject);return;}const script=document.createElement('script');script.src=`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(storefrontConfig.paypalClientId)}&currency=EUR&intent=capture`;script.onload=()=>resolve();script.onerror=()=>reject(new Error('PayPal.js could not be loaded.'));document.head.appendChild(script);});}
  private saveAddress(){const body={...this.address,country:this.address.country.toUpperCase(),is_default:true};return this.defaultAddress?this.api.updateAddress(this.defaultAddress.id,body):this.api.createAddress(body)}
  private validAddress(){return !!(this.address.street.trim()&&this.address.city.trim()&&this.address.zip_code.trim()&&this.address.country.trim().length===2)}
  private fail(e:unknown){this.error.set(errorMessage(e));this.loading.set(false);this.working.set(false)}
  total(){return money(this.cart.total())}linePrice(amount:number,q:number){return money(amount*q)}
}
