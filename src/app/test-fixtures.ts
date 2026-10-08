import { Item } from './models';

/** The catalogue row of the R02 in one ring size, as the API returns it. */
export function r02(size = 11, overrides: Partial<Item> = {}): Item {
  return {
    uuid: `r02-${size}`, sku: `OWNRING-R02-${String(size).padStart(2, '0')}`, status: 'active', name: `OwnRing R02 (Größe ${size})`, slug: `ownring-r02-${size}`,
    price: { amount: 9900, currency: 'EUR' }, media: { main_image: null, gallery: [] },
    inventory: { stock_quantity: 5, stock_status: 'in_stock', allow_backorder: false },
    attributes: { size, inner_diameter_mm: 20.6 },
    created_at: '', updated_at: '',
    ...overrides,
  } as Item;
}

/** In-memory Web Storage: Node 25+ shadows jsdom's localStorage with an unusable global. */
export function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => { data.delete(key); },
    setItem: (key, value) => { data.set(key, String(value)); },
  };
}

export function stubStorage(): void {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
}
