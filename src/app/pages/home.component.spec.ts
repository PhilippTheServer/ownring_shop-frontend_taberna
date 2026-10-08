import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';
import { CartService } from '../core/cart.service';
import { Item } from '../models';
import { r02, stubStorage } from '../test-fixtures';

/**
 * The product page is the whole shop: the price must come from the catalogue
 * (not the copy), and buying must put exactly one ring in the cart however
 * often the button is pressed.
 */
describe('HomeComponent', () => {
  beforeEach(() => {
    stubStorage();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
  });

  afterEach(() => vi.unstubAllGlobals());

  function render(item: Item = r02) {
    const fixture = TestBed.createComponent(HomeComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((req) => req.url === '/api/v1/items/')
      .flush({ items: [item], page_info: { page: 1, size: 10, total: 1, pages: 1 } });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the catalogue price of the R02', () => {
    const el = render({ ...r02, price: { amount: 12900, currency: 'EUR' } });
    expect(el.querySelector('[data-testid="price"]')?.textContent?.replace(/\s/g, ' ').trim()).toBe('129 €');
  });

  it('puts one R02 in the cart and goes to checkout', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const el = render();
    const buy = el.querySelector<HTMLButtonElement>('[data-testid="buy"]')!;

    buy.click();
    buy.click();

    const lines = TestBed.inject(CartService).lines();
    expect(lines.map((l) => [l.item.sku, l.quantity])).toEqual([['OWNRING-R02', 1]]);
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });

  it('disables buying when the ring is out of stock', () => {
    const el = render({ ...r02, inventory: { stock_quantity: 0, stock_status: 'out_of_stock', allow_backorder: false } });
    expect(el.querySelector<HTMLButtonElement>('[data-testid="buy"]')!.disabled).toBe(true);
  });
});
