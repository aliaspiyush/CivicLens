"use client";

import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Database,
  Loader2,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Wand2,
} from "lucide-react";

type ThemeDisplay = {
  id?: string;
  title: string;
  category: string;
  ward: string;
  submission_count: number;
  priority_score: number;
  justification_score: number;
  rationale_text: string;
  validation_passed?: boolean;
  source_data_preview?: string;
  api_failed?: boolean;
};

const initialThemes: ThemeDisplay[] = [
  {
    id: "1",
    title: "Build new primary school building",
    category: "Education",
    ward: "Ward 4 - Downtown",
    submission_count: 15,
    priority_score: 8.4,
    justification_score: 9,
    rationale_text:
      "Data shows Ward 4 schools are at 180% capacity with a student-teacher ratio of 58:1. Nearest alternative is 12.3 km away. This strongly justifies the high citizen demand. A development plan exists but is only proposed.",
    validation_passed: true,
    source_data_preview:
      "[ReferenceData] metric_name: school_enrollment_capacity_ratio, metric_value: 1.80\n[ReferenceData] metric_name: student_teacher_ratio, metric_value: 58\n[ReferenceData] metric_name: nearest_alternative_school_km, metric_value: 12.3",
  },
  {
    id: "2",
    title: "Install water treatment plant",
    category: "Water and Sanitation",
    ward: "Ward 7 - Ambedkar Nagar",
    submission_count: 32,
    priority_score: 7.8,
    justification_score: 8,
    rationale_text:
      "Only 38% of households have water connections and average supply is 2.5 hours per day. The Jal Jeevan Mission plan for this ward is still pending. Strong evidence supports citizen urgency.",
    validation_passed: true,
    source_data_preview:
      "[ReferenceData] metric_name: household_water_connection_pct, metric_value: 38\n[ReferenceData] metric_name: avg_daily_supply_hours, metric_value: 2.5",
  },
  {
    id: "3",
    title: "Construct additional school wing",
    category: "Education",
    ward: "Ward 9 - Green Valley",
    submission_count: 22,
    priority_score: 4.2,
    justification_score: 3,
    rationale_text:
      "Despite high complaint volume, data shows current schools are at 700% capacity and nearest alternative is 1.2 km away.",
    validation_passed: false,
    source_data_preview:
      "[ReferenceData] metric_name: school_enrollment_capacity_ratio, metric_value: 0.42\n[ReferenceData] metric_name: nearest_alternative_school_km, metric_value: 1.2",
  },
];

