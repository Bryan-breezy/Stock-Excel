export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  supplier: number | null;
  supplier_name: string;
  buy_price: string;
  sell_price: string;
  quantity: number;
  minimum_stock: number;
  unit: string;
  image: string | null;
  description: string;
  stock_status: StockStatus;
  inventory_value: string;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Omit<
  Product,
  "id" | "supplier_name" | "stock_status" | "inventory_value" | "created_at" | "updated_at" | "quantity"
>;

export interface Transaction {
  id: number;
  product: number;
  product_name: string;
  type: "IN" | "OUT";
  quantity: number;
  balance_after: number;
  supplier: number | null;
  invoice_number: string;
  purchase_cost: string | null;
  issued_to: string;
  reason: string;
  remarks: string;
  created_by: number | null;
  created_by_username: string;
  created_at: string;
}

export interface StockInInput {
  quantity: number;
  supplier?: number | null;
  invoice_number?: string;
  purchase_cost?: number | null;
  remarks?: string;
}

export interface StockOutInput {
  quantity: number;
  issued_to?: string;
  reason?: string;
  remarks?: string;
}

export interface DashboardSummary {
  total_products: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  inventory_value: number;
  today_sales: number;
}

export interface ReportsSummary {
  current_inventory_units: number;
  inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  fast_moving: { product__name: string; total_out: number }[];
  slow_moving: { product__name: string; total_out: number }[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
