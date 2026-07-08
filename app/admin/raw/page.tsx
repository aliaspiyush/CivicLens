"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  Inbox,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { Submission } from "@/types";

async function loadSubmissionData(): Promise<Submission[]> {
  const res = await fetch("/api/submissions");
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.submissions;
}

export default function AdminRawPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const nextSubmissions = await loadSubmissionData();
        if (!cancelled) {
          setSubmissions(nextSubmissions);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load submissions"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextSubmissions = await loadSubmissionData();
      setSubmissions(nextSubmissions);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="flex-1 bg-[var(--background)]">
      <main className="app-container py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-medium text-[var(--muted-strong)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to home
          </Link>
          <button
            onClick={fetchSubmissions}
            disabled={isLoading}
            className="btn-secondary px-3 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw size={14} aria-hidden="true" />
            )}
            Refresh data
          </button>
        </div>

        <div className="mb-6">
          <p className="section-eyebrow mb-2">Admin data view</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Raw Submissions Table
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">
            Unprocessed citizen submissions from all wards. {submissions.length}{" "}
            total records loaded.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-[var(--danger)]">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Error loading submissions</p>
              <p className="mt-1 text-sm leading-6">{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-[var(--muted)]">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        )}

        {!isLoading && !error && submissions.length === 0 && (
          <div className="panel p-12 text-center">
            <Inbox size={32} className="mx-auto mb-4 text-[var(--muted)]" />
            <h2 className="text-base font-semibold">No submissions found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              Citizen submissions will appear here once records are available.
            </p>
            <Link href="/submit" className="btn-secondary mt-6 px-4">
              Submit test feedback
            </Link>
          </div>
        )}

        {!isLoading && submissions.length > 0 && (
          <div className="table-shell">
            <div className="overflow-x-auto">
              <table className="min-w-[880px]">
                <thead className="bg-[var(--card)]">
                  <tr>
                    <th>Date</th>
                    <th>Ward</th>
                    <th>Raw text</th>
                    <th>Audio</th>
                    <th>Image</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="transition-colors">
                      <td className="whitespace-nowrap text-[var(--secondary)]">
                        {formatDate(sub.created_at)}
                      </td>
                      <td className="font-medium text-[var(--foreground)]">
                        {sub.ward}
                      </td>
                      <td className="max-w-xs truncate text-[var(--secondary)]">
                        {sub.raw_text ? (
                          sub.raw_text
                        ) : (
                          <span className="text-[var(--muted)]">None</span>
                        )}
                      </td>
                      <td>
                        {sub.audio_url ? (
                          <audio
                            controls
                            preload="none"
                            src={sub.audio_url}
                            className="h-8 w-40"
                          />
                        ) : (
                          <span className="text-sm text-[var(--muted)]">None</span>
                        )}
                      </td>
                      <td>
                        {sub.image_url ? (
                          <button
                            onClick={() => setExpandedImage(sub.image_url)}
                            className="flex h-11 w-16 items-center justify-center overflow-hidden rounded border border-[var(--border)] bg-[var(--card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
                            aria-label="Open submitted image"
                          >
                            <img
                              src={sub.image_url}
                              alt="Submission evidence"
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-[var(--muted)]">
                            <ImageIcon size={14} aria-hidden="true" />
                            None
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-xs text-[var(--muted)]">
                        {sub.id.split("-")[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setExpandedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Submitted image preview"
        >
          <img
            src={expandedImage}
            alt="Full size submission evidence"
            className="max-h-full max-w-full rounded border border-white/20"
          />
        </div>
      )}
    </div>
  );
}
