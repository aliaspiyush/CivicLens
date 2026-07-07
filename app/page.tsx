import Link from "next/link";
import { ArrowRight, Lock, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-16 bg-[var(--background)] text-[var(--foreground)] w-full">
      <div className="w-full max-w-4xl flex flex-col gap-16">
        
        {/* Hero Section */}
        <section className="text-center md:text-left flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            CivicLens
          </h1>
          <h2 className="text-xl md:text-2xl text-[var(--secondary)] font-medium">
            AI powered constituency development planning for India
          </h2>
          <p className="text-base text-[var(--muted)] max-w-2xl leading-relaxed mt-2">
            CivicLens combines unstructured citizen voices with real municipal demand data (like enrollment figures and infrastructure gaps) to give Members of Parliament an objective, evidence backed roadmap for development.
          </p>
        </section>

        {/* Gemini Explainer Block */}
        <section className="relative overflow-hidden border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-blue-50/30 rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Subtle glow effect behind */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-[var(--foreground)]" />
              <h3 
                className="text-lg font-semibold"
                style={{ fontFamily: "'Google Sans Flex', 'Google Sans', sans-serif" }}
              >
                Powered by Gemini 2.5
              </h3>
            </div>
            <p className="text-sm text-[var(--secondary)] leading-relaxed">
              Gemini 2.5 synthesizes multilingual citizen submissions, structured public reference data, and existing local development plans. It uses advanced reasoning to surface citizen requests that are genuinely backed by statistical need, flagging competing plans and objectively ranking civic priorities.
            </p>
          </div>
        </section>

        {/* Existing Navigation Cards */}
        <section>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Link href="/submit" className="group block p-8 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2 text-[var(--foreground)]">
              Citizen Portal <ArrowRight size={20} className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
            </h2>
            <p className="text-[var(--secondary)] leading-relaxed">
              Submit your local concerns, track infrastructure gaps, and ensure your voice is heard by your representative. Multilingual support enabled.
            </p>
          </Link>

          <Link href="/login" className="group block p-8 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2 text-[var(--foreground)]">
              MP Dashboard <ArrowRight size={20} className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
            </h2>
            <p className="text-[var(--secondary)] leading-relaxed">
              Access AI-synthesized priority themes. Review evidence-backed citizen demands mapped directly against municipal data and budgets.
            </p>
          </Link>
        </div>
        </section>

      </div>
    </div>
  );
}
