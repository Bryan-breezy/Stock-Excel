import { useAuthStore } from "@/store/auth"
import type {
  DashboardSummary, Paginated, Product, ProductInput,
  ReportsSummary, StockInInput, StockOutInput, Supplier, Transaction,
} from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

function getFetchImpl() {
  if (typeof globalThis.fetch === "function") {
    return globalThis.fetch.bind(globalThis);
  }

  throw new Error("Global fetch is not available in this environment.");
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const fetchImpl = getFetchImpl();
  const res = await fetchImpl(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // no body
    }
    const message =
      (body && typeof body === "object" && "detail" in (body as Record<string, unknown>)
        ? String((body as Record<string, unknown>).detail)
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, body, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const str = search.toString();
  return str ? `?${str}` : "";
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ token: string }>("/token-auth/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
  },

  products: {
    list: (params: { search?: string; category?: string; stock_status?: "low" | "out"; ordering?: string } = {}) =>
      request<Paginated<Product>>(`/products/${qs(params)}`),
    get: (id: number) => request<Product>(`/products/${id}/`),
    create: (data: Partial<ProductInput>) =>
      request<Product>("/products/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<ProductInput>) =>
      request<Product>(`/products/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/products/${id}/`, { method: "DELETE" }),
    stockIn: (id: number, data: StockInInput) =>
      request<Transaction>(`/products/${id}/stock-in/`, { method: "POST", body: JSON.stringify(data) }),
    stockOut: (id: number, data: StockOutInput) =>
      request<Transaction>(`/products/${id}/stock-out/`, { method: "POST", body: JSON.stringify(data) }),
  },

  suppliers: {
    list: () => request<Paginated<Supplier>>("/suppliers/"),
    create: (data: Partial<Supplier>) =>
      request<Supplier>("/suppliers/", { method: "POST", body: JSON.stringify(data) }),
  },

  transactions: {
    list: (params: { product?: number; type?: "IN" | "OUT"; period?: "today" | "week" | "month" } = {}) =>
      request<Paginated<Transaction>>(`/transactions/${qs(params as Record<string, string | number>)}`),
  },

  dashboard: () => request<DashboardSummary>("/dashboard/"),
  reports: () => request<ReportsSummary>("/reports/"),
  exportReport: async (format: "excel" | "pdf" | "csv") => {
    const token = useAuthStore.getState().token;
    const fetchImpl = getFetchImpl();
    const res = await fetchImpl(`${API_URL}/reports/export/?export_format=${format}`, {
      headers: {
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Export failed with status ${res.status}${text ? `: ${text}` : ""}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.style.display = "none";
    const ext = format === "excel" ? "xlsx" : format;
    a.download = `inventory_report.${ext}`;
    document.body.appendChild(a);
    a.click();

    window.setTimeout(() => {
      a.remove();
      window.URL.revokeObjectURL(url);
    }, 1000);
  },
};

