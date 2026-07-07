"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { AlertCircle, TrendingUp, Filter } from "lucide-react";

type ThemeDisplay = {
  id: string;
  title: string;
  category: string;
  ward: string;
  submission_count: number;
  priority_score: number;
  justification_score: number;
  rationale_text: string;
};

export default function MPThemesPage() {
  const [themes, setThemes] = useState<ThemeDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    setLoading(true);
    // In a real flow, this would join themes and justifications.
    // Since Phase 2/3 clustering is pending, we provide realistic mock data
    // to demonstrate the India-specific Notion-style design and evidence engine integration.
    
    const mockData: ThemeDisplay[] = [
      {
        id: "1",
        title: "Build new primary school building",
        category: "Education",
        ward: "Ward 4 — Downtown",
        submission_count: 15,
        priority_score: 8.4,
        justification_score: 9,
        rationale_text: "Data shows Ward 4 schools are at 180% capacity with a student-teacher ratio of 58:1. Nearest alternative is 12.3 km away. This strongly justifies the high citizen demand. A development plan exists but is only 'proposed'.",
      },
      {
        id: "2",
        title: "Install water treatment plant",
        category: "Water & Sanitation",
        ward: "Ward 7 — Ambedkar Nagar",
        submission_count: 32,
        priority_score: 7.8,
        justification_score: 8,
        rationale_text: "Only 38% of households have water connections and average supply is 2.5 hours/day. The Jal Jeevan Mission plan for this ward is still pending. Strong evidence supports citizen urgency.",
      },
      {
        id: "3",
        title: "Construct additional school wing",
        category: "Education",
        ward: "Ward 9 — Green Valley",
        submission_count: 22, // Higher complaints but lower score
        priority_score: 4.2,
        justification_score: 3,
        rationale_text: "Despite high complaint volume, data shows current schools are at 42% capacity (underutilized) and nearest alternative is 1.2 km away. Existing capacity is sufficient; citizen demand is not supported by current metrics.",
      }
    ];

    setThemes(mockData);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-[var(--muted)] text-sm">Loading themes...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--card)]">
      <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]">
        <h1 className="text-xl font-semibold text-[var(--foreground)] mb-1">Themes & Priorities</h1>
        <p className="text-sm text-[var(--muted)]">
          AI-clustered citizen demands ranked by the Evidence Reasoning Engine.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {themes.map((theme, index) => (
            <div key={theme.id} className="bg-[var(--background)] border border-[var(--border)] rounded flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-[var(--border)] flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      #{index + 1} Priority
                    </span>
                    <span className="text-xs text-[var(--muted)]">{theme.category} • {theme.ward}</span>
                  </div>
                  <h2 className="text-lg font-medium text-[var(--foreground)]">{theme.title}</h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-[var(--foreground)]">{theme.priority_score.toFixed(1)}</div>
                  <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Composite Score</div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[var(--card)]">
                <div className="md:col-span-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1">
                    <AlertCircle size={14} /> AI Evidence Rationale
                  </h3>
                  <p className="text-sm text-[var(--secondary)] leading-relaxed">
                    {theme.rationale_text}
                  </p>
                </div>
                <div className="border-l border-[var(--border)] pl-6 space-y-4">
                  <div>
                    <div className="text-lg font-medium text-[var(--foreground)]">{theme.justification_score}/10</div>
                    <div className="text-xs text-[var(--muted)]">Evidence Score (45% weight)</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-[var(--foreground)]">{theme.submission_count}</div>
                    <div className="text-xs text-[var(--muted)]">Submissions (30% weight)</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
