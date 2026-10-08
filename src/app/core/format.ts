import type { Lang } from './i18n.service';

export function money(amount: number, currency = 'EUR', lang: Lang = 'de'): string {
  const whole = amount % 100 === 0;
  return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-IE', { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2 }).format(amount / 100);
}
export function errorMessage(error: unknown): string {
  const candidate = error as { error?: { message?: string; validation_errors?: Array<{msg?:string}> }; message?: string };
  return candidate.error?.validation_errors?.[0]?.msg ?? candidate.error?.message ?? candidate.message ?? 'Something went wrong. Please try again.';
}
