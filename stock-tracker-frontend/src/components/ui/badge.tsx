import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/types";

const STATUS_MAP: Record<StockStatus, { label: string; className: string }> = {
  in_stock: { label: "In stock", className: "bg-ok-bg text-ok" },
  low_stock: { label: "Low stock", className: "bg-warn-bg text-warn" },
  out_of_stock: { label: "Out of stock", className: "bg-danger-bg text-danger" },
};

export function StatusBadge({ status }: { status: StockStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span className={cn("font-body text-[10px] font-semibold px-1.5 py-0.5 whitespace-nowrap", s.className)}>
      {s.label}
    </span>
  );
}
