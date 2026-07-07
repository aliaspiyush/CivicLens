"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Inbox, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function MPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    { href: "/mp/submissions", label: "Submissions", icon: Inbox },
    { href: "/mp/themes", label: "Themes & Priorities", icon: LayoutDashboard },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] flex flex-col bg-[var(--card)]">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--foreground)] flex items-center gap-2">
            CivicLens MP Portal
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">Official internal tool</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
                  isActive
                    ? "bg-[var(--border)] text-[var(--foreground)] font-medium"
                    : "text-[var(--secondary)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <Icon size={16} className={isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm text-[var(--secondary)] hover:bg-[var(--card-hover)] rounded transition-colors"
          >
            <LogOut size={16} className="text-[var(--muted)]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
