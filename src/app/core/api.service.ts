import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { Address, AddressInput, CheckoutResponse, Customer, Item, ItemPage, Order } from '../models';
import { storefrontConfig } from '../storefront.config';

// The API answers media as paths from its own root ("/v1/items/…/image"); the
// browser would resolve those against the storefront, so prefix the API root.
const apiRoot = storefrontConfig.apiUrl.replace(/\/v1\/?$/, '');
const fromApi = (path: string) => (path.startsWith('/') ? apiRoot + path : path);
const withApiMedia = (item: Item): Item => ({
  ...item,
  media: {
    ...item.media,
    main_image: item.media?.main_image && fromApi(item.media.main_image),
    gallery: (item.media?.gallery ?? []).map(fromApi),
  },
});

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = storefrontConfig.apiUrl;

  items(skip = 0, limit = 50) { return this.http.get<ItemPage>(`${this.base}/items/`, { params: new HttpParams().set('skip', skip).set('limit', limit).set('status', 'active') }).pipe(map((page) => ({ ...page, items: page.items.map(withApiMedia) }))); }
  item(id: string) { return this.http.get<Item>(`${this.base}/items/${encodeURIComponent(id)}`).pipe(map(withApiMedia)); }
  me() { return this.http.get<Customer>(`${this.base}/customers/me`); }
  updateMe(body: Partial<Pick<Customer, 'email'|'first_name'|'last_name'>>) { return this.http.patch<Customer>(`${this.base}/customers/me`, body); }
  addresses() { return this.http.get<Address[]>(`${this.base}/customers/me/addresses`); }
  createAddress(body: AddressInput) { return this.http.post<Address>(`${this.base}/customers/me/addresses`, body); }
  updateAddress(id: string, body: Partial<AddressInput>) { return this.http.patch<Address>(`${this.base}/customers/me/addresses/${id}`, body); }
  deleteAddress(id: string) { return this.http.delete<void>(`${this.base}/customers/me/addresses/${id}`); }
  createOrder(customerId: string, lines: Array<{sku:string;quantity:number}>) { return this.http.post<Order>(`${this.base}/orders/`, { items: lines, currency: 'EUR' }, { headers: { 'X-Customer-ID': customerId } }); }
  order(customerId: string, orderId: string) { return this.http.get<Order>(`${this.base}/orders/${orderId}`, { headers: { 'X-Customer-ID': customerId } }); }
  checkout(customerId: string, orderId: string, provider: 'stripe' | 'paypal' = 'stripe') { return this.http.post<CheckoutResponse>(`${this.base}/orders/${orderId}/checkout`, {}, { headers: { 'X-Customer-ID': customerId }, params: new HttpParams().set('provider', provider) }); }
  cancelOrder(customerId: string, orderId: string) { return this.http.delete<void>(`${this.base}/orders/${orderId}`, { headers: { 'X-Customer-ID': customerId } }); }
}
