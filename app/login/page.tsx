"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    if (password === "Dashboard@123") {
      document.cookie = "demo_access=true; path=/; max-age=86400";
      router.push("/mp/submissions");
      router.refresh();
    } else {
      setLoading(false);
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="app-container flex flex-1 items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded border border-[var(--border)] bg-[var(--card)]">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <p className="section-eyebrow mb-3">Restricted access</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            MP Dashboard Access
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">
            Enter the secure access phrase to review citizen submissions and
            priority themes.
          </p>
        </div>

        <form onSubmit={handleLogin} className="panel p-5">
          <label
            htmlFor="accessPhrase"
            className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
          >
            Access phrase
          </label>
          <div className="relative">
            <Lock
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              aria-hidden="true"
            />
            <input
              id="accessPhrase"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter access phrase"
              className="min-h-12 w-full pl-10 pr-3 text-sm"
              aria-invalid={error}
              autoFocus
            />
          </div>

          {error && (
            <p className="mt-3 text-sm font-medium text-[var(--danger)]">
              Incorrect access phrase. Demo phrase: Dashboard@123
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="btn-primary mt-5 w-full px-4 disabled:opacity-50"
          >
            {loading ? "Checking access" : "Continue to MP portal"}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>

        <p className="mx-auto mt-6 max-w-sm text-center text-xs leading-5 text-[var(--muted)]">
          Authorized personnel only. Demo access is limited to this prototype.
        </p>
      </div>
    </div>
  );
}
