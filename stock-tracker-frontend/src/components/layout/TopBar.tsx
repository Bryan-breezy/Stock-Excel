export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-ink text-card">
      <div className="px-4 pt-4 pb-3">
        <div className="font-display text-lg font-semibold uppercase tracking-wide">{title}</div>
        {subtitle && <div className="font-body text-xs text-[#B9B4A2] mt-0.5">{subtitle}</div>}
      </div>
      <div
        className="h-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #E85D2C 0 8px, #171B1A 8px 16px)",
        }}
      />
    </div>
  );
}
