"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  Mic,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  Inbox,
} from "lucide-react";
import type { Submission } from "@/types";

export default function AdminRawPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSubmissions(data.submissions);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <h1 className="text-sm font-semibold tracking-wide text-[var(--foreground)]">
          Raw Data Explorer
        </h1>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Title bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-1 text-[var(--foreground)]">Raw Submissions Table</h2>
              <p className="text-sm text-[var(--muted)]">
                Unprocessed citizen submissions from all wards. ({submissions.length} total)
              </p>
            </div>
            <button
              onClick={fetchSubmissions}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] rounded text-sm text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Refresh Data
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700 mb-6">
              <p className="text-sm font-medium">Error: {error}</p>
              <p className="text-xs mt-1 opacity-80">
                Check that your Supabase credentials are configured and the submissions table exists.
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[var(--muted)]" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && submissions.length === 0 && (
            <div className="border border-[var(--border)] rounded bg-[var(--card)] p-16 text-center">
              <Inbox size={32} className="mx-auto mb-4 text-[var(--muted)]" />
              <h3 className="text-base font-medium mb-1 text-[var(--foreground)]">No submissions found</h3>
              <p className="text-sm text-[var(--muted)] mb-6">
                Citizen submissions will appear here once they start coming in.
              </p>
              <Link href="/submit" className="text-sm border border-[var(--border)] bg-white px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                Submit Test Feedback
              </Link>
            </div>
          )}

          {/* Table */}
          {!isLoading && submissions.length > 0 && (
            <div className="border border-[var(--border)] rounded bg-[var(--background)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[var(--card)] border-b border-[var(--border)]">
                    <tr>
                      <th className="py-3 px-4 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Ward</th>
                      <th className="py-3 px-4 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Raw Text</th>
                      <th className="py-3 px-4 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Audio</th>
                      <th className="py-3 px-4 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Image</th>
                      <th className="py-3 px-4 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="border-b border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--secondary)]">
                          {formatDate(sub.created_at)}
                        </td>
                        <td className="py-3 px-4 text-sm text-[var(--foreground)]">
                          {sub.ward}
                        </td>
                        <td className="py-3 px-4 text-sm text-[var(--secondary)] max-w-xs truncate">
                          {sub.raw_text ? sub.raw_text : <span className="text-[var(--muted)] italic">None</span>}
                        </td>
                        <td className="py-3 px-4">
                          {sub.audio_url ? (
                            <audio controls preload="none" src={sub.audio_url} className="h-8 w-40 grayscale opacity-80" />
                          ) : (
                            <span className="text-sm text-[var(--muted)]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {sub.image_url ? (
                            <button
                              onClick={() => setExpandedImage(sub.image_url)}
                              className="block h-10 w-16 bg-gray-100 border border-[var(--border)] rounded overflow-hidden"
                            >
                              <img src={sub.image_url} alt="Submission" className="w-full h-full object-cover opacity-90 hover:opacity-100" />
                            </button>
                          ) : (
                            <span className="text-sm text-[var(--muted)]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--muted)] font-mono">
                          {sub.id.split('-')[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Image Lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm"
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="Full size"
            className="max-w-full max-h-full rounded border border-white/20 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
