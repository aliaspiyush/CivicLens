import Link from "next/link";

export default function GlobalFooter() {
  return (
    <footer className="mt-auto w-full border-t border-[var(--border)] bg-[var(--card)]">
      <div className="app-container grid gap-4 py-6 text-xs text-[var(--muted)] md:grid-cols-[1fr_1.5fr_1fr] md:items-center">
        <p className="font-medium text-[var(--muted-strong)]">
          CivicLens for Indian constituencies
        </p>

        <p className="leading-relaxed md:text-center">
          Gemini 2.5 assists synthesis of citizen input and reference data.
          Final decisions remain with elected representatives and staff.
        </p>

        <nav
          className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end"
          aria-label="Footer links"
        >
          <Link
            href="/submit"
            className="font-medium transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
          >
            Citizen submission
          </Link>
          <Link
            href="/login"
            className="font-medium transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
          >
            MP portal
          </Link>
        </nav>
      </div>
    </footer>
  );
}
