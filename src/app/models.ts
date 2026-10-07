export type ItemStatus = 'draft' | 'active' | 'archived';
export type StockStatus = 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';

export interface Money { amount: number; currency: string; includes_tax?: boolean; original_amount?: number | null; tax_class?: string; }
export interface ItemMedia { main_image?: string | null; gallery: string[]; }
export interface ItemInventory { stock_quantity: number; stock_status: StockStatus; allow_backorder: boolean; }
export interface Item {
  uuid: string; sku: string; status: ItemStatus; name: string; slug: string;
  short_description?: string | null; description?: string | null; brand?: string | null;
  price: Money; media: ItemMedia; inventory: ItemInventory;
  shipping?: { is_physical: boolean; weight?: { value: number; unit: string } | null; dimensions?: { width: number; height: number; length: number; unit: string } | null; shipping_class: string };
  attributes?: Record<string, unknown>; custom?: Record<string, unknown>; created_at: string; updated_at: string;
}
export interface PageInfo { page: number; size: number; total: number; pages: number; }
export interface ItemPage { items: Item[]; page_info: PageInfo; }
export interface Customer { id: string; keycloak_user_id: string; email: string; first_name: string; last_name: string; phone?: string | null; created_at: string; updated_at: string; }
export interface Address { id: string; customer_id: string; street: string; city: string; zip_code: string; country: string; is_default: boolean; created_at: string; updated_at: string; }
export interface AddressInput { street: string; city: string; zip_code: string; country: string; is_default: boolean; }
export interface CartLine { item: Item; quantity: number; }
export interface OrderLine { id: string; order_id: string; sku: string; quantity: number; unit_price: number; created_at: string; updated_at: string; }
export interface Order { id: string; customer_id: string; currency: string; status: 'draft'|'pending_payment'|'paid'|'ready_to_ship'|'shipped'|'cancelled'; total_amount: number; items?: OrderLine[]; created_at: string; updated_at: string; deleted_at?: string|null; }
export interface CheckoutResponse extends Order { client_secret: string; provider?: 'stripe' | 'paypal'; }
export interface ApiError { message?: string; error_code?: string; validation_errors?: Array<{ loc?: Array<string|number>; msg?: string }>; }
