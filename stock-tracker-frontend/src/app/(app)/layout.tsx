"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { BottomNav } from "@/components/layout/BottomNav";
import { SidebarNav } from "@/components/layout/SidebarNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !token) router.replace("/login");
  }, [mounted, token, router]);

  if (!mounted || !token) return null;

  return (
    <div className="min-h-screen bg-ink md:flex">
      {/* Sidebar — desktop/tablet only */}
      <SidebarNav className="hidden md:flex" />

      {/* Content area */}
      <div className="flex justify-center py-0 md:py-8 md:flex-1 md:overflow-y-auto">
        <div
          className="
            w-full h-screen bg-paper relative overflow-hidden flex flex-col
            border-0 rounded-none shadow-none
            sm:w-[380px] sm:h-[780px] sm:border-[10px] sm:border-ink sm:rounded-[36px] sm:shadow-2xl sm:my-6
            md:w-full md:h-full md:max-w-5xl md:border-0 md:rounded-2xl md:shadow-xl md:my-0
          "
        >
          <div className="flex-1 min-h-0 flex flex-col relative">{children}</div>
          <BottomNav className="md:hidden" />
        </div>
      </div>
    </div>
  );
}
