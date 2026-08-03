"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ArrowDownToLine, ArrowUpFromLine, Download } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { api } from "@/lib/api"
import { useUIStore } from "@/store/ui"
import { ProductFormSheet } from "@/components/products/ProductFormSheet"
import { StockMoveSheet } from "@/components/products/StockMoveSheet"
import type { DashboardSummary, Product } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [attention, setAttention] = useState<Product[]>([]);
  const { sheet, activeProduct, openSheet, closeSheet } = useUIStore();

  async function load() {
    const [summaryRes, lowRes, outRes] = await Promise.all([
      api.dashboard(),
      api.products.list({ stock_status: "low" }),
      api.products.list({ stock_status: "out" }),
    ]);
    setSummary(summaryRes);
    setAttention([...outRes.results, ...lowRes.results]);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <TopBar title="Stock room" subtitle="Sassy Traders · overview" />

      <div className="no-scrollbar overflow-y-auto flex-1 p-4">
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="Total products" value={summary?.total_products ?? "-"} />
          <MetricCard
            label="Inventory value"
            value={summary ? `KES ${Number(summary.inventory_value).toLocaleString()}` : "-"}
          />
          <MetricCard label="In stock" value={summary?.in_stock ?? "-"} tone="green" />
          <MetricCard label="Low stock" value={summary?.low_stock ?? "-"} tone="amber" />
          <MetricCard label="Out of stock" value={summary?.out_of_stock ?? "-"} tone="red" />
          <MetricCard
            label="Sales today"
            value={summary ? `KES ${Number(summary.today_sales).toLocaleString()}` : "-"}
          />
        </div>

        <div className="font-display text-[13px] uppercase tracking-wide text-sub font-semibold mt-5 mb-2">
          Quick actions
        </div>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction icon={<Plus size={18} />} label="Add item" onClick={() => openSheet("product")} />
          <QuickAction
            icon={<ArrowDownToLine size={18} />}
            label="Stock in"
            onClick={() => router.push("/products")}
          />
          <QuickAction
            icon={<ArrowUpFromLine size={18} />}
            label="Stock out"
            onClick={() => router.push("/products")}
          />
          <QuickAction icon={<Download size={18} />} label="Export" onClick={() => router.push("/reports")} />
        </div>

        <div className="font-display text-[13px] uppercase tracking-wide text-sub font-semibold mt-5 mb-2">
          Needs attention
        </div>
        <div className="flex flex-col gap-2">
          {attention.length === 0 && (
            <div className="font-body text-xs text-sub">Every item is above its minimum stock level.</div>
          )}
          {attention.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push("/products")}
              className="flex items-center justify-between bg-card border border-rail border-l-[3px] border-l-danger px-3 py-2.5 text-left"
            >
              <div>
                <div className="font-body text-[13px] font-semibold text-ink">{p.name}</div>
                <div className="font-mono text-[11px] text-sub mt-0.5">
                  {p.quantity} left · min {p.minimum_stock}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

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

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 bg-card border border-rail py-3 px-1 font-body text-[11px] font-semibold text-ink"
    >
      {icon}
      {label}
    </button>
  );
}
