"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else if (data?.user?.identities?.length === 0) {
        setMessage({ text: "This email is already registered. Please sign in.", type: "error" });
      } else {
        setMessage({ text: "Success! Please check your email to confirm your account (if email confirmations are enabled in Supabase). If disabled, you can log in directly.", type: "success" });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        router.push("/mp/submissions");
        router.refresh();
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm border border-[var(--border)] bg-[var(--card)] p-8 rounded flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2 text-[var(--foreground)]">MP Dashboard Access</h1>
          <p className="text-[var(--muted)] text-sm">
            Official portal for Members of Parliament and authorized staff.
          </p>
        </div>

        {message && (
          <div className={`p-3 text-sm rounded border ${
            message.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2.5 rounded text-sm bg-[var(--background)] border border-[var(--border)] focus:border-[var(--muted)] focus:outline-none"
              placeholder="mp@gov.in"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2.5 rounded text-sm bg-[var(--background)] border border-[var(--border)] focus:border-[var(--muted)] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[var(--foreground)] text-[var(--background)] rounded font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
          >
            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div className="text-center text-xs text-[var(--muted)]">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[var(--foreground)] hover:underline font-medium"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
