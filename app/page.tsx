import Link from "next/link";
import { ArrowRight, Mic, FileText, Camera, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: "var(--accent-glow)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium" style={{ color: "var(--accent-light)" }}>
            AI-Powered Civic Platform
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Your Voice Shapes{" "}
          <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
            Your Community
          </span>
        </h1>

        <p className="text-lg md:text-xl mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
          Submit development requests in any language — text, voice, or photos.
          CivicLens uses AI to consolidate, understand, and prioritize your feedback
          for your elected representatives.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/submit" className="btn-primary text-base px-8 py-4 no-underline">
            Submit Feedback
            <ArrowRight size={18} />
          </Link>
          <Link href="/admin/raw" className="btn-secondary text-base px-8 py-4 no-underline">
            <BarChart3 size={18} />
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-20 w-full">
        <div className="glass-card p-6 animate-fade-in-up-delay-1">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "var(--accent-glow)" }}>
            <FileText size={22} className="text-accent-light" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Multilingual Text</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Write in Hindi, Marathi, Tamil, or any language. AI translates and extracts meaning automatically.
          </p>
        </div>

        <div className="glass-card p-6 animate-fade-in-up-delay-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "var(--success-glow)" }}>
            <Mic size={22} className="text-success" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Voice Recording</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Record your concern directly. Perfect for citizens who prefer speaking over typing.
          </p>
        </div>

        <div className="glass-card p-6 animate-fade-in-up-delay-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "rgba(245,158,11,0.15)" }}>
            <Camera size={22} className="text-warning" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Photo Evidence</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Attach photos of potholes, broken lights, or drainage issues to strengthen your report.
          </p>
        </div>
      </div>
    </div>
  );
}
