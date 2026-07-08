import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Landmark,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="w-full bg-[var(--background)] text-[var(--foreground)]">
      <section className="app-container grid gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16">
        <div className="max-w-3xl">
          <p className="section-eyebrow mb-4">Civic governance for India</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-6xl">
            CivicLens
          </h1>
          <p className="mt-4 text-xl font-medium leading-snug text-[var(--secondary)] md:text-2xl">
            AI-assisted constituency development planning from citizen voice to
            evidence-backed priorities.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-strong)]">
            CivicLens helps citizens submit local development concerns and helps
            MPs and staff review, synthesize, and prioritize needs using public
            reference data and human oversight.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/submit" className="btn-primary px-5">
              <FileText size={17} aria-hidden="true" />
              Submit a concern
            </Link>
            <Link href="/login" className="btn-secondary px-5">
              <Landmark size={17} aria-hidden="true" />
              Open MP portal
            </Link>
          </div>
        </div>

        <div className="panel p-5 md:p-6" aria-label="CivicLens workflow">
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <p className="section-eyebrow">Decision flow</p>
              <h2 className="mt-1 text-lg font-semibold">
                From submission to review
              </h2>
            </div>
            <ShieldCheck
              className="text-[var(--accent-action)]"
              size={24}
              aria-hidden="true"
            />
          </div>
          <div className="space-y-3">
            {[
              "Citizen submits a local issue in text, voice, or photo",
              "Ward and constituency context is preserved",
              "Gemini 2.5 synthesizes multilingual input with reference data",
              "MP staff review ranked themes and source evidence",
            ].map((item, index) => (
              <div
                key={item}
                className="grid grid-cols-[2rem_1fr] items-start gap-3 rounded border border-[var(--border)] bg-[var(--card-hover)] p-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--muted-strong)]">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-[var(--secondary)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--card)]">
        <div className="app-container grid gap-8 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="status-pill w-fit">
              <Sparkles size={12} aria-hidden="true" />
              Powered by Gemini 2.5
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Multilingual synthesis with source-aware review
            </h2>
          </div>
          <p className="text-sm leading-7 text-[var(--secondary)] md:text-base">
            Gemini 2.5 assists by synthesizing multilingual citizen submissions,
            structured public reference datasets, and local development plans.
            The product separates source data from AI-generated rationale so
            staff can inspect the evidence before acting.
          </p>
        </div>
      </section>

      <section className="app-container py-10 md:py-12">
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/submit"
            className="panel group block p-6 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded border border-[var(--border)] bg-[var(--card)]">
              <ClipboardList size={20} aria-hidden="true" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Citizen submission</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--secondary)]">
                  Report a local development concern with ward context, optional
                  voice recording, and photo evidence.
                </p>
              </div>
              <ArrowRight
                size={18}
                className="mt-1 text-[var(--muted)] transition-colors group-hover:text-[var(--foreground)]"
                aria-hidden="true"
              />
            </div>
          </Link>

          <Link
            href="/login"
            className="panel group block p-6 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded border border-[var(--border)] bg-[var(--card)]">
              <Landmark size={20} aria-hidden="true" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">MP portal</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--secondary)]">
                  Review submissions, inspect AI-generated themes, and compare
                  rationale against source evidence.
                </p>
              </div>
              <ArrowRight
                size={18}
                className="mt-1 text-[var(--muted)] transition-colors group-hover:text-[var(--foreground)]"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
