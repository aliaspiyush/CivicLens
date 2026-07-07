"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function GlobalHeader() {
  const pathname = usePathname();
  const isMpPortal = pathname.startsWith("/mp");
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // If it's the MP portal, fetch the user session or check demo bypass
    if (isMpPortal) {
      const checkSession = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          setUserEmail(user.email);
        } else if (document.cookie.includes("demo_access=true")) {
          setUserEmail("mp@gov.in (Demo)");
        }
      };
      checkSession();
    }
  }, [isMpPortal, supabase]);

  const handleLogout = async () => {
    // Clear demo cookie
    document.cookie = "demo_access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Clear Supabase session
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-6">
      {/* Left: Brand */}
      <Link href="/" className="flex items-center gap-2 no-underline text-[var(--foreground)] hover:opacity-80 transition-opacity">
        <Landmark size={20} className="text-[var(--foreground)]" />
        <span className="font-semibold tracking-wide text-sm">CivicLens</span>
      </Link>

      {/* Center/Right: Navigation */}
      <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
        {isMpPortal ? (
          <>
            <Link 
              href="/mp/submissions" 
              className={`text-sm ${pathname === "/mp/submissions" ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)] hover:text-[var(--foreground)]"} transition-colors`}
            >
              Submissions
            </Link>
            <Link 
              href="/mp/themes" 
              className={`text-sm ${pathname === "/mp/themes" ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)] hover:text-[var(--foreground)]"} transition-colors`}
            >
              Themes and Priorities
            </Link>
          </>
        ) : (
          <>
            <Link 
              href="/submit" 
              className={`text-sm ${pathname === "/submit" ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)] hover:text-[var(--foreground)]"} transition-colors`}
            >
              Submit a Concern
            </Link>
            <Link 
              href="/" 
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              About
            </Link>
          </>
        )}
      </nav>

      {/* Far Right: User & Gemini Badge */}
      <div className="flex items-center gap-4">
        {isMpPortal && (
          <>
            <span className="text-xs text-[var(--muted)] hidden sm:block">
              {userEmail}
            </span>
            <button 
              onClick={handleLogout}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors hidden sm:block"
            >
              Sign Out
            </button>
            <div className="w-px h-4 bg-[var(--border)] hidden sm:block" />
          </>
        )}
        
        <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--border)] bg-[var(--card)]">
          <Sparkles size={12} className="text-[var(--muted)]" />
          <span className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">
            Powered by Gemini 2.5
          </span>
        </div>
      </div>
    </header>
  );
}
