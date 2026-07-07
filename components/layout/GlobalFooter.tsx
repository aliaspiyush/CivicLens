import Link from "next/link";

export default function GlobalFooter() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--background)] py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="text-xs text-[var(--muted)]">
          CivicLens. Built for Indian constituencies.
        </div>

        {/* Center */}
        <div className="text-xs text-[var(--muted)] text-center max-w-lg">
          AI synthesis powered by Google Gemini 2.5. Recommendations are advisory and require human verification before action.
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
          <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Accessibility Statement</Link>
          <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Data Sources</Link>
          <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
