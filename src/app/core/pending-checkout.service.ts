import { Injectable } from '@angular/core';

export interface PendingCheckout { orderId: string; customerId: string; clientSecret: string; provider?: 'stripe' | 'paypal'; createdAt: string; }
const KEY = 'opentaberna-pending-checkout-v2';

@Injectable({ providedIn: 'root' })
export class PendingCheckoutService {
  get(): PendingCheckout | null { try { return JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as PendingCheckout|null; } catch { return null; } }
  set(value: PendingCheckout): void { sessionStorage.setItem(KEY, JSON.stringify(value)); }
  clear(): void { sessionStorage.removeItem(KEY); }
}
