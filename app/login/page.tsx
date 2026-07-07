"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Login error:", error);
      alert("Error logging in");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-8 rounded-lg flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">MP Dashboard Access</h1>
          <p className="text-[var(--muted)] text-sm">
            Official portal for Members of Parliament and authorized staff.
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[var(--foreground)] text-[var(--background)] rounded font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Connecting..." : "Sign in with Google"}
        </button>

        <p className="text-xs text-[var(--muted)] text-center">
          Access is restricted to authorized government credentials.
        </p>
      </div>
    </div>
  );
}
