import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16 bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold mb-4 tracking-tight">
          CivicLens — Public Governance Portal
        </h1>

        <p className="text-base mb-8 text-[var(--secondary)] leading-relaxed">
          Official citizen feedback and civic demand prioritization portal. Designed for constituencies across India to submit text, voice, and photo evidence of civic issues.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/submit"
            className="glass-panel p-6 rounded hover:bg-[var(--card-hover)] transition-colors flex flex-col gap-3 group"
          >
            <h2 className="text-lg font-medium flex items-center justify-between">
              Citizen Submission
              <ArrowRight size={18} className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Report civic issues in your ward. Supports text in multiple languages, audio recordings, and photo evidence.
            </p>
          </Link>

          <Link
            href="/mp/submissions"
            className="glass-panel p-6 rounded hover:bg-[var(--card-hover)] transition-colors flex flex-col gap-3 group"
          >
            <h2 className="text-lg font-medium flex items-center justify-between">
              MP Dashboard
              <Lock size={16} className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Authorized access for Members of Parliament and staff to review AI-processed submissions and evidence-backed themes.
            </p>
          </Link>
        </div>

        <div className="mt-12 text-xs text-[var(--muted)] border-t border-[var(--border)] pt-4">
          Built for Indian constituencies. Follows GIGW accessibility standards.
        </div>
      </div>
    </div>
  );
}
