"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.auth.login(username, password);
      setSession(token, username);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? "Wrong username or password." : "Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-paper border-t-[3px] border-tape p-6 flex flex-col gap-4">
        <div>
          <div className="font-display text-xl font-semibold uppercase text-ink">Stock room</div>
          <div className="font-body text-xs text-sub mt-1">Sign in to manage inventory</div>
        </div>

        {error && <div className="font-body text-xs text-danger">{error}</div>}

        <Field label="Username" required>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </Field>
        <Field label="Password" required>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
