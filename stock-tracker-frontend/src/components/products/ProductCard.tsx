import { Pencil, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import type { Product } from "@/lib/types";
import { StatusBadge } from "@/components/ui/badge";
import { Gauge } from "@/components/products/Gauge";

export function ProductCard({
  product,
  onEdit,
  onStockIn,
  onStockOut,
}: {
  product: Product;
  onEdit: () => void;
  onStockIn: () => void;
  onStockOut: () => void;
}) {
  return (
    <div className="shelf-tag bg-card border border-rail pl-5 pr-3 py-3 flex gap-2">
      <div className="border-l border-dashed border-rail pl-2.5 flex-1 min-w-0">
        <div className="flex justify-between items-start gap-1.5">
          <div className="font-body text-sm font-semibold text-ink">{product.name}</div>
          <StatusBadge status={product.stock_status} />
        </div>
        <div className="font-mono text-[11px] text-sub tracking-wide mt-0.5">
          SKU {product.sku} · {product.category || "Uncategorized"}
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <div>
            <div className="font-mono text-[15px] font-semibold text-ink">
              {product.quantity} <span className="text-[11px] font-medium text-sub">{product.unit}</span>
            </div>
            <Gauge stock={product.quantity} min={product.minimum_stock} status={product.stock_status} />
          </div>
          <div className="text-right">
            <div className="font-mono text-[13px] text-ink">
              KES {Number(product.sell_price).toLocaleString()}
            </div>
            <div className="font-body text-[10px] text-sub">
              buy KES {Number(product.buy_price).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-rail">
          <div className="font-body text-[10px] text-sub">
            {product.supplier_name || "No supplier"}
          </div>
          <div className="flex gap-3">
            <button onClick={onStockIn} aria-label="Stock in" className="flex text-ok">
              <ArrowDownToLine size={14} />
            </button>
            <button onClick={onStockOut} aria-label="Stock out" className="flex text-danger">
              <ArrowUpFromLine size={14} />
            </button>
            <button onClick={onEdit} aria-label="Edit" className="flex text-ink">
              <Pencil size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
