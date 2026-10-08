import type { Lang } from './i18n.service';
import type { Item } from '../models';

export function money(amount: number, currency = 'EUR', lang: Lang = 'de'): string {
  const whole = amount % 100 === 0;
  return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-IE', { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2 }).format(amount / 100);
}
/** Ring size of a catalogue item, from its attributes; null for an item without one. */
export function ringSize(item: Item): number | null {
  const size = Number(item.attributes?.['size']);
  return Number.isFinite(size) && size > 0 ? size : null;
}
/** Cart and checkout label: the product with its size, in the shopper's language. */
export function lineLabel(item: Item, t: (key: string) => string): string {
  const size = ringSize(item);
  return size ? `${t('product.name')} · ${t('size.label')} ${size}` : item.name;
}
export function errorMessage(error: unknown): string {
  const candidate = error as { error?: { message?: string; validation_errors?: Array<{msg?:string}> }; message?: string };
  return candidate.error?.validation_errors?.[0]?.msg ?? candidate.error?.message ?? candidate.message ?? 'Something went wrong. Please try again.';
}
