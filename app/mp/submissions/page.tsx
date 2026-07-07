"use client";

import { useEffect, useState, Fragment } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Submission } from "@/types";
import { ChevronRight, ChevronDown, Play, FileText, ImageIcon, CheckCircle, Clock } from "lucide-react";

type ExtendedSubmission = Submission & {
  // Mocking processed data as per Phase 2 for UI demonstration
  category: string;
  urgency_score: number;
  summary: string;
  english_translation: string;
  theme_cluster: string;
};

export default function MPSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ExtendedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Filters
  const [filterWard, setFilterWard] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
    } else {
      // Mocking processed data for the UI demonstration
      const mockCategories = ["Roads", "Education", "Water & Sanitation", "Electricity", "Public Health"];
      const extended = (data || []).map((sub, index) => ({
        ...sub,
        status: sub.status || "new",
        category: mockCategories[index % mockCategories.length],
        urgency_score: Math.floor(Math.random() * 5) + 1,
        summary: `Citizen reported an issue regarding ${mockCategories[index % mockCategories.length].toLowerCase()} in their locality. Needs attention.`,
        english_translation: "Translated: " + (sub.raw_text || "Audio submission regarding local issue."),
        theme_cluster: `Improve ${mockCategories[index % mockCategories.length]} Infrastructure`,
      }));
      setSubmissions(extended);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("submissions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } else {
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus as any } : sub))
      );
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterWard && sub.ward !== filterWard) return false;
    if (filterStatus && sub.status !== filterStatus) return false;
    if (filterCategory && sub.category !== filterCategory) return false;
    return true;
  });

  const uniqueWards = Array.from(new Set(submissions.map((s) => s.ward)));
  const uniqueCategories = Array.from(new Set(submissions.map((s) => s.category)));

  const getUrgencyColor = (score: number) => {
    if (score >= 4) return "text-[var(--accent-urgency)] font-medium";
    return "text-[var(--secondary)]";
  };

  if (loading) {
    return <div className="p-8 text-[var(--muted)] text-sm">Loading submissions...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <div className="p-6 border-b border-[var(--border)] flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--foreground)]">Citizen Submissions</h1>
          <p className="text-sm text-[var(--muted)]">Review and action incoming civic requests.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            className="text-sm border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 rounded text-[var(--secondary)]"
          >
            <option value="">All Wards</option>
            {uniqueWards.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 rounded text-[var(--secondary)]"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 rounded text-[var(--secondary)]"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="actioned">Actioned</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[var(--background)] z-10">
            <tr>
              <th className="w-8 border-b border-[var(--border)] py-3 pl-4"></th>
              <th className="border-b border-[var(--border)] py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Date</th>
              <th className="border-b border-[var(--border)] py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Ward</th>
              <th className="border-b border-[var(--border)] py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Category</th>
              <th className="border-b border-[var(--border)] py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Urgency</th>
              <th className="border-b border-[var(--border)] py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-sm text-[var(--muted)]">
                  No submissions found matching criteria.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub) => (
                <Fragment key={sub.id}>
                  <tr
                    className="border-b border-[var(--border)] hover:bg-[var(--card)] cursor-pointer transition-colors"
                    onClick={() => toggleRow(sub.id)}
                  >
                    <td className="pl-4 py-3 text-[var(--muted)]">
                      {expandedRow === sub.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </td>
                    <td className="py-3 text-sm text-[var(--secondary)]">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(sub.created_at))}
                    </td>
                    <td className="py-3 text-sm text-[var(--foreground)]">{sub.ward}</td>
                    <td className="py-3 text-sm text-[var(--secondary)]">{sub.category}</td>
                    <td className={`py-3 text-sm ${getUrgencyColor(sub.urgency_score)}`}>
                      {sub.urgency_score}/5
                    </td>
                    <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={sub.status}
                        onChange={(e) => updateStatus(sub.id, e.target.value)}
                        className={`text-xs border px-2 py-1 rounded focus:outline-none ${
                          sub.status === "new"
                            ? "bg-white border-[var(--border)] text-[var(--foreground)]"
                            : sub.status === "reviewed"
                            ? "bg-gray-100 border-gray-300 text-gray-700"
                            : "bg-green-50 border-green-200 text-green-700"
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="actioned">Actioned</option>
                      </select>
                    </td>
                  </tr>
                  {expandedRow === sub.id && (
                    <tr className="bg-[var(--card)] border-b border-[var(--border)]">
                      <td colSpan={6} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* AI Processed Data */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">AI Summary</h4>
                              <p className="text-sm text-[var(--foreground)]">{sub.summary}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Theme Cluster</h4>
                              <p className="text-sm text-[var(--secondary)]">{sub.theme_cluster}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">English Translation</h4>
                              <p className="text-sm text-[var(--secondary)] italic">"{sub.english_translation}"</p>
                            </div>
                          </div>

                          {/* Raw Evidence */}
                          <div className="space-y-4 border-l border-[var(--border)] pl-8">
                            <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Original Evidence</h4>
                            {sub.raw_text && (
                              <div className="flex items-start gap-2">
                                <FileText size={16} className="text-[var(--muted)] mt-0.5" />
                                <p className="text-sm text-[var(--secondary)]">{sub.raw_text}</p>
                              </div>
                            )}
                            {sub.audio_url && (
                              <div className="flex items-center gap-2">
                                <Play size={16} className="text-[var(--muted)]" />
                                <audio src={sub.audio_url} controls className="h-8 max-w-[200px]" />
                              </div>
                            )}
                            {sub.image_url && (
                              <div className="flex items-start gap-2">
                                <ImageIcon size={16} className="text-[var(--muted)] mt-0.5" />
                                <a href={sub.image_url} target="_blank" rel="noreferrer" className="text-sm text-[var(--accent-action)] hover:underline">
                                  View attached photo
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
