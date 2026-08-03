import { cn } from "@/lib/utils";

const TONES = {
  default: { bg: "bg-card", fg: "text-ink", sub: "text-sub" },
  green: { bg: "bg-ok-bg", fg: "text-ok", sub: "text-ok" },
  amber: { bg: "bg-warn-bg", fg: "text-warn", sub: "text-warn" },
  red: { bg: "bg-danger-bg", fg: "text-danger", sub: "text-danger" },
} as const;

export function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];
  return (
    <div className={cn("border border-rail px-3.5 py-3", t.bg)}>
      <div className={cn("font-body text-[11px] uppercase tracking-wide font-semibold", t.sub)}>{label}</div>
      <div className={cn("font-mono text-xl font-semibold mt-1", t.fg)}>{value}</div>
    </div>
  );
}
