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
        <section className="border border-[var(--border)] bg-[var(--card)] rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/submit"
              className="border border-[var(--border)] bg-[var(--background)] p-6 rounded hover:bg-[var(--card-hover)] transition-colors flex flex-col gap-3 group"
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
              className="border border-[var(--border)] bg-[var(--background)] p-6 rounded hover:bg-[var(--card-hover)] transition-colors flex flex-col gap-3 group"
            >
              <h2 className="text-lg font-medium flex items-center justify-between">
                MP Dashboard
                <Lock size={16} className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Authorized access for Members of Parliament and staff to review AI processed submissions and evidence backed themes.
              </p>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
