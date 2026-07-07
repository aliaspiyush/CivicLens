"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simple hardcoded check for demonstration purposes
    if (password === "Dashboard@123") {
      // Set a simple cookie for middleware to pick up
      document.cookie = "demo_access=true; path=/; max-age=86400"; // 1 day expiry
      router.push("/mp/submissions");
      router.refresh(); // Force middleware re-evaluation
    } else {
      setLoading(false);
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 w-full h-1 border-t border-[var(--foreground)] opacity-10" />
      
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded border border-[var(--border)] bg-[var(--card)] flex items-center justify-center">
            <ShieldCheck size={24} className="text-[var(--foreground)]" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold mb-2 text-[var(--foreground)] tracking-tight">
            MP Dashboard Access
          </h1>
          <p className="text-[var(--muted)] text-sm">
            Enter the secure access phrase to view citizen submissions.
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-[var(--card)] border border-[var(--border)] p-1 rounded-lg flex items-center shadow-sm relative transition-all focus-within:border-[var(--muted)] focus-within:ring-4 focus-within:ring-gray-100">
          <div className="pl-4 pr-3 text-[var(--muted)]">
            <Lock size={18} />
          </div>
          
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Access Phrase"
            className="flex-1 py-3 px-1 bg-transparent border-none focus:outline-none text-[var(--foreground)] placeholder:text-[var(--muted)]"
            autoFocus
          />

          <button
            type="submit"
            disabled={loading || !password}
            className="m-1 flex items-center justify-center w-10 h-10 rounded bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-30 transition-all group"
          >
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-sm text-center mt-4 animate-shake">
            Incorrect access phrase. Hint: Dashboard@123
          </p>
        )}

        <div className="mt-12 text-center text-xs text-[var(--muted)] border-t border-[var(--border)] pt-6 mx-8">
          Authorized personnel only. Sessions are monitored and logged.
        </div>
      </div>
    </div>
  );
}
