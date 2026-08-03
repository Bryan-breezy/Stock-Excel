"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-end bg-ink/55" onClick={onClose}>
      <div
        className={cn(
          "no-scrollbar w-full max-h-[88%] overflow-y-auto bg-paper border-t-[3px] border-tape"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-rail">
          <div className="font-display text-base font-semibold uppercase text-ink">{title}</div>
          <button onClick={onClose} aria-label="Close" className="flex text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">{children}</div>

        {footer && <div className="flex gap-2 p-4 border-t border-rail">{footer}</div>}
      </div>
    </div>
  );
}
