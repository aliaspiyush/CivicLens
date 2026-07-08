"use client";

import { Fragment, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Submission } from "@/types";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  ImageIcon,
  Loader2,
  Play,
  ShieldCheck,
} from "lucide-react";

type ExtendedSubmission = Submission & {
  category?: string | null;
  urgency_score?: number | null;
  summary?: string | null;
  english_translation?: string | null;
  theme_cluster?: string | null;
};

const statusOptions: Submission["status"][] = ["new", "reviewed", "actioned"];

function normalizeSubmission(sub: ExtendedSubmission): ExtendedSubmission {
  return {
    ...sub,
    status: sub.status || "new",
    category: sub.category ?? null,
    urgency_score: sub.urgency_score ?? null,
    summary: sub.summary ?? null,
    english_translation: sub.english_translation ?? null,
    theme_cluster: sub.theme_cluster ?? null,
  };
}

export default function MPSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ExtendedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [filterWard, setFilterWard] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSubmissions = async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Error fetching submissions:", error);
      } else {
        setSubmissions(
          (data || []).map((sub) =>
            normalizeSubmission(sub as ExtendedSubmission)
          )
        );
      }
      setLoading(false);
    };

    void loadSubmissions();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateStatus = async (id: string, newStatus: Submission["status"]) => {
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
        prev.map((sub) =>
          sub.id === id ? { ...sub, status: newStatus } : sub
        )
      );
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getCategoryLabel = (sub: ExtendedSubmission) =>
    sub.category || "Pending synthesis";

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterWard && sub.ward !== filterWard) return false;
    if (filterStatus && sub.status !== filterStatus) return false;
    if (filterCategory && getCategoryLabel(sub) !== filterCategory) return false;
    return true;
  });

  const uniqueWards = Array.from(new Set(submissions.map((s) => s.ward))).filter(
    Boolean
  );
  const uniqueCategories = Array.from(
    new Set(submissions.map((s) => getCategoryLabel(s)))
  );

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));

  const statusClass = (status: Submission["status"]) => {
    if (status === "actioned") {
      return "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]";
    }
    if (status === "reviewed") {
      return "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-action-hover)]";
    }
    return "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]";
  };

  if (loading) {
    return (
      <div className="app-container flex flex-1 items-center justify-center py-16 text-sm text-[var(--muted)]">
        <Loader2 size={18} className="mr-2 animate-spin" aria-hidden="true" />
        Loading submissions
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="app-container py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-eyebrow mb-2">MP portal</p>
              <h1 className="text-2xl font-semibold tracking-tight">
                Citizen Submissions
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">
                Review incoming civic requests, inspect original evidence, and
                update staff review status.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[560px]">
              <select
                value={filterWard}
                onChange={(e) => setFilterWard(e.target.value)}
                className="min-h-10 px-3 text-sm"
                aria-label="Filter by ward"
              >
                <option value="">All wards</option>
                {uniqueWards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="min-h-10 px-3 text-sm"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="min-h-10 px-3 text-sm"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="app-container py-6">
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="min-w-[780px]">
              <thead className="bg-[var(--card)]">
                <tr>
                  <th className="w-10 px-4"></th>
                  <th>Date</th>
                  <th>Ward</th>
                  <th>AI Category</th>
                  <th>Urgency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-[var(--muted)]"
                    >
                      No submissions found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <Fragment key={sub.id}>
                      <tr
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleRow(sub.id)}
                      >
                        <td className="px-4 text-[var(--muted)]">
                          {expandedRow === sub.id ? (
                            <ChevronDown size={16} aria-hidden="true" />
                          ) : (
                            <ChevronRight size={16} aria-hidden="true" />
                          )}
                        </td>
                        <td className="whitespace-nowrap font-medium text-[var(--secondary)]">
                          {formatDate(sub.created_at)}
                        </td>
                        <td className="font-medium text-[var(--foreground)]">
                          {sub.ward}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              sub.category
                                ? "border-[var(--accent-border)] bg-[var(--accent-soft)]"
                                : ""
                            }`}
                          >
                            {getCategoryLabel(sub)}
                          </span>
                        </td>
                        <td>
                          {typeof sub.urgency_score === "number" ? (
                            <span className="font-semibold text-[var(--foreground)]">
                              {sub.urgency_score}/5
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--muted)]">
                              Pending
                            </span>
                          )}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            value={sub.status}
                            onChange={(e) =>
                              updateStatus(
                                sub.id,
                                e.target.value as Submission["status"]
                              )
                            }
                            className={`min-h-9 min-w-28 px-2 text-xs font-semibold ${statusClass(
                              sub.status
                            )}`}
                            aria-label={`Update status for submission ${sub.id}`}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>

                      {expandedRow === sub.id && (
                        <tr className="bg-[var(--card)]">
                          <td colSpan={6} className="p-0">
                            <div className="grid gap-6 border-b border-[var(--border)] p-5 md:grid-cols-[1fr_1fr]">
                              <section>
                                <div className="mb-3 flex items-center gap-2">
                                  <ShieldCheck
                                    size={16}
                                    className="text-[var(--accent-action)]"
                                    aria-hidden="true"
                                  />
                                  <h2 className="text-sm font-semibold">
                                    AI processing status
                                  </h2>
                                </div>

                                {sub.summary || sub.theme_cluster ? (
                                  <div className="space-y-4">
                                    {sub.summary && (
                                      <div className="metric-panel">
                                        <p className="section-eyebrow mb-1">
                                          AI-generated summary
                                        </p>
                                        <p className="text-sm leading-6 text-[var(--secondary)]">
                                          {sub.summary}
                                        </p>
                                      </div>
                                    )}
                                    {sub.theme_cluster && (
                                      <div className="metric-panel">
                                        <p className="section-eyebrow mb-1">
                                          Theme cluster
                                        </p>
                                        <p className="text-sm leading-6 text-[var(--secondary)]">
                                          {sub.theme_cluster}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="panel-muted p-4">
                                    <p className="text-sm font-medium text-[var(--foreground)]">
                                      Awaiting synthesis
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">
                                      This record is stored as raw citizen input.
                                      Run synthesis from Themes and Priorities to
                                      generate category, summary, and rationale.
                                    </p>
                                  </div>
                                )}

                                {sub.english_translation && (
                                  <div className="mt-4">
                                    <p className="section-eyebrow mb-2">
                                      English translation
                                    </p>
                                    <p className="rounded border border-[var(--border)] bg-[var(--card-hover)] p-3 text-sm leading-6 text-[var(--secondary)]">
                                      {sub.english_translation}
                                    </p>
                                  </div>
                                )}
                              </section>

                              <section className="border-t border-[var(--border)] pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                                <h2 className="mb-3 text-sm font-semibold">
                                  Original evidence
                                </h2>
                                <div className="space-y-3">
                                  {sub.raw_text && (
                                    <div className="flex items-start gap-3 rounded border border-[var(--border)] bg-[var(--card-hover)] p-3">
                                      <FileText
                                        size={16}
                                        className="mt-0.5 shrink-0 text-[var(--muted)]"
                                        aria-hidden="true"
                                      />
                                      <p className="text-sm leading-6 text-[var(--secondary)]">
                                        {sub.raw_text}
                                      </p>
                                    </div>
                                  )}
                                  {sub.audio_url && (
                                    <div className="flex items-center gap-3 rounded border border-[var(--border)] bg-[var(--card-hover)] p-3">
                                      <Play
                                        size={16}
                                        className="shrink-0 text-[var(--muted)]"
                                        aria-hidden="true"
                                      />
                                      <audio
                                        src={sub.audio_url}
                                        controls
                                        className="h-8 w-full max-w-64"
                                      />
                                    </div>
                                  )}
                                  {sub.image_url && (
                                    <div className="flex items-center gap-3 rounded border border-[var(--border)] bg-[var(--card-hover)] p-3">
                                      <ImageIcon
                                        size={16}
                                        className="shrink-0 text-[var(--muted)]"
                                        aria-hidden="true"
                                      />
                                      <a
                                        href={sub.image_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-medium text-[var(--accent-action)] hover:underline"
                                      >
                                        View attached photo
                                      </a>
                                    </div>
                                  )}
                                  {!sub.raw_text &&
                                    !sub.audio_url &&
                                    !sub.image_url && (
                                      <p className="text-sm text-[var(--muted)]">
                                        No evidence payload was attached.
                                      </p>
                                    )}
                                </div>
                              </section>
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
      </div>
    </div>
  );
}
