import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CheckoutComponent } from './checkout.component';
import { r02, stubStorage } from '../test-fixtures';
import { routes } from '../app.routes';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';

/** Buying must never require an account: a signed-out shopper checks out as a guest. */
describe('CheckoutComponent as a guest', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    stubStorage();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: { authenticated: signal(false), login: vi.fn() } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(CartService).add(r02(11));
  });

  afterEach(() => { http.verify(); vi.unstubAllGlobals(); });

  it('is reachable without signing in', () => {
    expect(routes.find((r) => r.path === 'checkout')?.canActivate).toBeUndefined();
  });

  it('sends contact, address and cart to the guest endpoint', () => {
    const checkout = TestBed.createComponent(CheckoutComponent).componentInstance;
    checkout.contact = { email: ' ada@example.org ', first_name: 'Ada', last_name: 'Lovelace' };
    checkout.address = { street: 'Musterstr. 1', city: 'Bochum', zip_code: '44787', country: 'de', is_default: true };
    checkout.provider.set('paypal');

    checkout.startCheckout();

    const req = http.expectOne((r) => r.url === '/api/v1/orders/guest-checkout');
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('provider')).toBe('paypal');
    expect(req.request.headers.has('X-Customer-ID')).toBe(false);
    expect(req.request.body).toEqual({
      email: 'ada@example.org', first_name: 'Ada', last_name: 'Lovelace',
      address: { street: 'Musterstr. 1', city: 'Bochum', zip_code: '44787', country: 'DE' },
      items: [{ sku: 'OWNRING-R02-11', quantity: 1 }], currency: 'EUR',
    });
  });

  it('asks for missing fields instead of calling the API', () => {
    const checkout = TestBed.createComponent(CheckoutComponent).componentInstance;
    checkout.address = { street: 'Musterstr. 1', city: 'Bochum', zip_code: '44787', country: 'DE', is_default: true };

    checkout.startCheckout();

    expect(checkout.error()).not.toBe('');
  });
});
