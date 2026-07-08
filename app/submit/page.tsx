"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Loader2,
  Send,
} from "lucide-react";
import Link from "next/link";
import AudioRecorder from "@/components/AudioRecorder";
import PhotoUpload from "@/components/PhotoUpload";
import { getSupabase } from "@/lib/supabase";
import type { Ward } from "@/types";

export default function SubmitPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [rawText, setRawText] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/data/wards.json")
      .then((res) => res.json())
      .then((data: Ward[]) => setWards(data))
      .catch((err) => console.error("Failed to load wards:", err));
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const uploadToStorage = useCallback(
    async (
      file: Blob | File,
      folder: string,
      extension: string
    ): Promise<string | null> => {
      const supabase = getSupabase();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
      const { data, error } = await supabase.storage
        .from("civiclens-media")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error(`Upload error (${folder}):`, error);
        throw new Error(`Failed to upload ${folder}: ${error.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("civiclens-media").getPublicUrl(data.path);

      return publicUrl;
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rawText.trim() && !audioBlob) {
      setToast({
        type: "error",
        message: "Please provide a text description or voice recording.",
      });
      return;
    }

    if (!selectedWard) {
      setToast({ type: "error", message: "Please select your ward." });
      return;
    }

    setIsSubmitting(true);

    try {
      let audioUrl: string | null = null;
      let imageUrl: string | null = null;

      if (audioBlob) {
        audioUrl = await uploadToStorage(audioBlob, "audio", "webm");
      }

      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        imageUrl = await uploadToStorage(imageFile, "images", ext);
      }

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_text: rawText.trim() || null,
          audio_url: audioUrl,
          image_url: imageUrl,
          ward: selectedWard,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `Submission failed with status ${response.status}`
        );
      }

      setRawText("");
      setSelectedWard("");
      setAudioBlob(null);
      setImageFile(null);
      setToast({
        type: "success",
        message: "Thank you. Your feedback has been submitted successfully.",
      });
    } catch (error) {
      console.error("Submission error:", error);
      setToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[var(--background)]">
      <main className="app-container py-8 md:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-medium text-[var(--muted-strong)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to home
          </Link>
          <div
            className="status-pill"
            aria-label="Supported submission languages: English, Hindi, Bengali"
            role="status"
          >
            <Globe2 size={14} aria-hidden="true" />
            EN / HI / BN
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <section className="max-w-xl">
            <p className="section-eyebrow mb-3">Citizen submission</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
              Report a local civic concern
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--muted-strong)]">
              Share the issue in the language you are most comfortable with.
              Your ward, description, and evidence help representatives review
              needs with better context.
            </p>
            <div className="trust-note mt-6 p-4">
              <h2 className="text-sm font-semibold">How this is used</h2>
              <p className="mt-2 text-sm leading-6">
                Submissions are grouped for MP and staff review. Gemini 2.5 may
                assist with translation and synthesis, but final action requires
                human verification.
              </p>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="panel p-5 md:p-6">
            <div className="border-b border-[var(--border)] pb-5">
              <h2 className="text-xl font-semibold tracking-tight">
                Submission details
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Ward and either text or voice are required. Photo evidence is
                optional.
              </p>
            </div>

            <div className="space-y-7 py-6">
              <section>
                <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
                  1. Location
                </h3>
                <label
                  htmlFor="ward"
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  Ward / Constituency{" "}
                  <span className="text-[var(--danger)]" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="ward"
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="min-h-11 w-full px-3 text-sm"
                  required
                >
                  <option value="">Select your ward</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.name}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </section>

              <section className="border-t border-[var(--border)] pt-6">
                <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
                  2. Concern
                </h3>
                <label
                  htmlFor="rawText"
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  Describe your concern{" "}
                  <span className="text-xs font-normal text-[var(--muted)]">
                    Any language
                  </span>
                </label>
                <textarea
                  id="rawText"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="min-h-36 w-full px-3 py-3 text-sm leading-6"
                  rows={6}
                  placeholder="Example: The streetlight on our lane has been out for two weeks."
                />
              </section>

              <section className="border-t border-[var(--border)] pt-6">
                <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
                  3. Evidence
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                      Voice recording{" "}
                      <span className="text-xs font-normal text-[var(--muted)]">
                        Optional
                      </span>
                    </label>
                    <AudioRecorder
                      onRecordingComplete={setAudioBlob}
                      onClear={() => setAudioBlob(null)}
                      hasRecording={audioBlob !== null}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                      Photo evidence{" "}
                      <span className="text-xs font-normal text-[var(--muted)]">
                        Optional
                      </span>
                    </label>
                    <PhotoUpload
                      onFileSelected={setImageFile}
                      onClear={() => setImageFile(null)}
                      hasFile={imageFile !== null}
                    />
                  </div>
                </div>
              </section>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full px-4 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Submitting feedback
                </>
              ) : (
                <>
                  <Send size={16} aria-hidden="true" />
                  Submit official feedback
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded border bg-[var(--card)] p-4 text-sm font-medium shadow-sm ${
            toast.type === "success"
              ? "border-[var(--success)] text-[var(--success)]"
              : "border-[var(--danger)] text-[var(--danger)]"
          }`}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
