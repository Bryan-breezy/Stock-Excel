"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ArrowLeftRight, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/moves", label: "Moves", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-56 shrink-0 flex-col border-r border-rail bg-ink px-3 py-6",
        className
      )}
    >
      <div className="font-display text-lg font-bold text-paper px-3 mb-8">
        Stock Room
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-semibold transition-colors",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-sub hover:bg-paper/5 hover:text-paper"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