export default function MPThemesPage() {
  const [themes, setThemes] = useState<ThemeDisplay[]>(initialThemes);
  const [synthesizing, setSynthesizing] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    new Set()
  );

  const handleSynthesize = async () => {
    setSynthesizing(true);
    try {
      const response = await fetch("/api/synthesize", { method: "POST" });
      const data = await response.json();

      if (data.theme) {
        setThemes((prev) => [
          { ...data.theme, id: Date.now().toString() },
          ...prev,
        ]);
      } else {
        alert(data.error || "Failed to synthesize.");
      }
    } catch (err) {
      console.error(err);
      alert("API error during synthesis.");
    } finally {
      setSynthesizing(false);
    }
  };

  const toggleSource = (id: string) => {
    const next = new Set(expandedSources);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSources(next);
  };

  return (
    <div className="flex-1 bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="app-container flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="section-eyebrow mb-2">Evidence reasoning engine</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Themes and Priorities
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-strong)]">
              AI-clustered citizen demands ranked by composite priority score,
              with source data and validation states visible for staff review.
            </p>
          </div>

          <button
            onClick={handleSynthesize}
            disabled={synthesizing}
            className="btn-primary px-4 disabled:opacity-50"
          >
            {synthesizing ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Wand2 size={16} aria-hidden="true" />
            )}
            {synthesizing ? "Synthesizing" : "Run AI synthesis"}
          </button>
        </div>
      </div>

      <div className="app-container py-6">
        <div className="grid gap-5">
          {themes.map((theme, index) => {
            const itemKey = theme.id || String(index);
            const isApiFailed = theme.api_failed;
            const isNewSynthesized =
              Boolean(theme.id) &&
              !theme.id?.includes("-") &&
              Number(theme.id) > 1000000;
            const expanded = expandedSources.has(itemKey);

            return (
              <article
                key={itemKey}
                className="panel overflow-hidden"
                aria-label={`Priority ${index + 1}: ${theme.title}`}
              >
                <div className="grid gap-5 border-b border-[var(--border)] bg-[var(--card)] p-5 lg:grid-cols-[1fr_220px]">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="status-pill border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-action-hover)]">
                        #{index + 1} priority
                      </span>
                      <span className="status-pill">
                        {theme.category} / {theme.ward}
                      </span>
                      {isNewSynthesized && (
                        <span className="status-pill border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-action-hover)]">
                          <Wand2 size={12} aria-hidden="true" />
                          Just synthesized
                        </span>
                      )}
                      {theme.validation_passed === true && (
                        <span className="status-pill border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]">
                          <ShieldCheck size={12} aria-hidden="true" />
                          Source aligned
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                      {theme.title}
                    </h2>
                  </div>

                  <div className="rounded border border-[var(--border)] bg-[var(--card-hover)] p-4 lg:text-right">
                    <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                      Composite score
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-[var(--foreground)]">
                      {isApiFailed ? "--" : theme.priority_score.toFixed(1)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Frequency, urgency, and evidence
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-[1fr_260px]">
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <AlertCircle
                        size={16}
                        className="text-[var(--accent-action)]"
                        aria-hidden="true"
                      />
                      <h3 className="text-sm font-semibold">
                        AI-generated evidence rationale
                      </h3>
                    </div>

                    {isApiFailed ? (
                      <div className="panel-muted p-4 text-sm text-[var(--muted-strong)]">
                        AI analysis is unavailable. Review raw source data
                        before using this item.
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-7 text-[var(--secondary)]">
                          {theme.rationale_text}
                        </p>

                        {theme.validation_passed === false && (
                          <div className="mt-4 flex w-fit items-center gap-2 rounded border border-[var(--warning)] bg-[var(--warning-soft)] px-3 py-2 text-xs font-semibold text-[var(--warning)]">
                            <ShieldAlert size={14} aria-hidden="true" />
                            Unverified figure, review manually
                          </div>
                        )}

                        <div className="mt-5 border-t border-[var(--border)] pt-4">
                          <button
                            onClick={() => toggleSource(itemKey)}
                            className="inline-flex items-center gap-2 rounded px-1 py-1 text-sm font-semibold text-[var(--muted-strong)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
                            aria-expanded={expanded}
                          >
                            {expanded ? (
                              <ChevronDown size={15} aria-hidden="true" />
                            ) : (
                              <ChevronRight size={15} aria-hidden="true" />
                            )}
                            View source data
                          </button>

                          {expanded && (
                            <div className="mt-3 rounded border border-[var(--border)] bg-[var(--card-hover)] p-3">
                              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--muted)]">
                                <Database size={13} aria-hidden="true" />
                                Reference data preview
                              </div>
                              <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-[var(--secondary)]">
                                {theme.source_data_preview ||
                                  "Source preview was not returned by this synthesis response. Check server audit logs for full prompt inputs."}
                              </pre>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </section>

                  <aside className="grid gap-3 border-t border-[var(--border)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <div className="metric-panel">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--muted)]">
                        <Scale size={13} aria-hidden="true" />
                        Evidence score
                      </div>
                      <p className="text-2xl font-semibold text-[var(--foreground)]">
                        {isApiFailed ? "--" : `${theme.justification_score}/10`}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        45% composite weight
                      </p>
                    </div>

                    <div className="metric-panel">
                      <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                        Citizen submissions
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                        {theme.submission_count}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        30% composite weight
                      </p>
                    </div>
                  </aside>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
