import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';
import { AppComponent } from '../app.component';
import { CartService } from '../core/cart.service';
import { Item } from '../models';
import { r02, stubStorage } from '../test-fixtures';

/**
 * The product page is the whole shop: the price must come from the catalogue
 * (not the copy), a ring can only be bought in a chosen size, and buying must
 * put exactly one ring in the cart however often the button is pressed.
 */
describe('HomeComponent', () => {
  beforeEach(() => {
    stubStorage();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
  });

  afterEach(() => vi.unstubAllGlobals());

  function render(items: Item[]) {
    const fixture = TestBed.createComponent(HomeComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((req) => req.url === '/api/v1/items/')
      .flush({ items, page_info: { page: 1, size: 50, total: items.length, pages: 1 } });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { el, click: (selector: string) => { el.querySelector<HTMLButtonElement>(selector)!.click(); fixture.detectChanges(); } };
  }

  const sizes = (el: HTMLElement) => [...el.querySelectorAll<HTMLButtonElement>('[data-testid^="size-"]')];

  it('replaces the Why section and static app screenshots with a clickable demo', () => {
    const { el } = render([r02(11)]);
    expect(el.querySelector('#why')).toBeNull();
    expect(el.querySelector('#app app-demo')).not.toBeNull();
    expect(el.querySelector('#app img')).toBeNull();
  });

  it('puts the ring and buying controls before a single app demo in the landing hero', () => {
    const { el } = render([r02(11)]);
    const hero = el.querySelector('#hero');
    expect(hero).not.toBeNull();
    const product = hero!.querySelector('[data-testid="hero-product"]');
    const demo = hero!.querySelector('#app app-demo');
    expect(product?.querySelector('img[src="/img/colmi-r02-front.webp"]')).not.toBeNull();
    expect(product?.querySelector('[data-testid="buy"]')).not.toBeNull();
    expect(demo).not.toBeNull();
    expect(el.querySelectorAll('app-demo')).toHaveLength(1);
    expect(product!.compareDocumentPosition(demo!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('uses local static COLMi product images instead of animated custom renders', () => {
    const { el } = render([r02(11)]);
    const images = [...el.querySelectorAll<HTMLImageElement>('img')];
    expect(images.map((image) => image.getAttribute('src'))).toEqual([
      '/img/colmi-r02-front.webp', '/img/colmi-r02-inside.webp',
      '/img/colmi-r02-thumb.webp', '/img/colmi-r02-thumb.webp',
    ]);
    expect(el.querySelector('.animate-float, .animate-trace')).toBeNull();
    expect(images[0].alt).toContain('COLMi R02');
    expect(images[0].getAttribute('fetchpriority')).toBe('high');
    expect(images.slice(1).every((image) => image.getAttribute('loading') === 'lazy')).toBe(true);
  });

  it('removes Why links from both the header and footer while keeping the app link', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href="/#why"]')).toBeNull();
    expect(el.querySelectorAll('a[href="/#app"]')).toHaveLength(2);
  });

  it('shows the catalogue price of the R02', () => {
    const { el } = render([r02(11, { price: { amount: 12900, currency: 'EUR' } })]);
    expect(el.querySelector('[data-testid="price"]')?.textContent?.replace(/\s/g, ' ').trim()).toBe('129 €');
  });

  it('offers sizes smallest first and blocks sold-out ones', () => {
    const soldOut = r02(11, { inventory: { stock_quantity: 0, stock_status: 'out_of_stock', allow_backorder: false } });
    const { el } = render([r02(13), soldOut, r02(8), { ...r02(9), sku: 'OTHER-9' }]);

    expect(sizes(el).map((b) => b.querySelector('span')?.textContent?.trim())).toEqual(['8', '11', '13']);
    expect(sizes(el).map((b) => b.disabled)).toEqual([false, true, false]);
  });

  it('buys only after a size is chosen, one ring of that size, then checks out', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { el, click } = render([8, 9, 10, 11, 12, 13].map((s) => r02(s)));
    const buy = () => el.querySelector<HTMLButtonElement>('[data-testid="buy"]')!;

    expect(buy().disabled).toBe(true);

    click('[data-testid="size-9"]');
    click('[data-testid="buy"]');
    click('[data-testid="buy"]');

    const lines = TestBed.inject(CartService).lines();
    expect(lines.map((l) => [l.item.sku, l.quantity])).toEqual([['OWNRING-R02-09', 1]]);
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });
});
