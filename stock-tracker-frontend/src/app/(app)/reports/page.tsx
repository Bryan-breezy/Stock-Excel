"use client"

import { useEffect, useState } from "react"
import { Boxes, CircleDollarSign, TrendingUp, AlertTriangle, Download } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { api } from "@/lib/api"
import type { ReportsSummary } from "@/lib/types"

export default function ReportsPage() {
  const [report, setReport] = useState<ReportsSummary | null>(null)

  useEffect(() => {
    api.reports().then(setReport)
  }, [])

  const rows = report
    ? [
        { label: "Current inventory units", value: report.current_inventory_units, icon: <Boxes size={16} /> },
        {
          label: "Inventory value",
          value: `KES ${Number(report.inventory_value).toLocaleString()}`,
          icon: <CircleDollarSign size={16} />,
        },
        {
          label: "Fastest moving",
          value: report.fast_moving[0]?.product__name ?? "No sales yet",
          icon: <TrendingUp size={16} />,
        },
        {
          label: "Needs reordering",
          value: `${report.low_stock_count + report.out_of_stock_count} items`,
          icon: <AlertTriangle size={16} />,
        },
      ]
    : [];

  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = async (format: "excel" | "pdf" | "csv") => {
    try {
      setExportingFormat(format);
      await api.exportReport(format);
    } catch (err) {
      console.error("Failed to export report", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to download export file. ${message}`);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <>
      <TopBar title="Reports" subtitle="Summary and export" />

      <div className="no-scrollbar overflow-y-auto flex-1 p-4">
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2.5 bg-card border border-rail px-3.5 py-3">
              <div className="text-tape flex">{r.icon}</div>
              <div className="font-body text-xs text-sub flex-1">{r.label}</div>
              <div className="font-mono text-sm font-semibold text-ink">{r.value}</div>
            </div>
          ))}
        </div>

        <div className="font-display text-[13px] uppercase tracking-wide text-sub font-semibold mt-5 mb-2">
          Export
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Excel", format: "excel" as const },
            { label: "PDF", format: "pdf" as const },
            { label: "CSV", format: "csv" as const },
          ].map(({ label, format }) => (
            <button
              key={format}
              disabled={exportingFormat !== null}
              onClick={() => handleExport(format)}
              className="flex flex-col items-center gap-1.5 bg-card border border-rail py-3 px-1 font-body text-xs font-semibold text-ink hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <Download size={16} className={exportingFormat === format ? "animate-bounce" : ""} />
              {exportingFormat === format ? "Saving..." : label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

}
