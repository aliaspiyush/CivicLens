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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center gap-4"
        style={{
          background: "rgba(10, 10, 18, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium no-underline"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={16} />
          Home
        </Link>
        <div className="flex-1" />
        <h1
          className="text-sm font-semibold tracking-wide"
          style={{ color: "var(--accent-light)" }}
        >
          CivicLens Admin
        </h1>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Title bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-bold mb-1">Raw Submissions</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                All citizen submissions, newest first. {submissions.length} total.
              </p>
            </div>
            <button
              onClick={fetchSubmissions}
              disabled={isLoading}
              className="btn-secondary"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Refresh
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#f87171",
              }}
            >
              <p className="text-sm font-medium">Error: {error}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Check that your Supabase credentials are configured and the submissions table exists.
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "var(--accent)" }}
              />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && submissions.length === 0 && (
            <div className="glass-card p-16 text-center">
              <Inbox
                size={48}
                className="mx-auto mb-4"
                style={{ color: "var(--muted)" }}
              />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                Citizen submissions will appear here once they start coming in.
              </p>
              <Link href="/submit" className="btn-primary no-underline">
                Submit Test Feedback
              </Link>
            </div>
          )}

          {/* Table */}
          {!isLoading && submissions.length > 0 && (
            <div className="glass-card overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="civic-table">
                  <thead>
                    <tr>
                      <th>Created At</th>
                      <th>Ward</th>
                      <th>Raw Text</th>
                      <th>Audio</th>
                      <th>Image</th>
                      <th>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td className="whitespace-nowrap">
                          <span className="text-xs">{formatDate(sub.created_at)}</span>
                        </td>
                        <td>
                          <span className="badge badge-accent">{sub.ward}</span>
                        </td>
                        <td style={{ maxWidth: 320 }}>
                          {sub.raw_text ? (
                            <p className="text-sm leading-relaxed line-clamp-3">
                              {sub.raw_text}
                            </p>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--muted)" }}>
                              — No text —
                            </span>
                          )}
                        </td>
                        <td>
                          {sub.audio_url ? (
                            <div className="flex flex-col gap-2">
                              <span className="badge badge-success">
                                <Mic size={10} /> Audio
                              </span>
                              <audio
                                controls
                                preload="none"
                                src={sub.audio_url}
                                className="h-8 w-40"
                                style={{ filter: "invert(1) hue-rotate(180deg)" }}
                              />
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--muted)" }}>
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          {sub.image_url ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => setExpandedImage(sub.image_url)}
                                className="block rounded-lg overflow-hidden border transition-transform hover:scale-105"
                                style={{
                                  borderColor: "var(--border)",
                                  width: 80,
                                  height: 56,
                                }}
                              >
                                <img
                                  src={sub.image_url}
                                  alt="Submission"
                                  className="w-full h-full object-cover"
                                />
                              </button>
                              <a
                                href={sub.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs no-underline"
                                style={{ color: "var(--accent-light)" }}
                              >
                                <ExternalLink size={10} />
                                Open
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--muted)" }}>
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          <code
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: "var(--input-bg)",
                              color: "var(--muted)",
                              fontSize: "0.65rem",
                            }}
                          >
                            {sub.id.slice(0, 8)}…
                          </code>
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
          className="fixed inset-0 z-[200] flex items-center justify-center p-8"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="Full size"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            style={{ border: "1px solid var(--border)" }}
          />
        </div>
      )}
    </div>
  );
}
