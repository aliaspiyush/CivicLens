"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ShieldAlert, ChevronDown, ChevronRight, Wand2, Loader2 } from "lucide-react";

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

export default function MPThemesPage() {
  const [themes, setThemes] = useState<ThemeDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initial mock data load (fallback in case DB is empty)
    const mockData: ThemeDisplay[] = [
      {
        id: "1",
        title: "Build new primary school building",
        category: "Education",
        ward: "Ward 4 - Downtown",
        submission_count: 15,
        priority_score: 8.4,
        justification_score: 9,
        rationale_text: "Data shows Ward 4 schools are at 180% capacity with a student-teacher ratio of 58:1. Nearest alternative is 12.3 km away. This strongly justifies the high citizen demand. A development plan exists but is only 'proposed'.",
        validation_passed: true,
        source_data_preview: `[ReferenceData] metric_name: school_enrollment_capacity_ratio, metric_value: 1.80\n[ReferenceData] metric_name: student_teacher_ratio, metric_value: 58\n[ReferenceData] metric_name: nearest_alternative_school_km, metric_value: 12.3`,
      },
      {
        id: "2",
        title: "Install water treatment plant",
        category: "Water & Sanitation",
        ward: "Ward 7 - Ambedkar Nagar",
        submission_count: 32,
        priority_score: 7.8,
        justification_score: 8,
        rationale_text: "Only 38% of households have water connections and average supply is 2.5 hours/day. The Jal Jeevan Mission plan for this ward is still pending. Strong evidence supports citizen urgency.",
        validation_passed: true,
        source_data_preview: `[ReferenceData] metric_name: household_water_connection_pct, metric_value: 38\n[ReferenceData] metric_name: avg_daily_supply_hours, metric_value: 2.5`,
      },
      {
        id: "3",
        title: "Construct additional school wing",
        category: "Education",
        ward: "Ward 9 - Green Valley",
        submission_count: 22,
        priority_score: 4.2,
        justification_score: 3,
        // HALLUCINATION INJECTED
        rationale_text: "Despite high complaint volume, data shows current schools are at 700% capacity and nearest alternative is 1.2 km away.",
        validation_passed: false,
        source_data_preview: `[ReferenceData] metric_name: school_enrollment_capacity_ratio, metric_value: 0.42\n[ReferenceData] metric_name: nearest_alternative_school_km, metric_value: 1.2`,
      }
    ];

    setThemes(mockData);
    setLoading(false);
  }, []);

  const handleSynthesize = async () => {
    setSynthesizing(true);
    try {
      const response = await fetch("/api/synthesize", { method: "POST" });
      const data = await response.json();
      
      if (data.theme) {
        // Add new synthesized theme to the top of the list
        setThemes(prev => [{ ...data.theme, id: Date.now().toString() }, ...prev]);
      } else {
        alert(data.error || "Failed to synthesize.");
      }
    } catch (err) {
      console.error(err);
      alert("API Error during synthesis.");
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

  if (loading) {
    return <div className="p-8 text-[var(--muted)] text-sm">Loading themes...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--card)] w-full">
      <div className="p-6 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--foreground)] mb-1">Themes & Priorities</h1>
          <p className="text-sm text-[var(--muted)]">
            AI clustered citizen demands ranked by the Evidence Reasoning Engine.
          </p>
        </div>
        
        <button
          onClick={handleSynthesize}
          disabled={synthesizing}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {synthesizing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {synthesizing ? "Synthesizing AI Pipeline..." : "Run AI Synthesis (Demo)"}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {themes.map((theme, index) => {
            const isApiFailed = theme.api_failed;

            return (
              <div key={theme.id || index} className="bg-[var(--background)] border border-[var(--border)] rounded flex flex-col relative overflow-hidden">
                {/* Highlight banner for newly synthesized items */}
                {!theme.id?.includes("-") && parseInt(theme.id || "0") > 1000000 && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                )}

                {/* Header */}
                <div className="p-5 border-b border-[var(--border)] flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        #{index + 1} Priority
                      </span>
                      <span className="text-xs text-[var(--muted)]">{theme.category} • {theme.ward}</span>
                      
                      {!theme.id?.includes("-") && parseInt(theme.id || "0") > 1000000 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Wand2 size={10} /> Just Synthesized
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-medium text-[var(--foreground)]">{theme.title}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-[var(--foreground)]">
                      {isApiFailed ? "--" : theme.priority_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Composite Score</div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[var(--card)]">
                  <div className="md:col-span-2 flex flex-col">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1">
                      <AlertCircle size={14} /> AI Evidence Rationale
                    </h3>
                    
                    {isApiFailed ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-[var(--muted)]">
                        AI analysis unavailable, showing raw data only.
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-[var(--secondary)] leading-relaxed">
                          {theme.rationale_text}
                        </p>
                        
                        {theme.validation_passed === false && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 w-fit">
                            <ShieldAlert size={14} />
                            Unverified figure, review manually
                          </div>
                        )}

                        {(theme.source_data_preview || theme.id) && (
                          <div className="mt-4 border-t border-[var(--border)] pt-3">
                            <button 
                              onClick={() => toggleSource(theme.id || String(index))}
                              className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                            >
                              {expandedSources.has(theme.id || String(index)) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                              View Source Data
                            </button>
                            
                            {expandedSources.has(theme.id || String(index)) && (
                              <div className="mt-2 p-3 bg-[var(--background)] border border-[var(--border)] rounded font-mono text-[11px] text-[var(--secondary)] whitespace-pre-wrap">
                                {theme.source_data_preview || "Live data sourced from gemini_audit_log constraints."}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6 space-y-4">
                    <div>
                      <div className="text-lg font-medium text-[var(--foreground)]">
                        {isApiFailed ? "--" : `${theme.justification_score}/10`}
                      </div>
                      <div className="text-xs text-[var(--muted)]">Evidence Score (45% weight)</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-[var(--foreground)]">{theme.submission_count}</div>
                      <div className="text-xs text-[var(--muted)]">Submissions (30% weight)</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
