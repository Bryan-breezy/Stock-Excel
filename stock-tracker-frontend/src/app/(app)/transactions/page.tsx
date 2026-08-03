"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

const FILTERS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
] as const;

export default function TransactionsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("today");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.transactions.list({ period: filter }).then((res) => setTransactions(res.results));
  }, [filter]);

  return (
    <>
      <TopBar title="Stock moves" subtitle="In and out history" />

      <div className="flex gap-1.5 px-4 pt-3 pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex-1 font-body text-[11px] font-semibold py-1.5 border",
              filter === f.id ? "bg-ink text-card border-ink" : "text-ink border-rail"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar overflow-y-auto flex-1 px-4 pb-4">
        {transactions.length === 0 && (
          <div className="font-body text-sm text-sub text-center py-6">No movements in this period.</div>
        )}
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center gap-2.5 py-2.5 border-b border-rail">
            <div
              className={cn(
                "w-[30px] h-[30px] flex items-center justify-center",
                t.type === "IN" ? "bg-ok-bg" : "bg-danger-bg"
              )}
            >
              {t.type === "IN" ? (
                <ArrowDownToLine size={14} className="text-ok" />
              ) : (
                <ArrowUpFromLine size={14} className="text-danger" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body text-[13px] font-semibold text-ink">{t.product_name}</div>
              <div className="font-body text-[11px] text-sub">
                {new Date(t.created_at).toLocaleString(undefined, {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                })}{" "}
                · {t.created_by_username || "—"}
              </div>
            </div>
            <div className="text-right">
              <div className={cn("font-mono text-[13px] font-semibold", t.type === "IN" ? "text-ok" : "text-danger")}>
                {t.type === "IN" ? "+" : "-"}
                {t.quantity}
              </div>
              <div className="font-mono text-[10px] text-sub">bal {t.balance_after}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
