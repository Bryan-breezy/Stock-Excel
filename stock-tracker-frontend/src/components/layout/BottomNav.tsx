"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ArrowLeftRight, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/transactions", label: "Moves", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <div className={cn("flex bg-ink border-t border-ink", className)}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-3 font-body",
              active ? "text-tape" : "text-[#8B8778]"
            )}
          >
            <Icon size={18} />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
