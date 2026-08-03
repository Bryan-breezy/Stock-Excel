"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { BottomNav } from "@/components/layout/BottomNav";

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
    <div className="flex justify-center py-6 min-h-screen bg-ink">
      <div className="w-[380px] h-[780px] bg-paper relative border-[10px] border-ink rounded-[36px] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex-1 min-h-0 flex flex-col relative">{children}</div>
        <BottomNav />
      </div>
    </div>
  );
}
