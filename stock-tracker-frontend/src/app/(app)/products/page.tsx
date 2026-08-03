"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFormSheet } from "@/components/products/ProductFormSheet";
import { StockMoveSheet } from "@/components/products/StockMoveSheet";
import { api } from "@/lib/api";
import { useUIStore } from "@/store/ui";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const CHIPS = [
  { id: "all", label: "All" },
  { id: "low", label: "Low stock" },
  { id: "out", label: "Out of stock" },
] as const;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof CHIPS)[number]["id"]>("all");
  const [loading, setLoading] = useState(true);
  const { sheet, activeProduct, openSheet, closeSheet } = useUIStore();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.products.list({
      search: query || undefined,
      stock_status: filter === "all" ? undefined : filter,
    });
    setProducts(res.results);
    setLoading(false);
  }, [query, filter]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <>
      <TopBar title="Products" subtitle={`${products.length} items tracked`} />

      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-card border border-rail px-2.5 py-2">
          <Search size={15} className="text-sub" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or SKU"
            className="font-body text-sm flex-1 bg-transparent outline-none text-ink"
          />
        </div>
        <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
          {CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={cn(
                "font-body text-[11px] font-semibold px-2.5 py-1.5 whitespace-nowrap border",
                filter === chip.id ? "bg-ink text-card border-ink" : "text-ink border-rail"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar overflow-y-auto flex-1 px-4 pb-4 flex flex-col gap-2.5">
        {!loading && products.length === 0 && (
          <div className="font-body text-sm text-sub text-center py-6">No items match that search.</div>
        )}
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onEdit={() => openSheet("product", p)}
            onStockIn={() => openSheet("stock-in", p)}
            onStockOut={() => openSheet("stock-out", p)}
          />
        ))}
      </div>

      <button
        onClick={() => openSheet("product")}
        aria-label="Add product"
        className="absolute right-[18px] bottom-[18px] w-12 h-12 bg-tape text-card flex items-center justify-center"
      >
        <Plus size={22} />
      </button>

      <ProductFormSheet open={sheet === "product"} product={activeProduct} onClose={closeSheet} onSaved={load} />
      <StockMoveSheet
        open={sheet === "stock-in" || sheet === "stock-out"}
        direction={sheet === "stock-out" ? "out" : "in"}
        product={activeProduct}
        onClose={closeSheet}
        onSaved={load}
      />
    </>
  );
}
