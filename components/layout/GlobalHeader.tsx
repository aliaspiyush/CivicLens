"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, LogOut, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useMemo, useState } from "react";

export default function GlobalHeader() {
  const pathname = usePathname();
  const isMpPortal = pathname.startsWith("/mp");
  const supabase = useMemo(() => createClient(), []);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (isMpPortal) {
      const checkSession = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
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
    document.cookie =
      "demo_access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = isMpPortal
    ? [
        { href: "/mp/submissions", label: "Submissions" },
        { href: "/mp/themes", label: "Themes and Priorities" },
      ]
    : [
        { href: "/submit", label: "Submit a Concern" },
        { href: "/login", label: "MP Portal" },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--card)]">
      <div className="app-container flex min-h-16 flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 text-[var(--foreground)] transition-colors hover:text-[var(--accent-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded border border-[var(--border)] bg-[var(--card-hover)]">
            <Landmark size={18} aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">CivicLens</span>
            <span className="text-[11px] font-medium text-[var(--muted)]">
              Constituency intelligence
            </span>
          </span>
        </Link>

        <nav
          className="order-3 flex w-full items-center gap-1 overflow-x-auto border-t border-[var(--border)] pt-3 sm:order-none sm:w-auto sm:border-t-0 sm:pt-0"
          aria-label={isMpPortal ? "MP portal navigation" : "Primary navigation"}
        >
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)] ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent-action-hover)]"
                    : "text-[var(--muted-strong)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {isMpPortal && (
            <div className="hidden items-center gap-3 md:flex">
              <span className="max-w-48 truncate text-xs font-medium text-[var(--muted)]">
                {userEmail}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-[var(--muted-strong)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
              >
                <LogOut size={13} aria-hidden="true" />
                Sign out
              </button>
              <div className="h-5 w-px bg-[var(--border)]" />
            </div>
          )}

          <div className="status-pill bg-[var(--card-hover)]">
            <Sparkles size={12} aria-hidden="true" />
            <span>Gemini 2.5</span>
          </div>
        </div>
      </div>
    </header>
  );
}
