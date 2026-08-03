import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/types";

const COLOR_MAP: Record<StockStatus, string> = {
  in_stock: "bg-ok",
  low_stock: "bg-warn",
  out_of_stock: "bg-danger",
};

export function Gauge({ stock, min, status }: { stock: number; min: number; status: StockStatus }) {
  const ratio = min > 0 ? stock / (min * 2) : 1;
  const filled = Math.max(0, Math.min(5, Math.round(ratio * 5)));
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn("w-[10px] h-[6px]", i < filled ? COLOR_MAP[status] : "bg-rail")} />
      ))}
    </div>
  );
}
