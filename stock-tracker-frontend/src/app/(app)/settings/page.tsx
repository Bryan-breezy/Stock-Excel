"use client";

import { ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";

function SettingsRow({ label, value }: { label: string; value?: string }) {
  return (
    <button className="flex items-center justify-between w-full py-3 border-b border-rail text-left">
      <span className="font-body text-sm text-ink font-medium">{label}</span>
      <span className="flex items-center gap-1.5">
        {value && <span className="font-mono text-xs text-sub">{value}</span>}
        <ChevronRight size={14} className="text-sub" />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const { username, clearSession } = useAuthStore();

  return (
    <>
      <TopBar title="Settings" subtitle="Business and system" />

      <div className="no-scrollbar overflow-y-auto flex-1 px-4 pb-4">
        <div className="font-display text-xs uppercase tracking-wide text-sub font-semibold mt-3 mb-1">
          Business
        </div>
        <SettingsRow label="Company name" value="Sassy Traders" />
        <SettingsRow label="Logo" />
        <SettingsRow label="Currency" value="KES" />
        <SettingsRow label="Low stock threshold" value="Per item" />

        <div className="font-display text-xs uppercase tracking-wide text-sub font-semibold mt-5 mb-1">
          System
        </div>
        <SettingsRow label="Signed in as" value={username ?? ""} />
        <SettingsRow label="Backup" value="Auto, daily" />
        <SettingsRow label="Notifications" value="On" />

        <Button variant="secondary" className="w-full mt-6" onClick={clearSession}>
          Sign out
        </Button>
      </div>
    </>
  );
}
