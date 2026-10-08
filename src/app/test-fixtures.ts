import { Item } from './models';

/** The catalogue row of the one product, as the API returns it. */
export const r02 = {
  uuid: 'r02-uuid', sku: 'OWNRING-R02', status: 'active', name: 'OwnRing R02', slug: 'ownring-r02',
  price: { amount: 9900, currency: 'EUR' }, media: { main_image: null, gallery: [] },
  inventory: { stock_quantity: 5, stock_status: 'in_stock', allow_backorder: false },
  created_at: '', updated_at: '',
} as unknown as Item;

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
