"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, ArrowLeft, Loader2, CheckCircle2, Globe2 } from "lucide-react";
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

  // Load wards from static JSON
  useEffect(() => {
    fetch("/data/wards.json")
      .then((res) => res.json())
      .then((data: Ward[]) => setWards(data))
      .catch((err) => console.error("Failed to load wards:", err));
  }, []);

  // Auto-dismiss toast
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
        message: "Please provide at least a text description or voice recording.",
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

      // Upload audio if present
      if (audioBlob) {
        audioUrl = await uploadToStorage(audioBlob, "audio", "webm");
      }

      // Upload image if present
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        imageUrl = await uploadToStorage(imageFile, "images", ext);
      }

      // Submit to API route
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

      // Success — reset form
      setRawText("");
      setSelectedWard("");
      setAudioBlob(null);
      setImageFile(null);
      setToast({
        type: "success",
        message: "Thank you! Your feedback has been submitted successfully.",
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
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)] border border-[var(--border)] px-2 py-1 rounded">
          <Globe2 size={14} />
          <span>EN | HI | BN</span>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-[var(--background)] border border-[var(--border)] rounded p-8 md:p-10 shadow-sm"
        >
          <div className="mb-8 border-b border-[var(--border)] pb-6">
            <h2 className="text-2xl font-semibold mb-2 text-[var(--foreground)] tracking-tight">
              Submit Citizen Feedback
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Use this official portal to submit civic issues to your local representative.
              Submissions are processed and categorized for the Member of Parliament.
            </p>
          </div>

          {/* Ward Selection */}
          <div className="mb-6">
            <label htmlFor="ward" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Ward / Constituency <span className="text-red-600">*</span>
            </label>
            <select
              id="ward"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full p-2.5 rounded text-sm bg-[var(--background)] border border-[var(--border)] focus:border-[var(--muted)] focus:outline-none"
              required
            >
              <option value="">Select your ward...</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.name}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input */}
          <div className="mb-6">
            <label htmlFor="rawText" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Describe your concern <span className="text-[var(--muted)] font-normal text-xs">(Any language)</span>
            </label>
            <textarea
              id="rawText"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3 rounded text-sm bg-[var(--background)] border border-[var(--border)] focus:border-[var(--muted)] focus:outline-none"
              rows={5}
              placeholder="e.g. The streetlight on our lane has been out for two weeks..."
              style={{ resize: "vertical", minHeight: 120 }}
            />
          </div>

          {/* Audio Recorder */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Voice Recording <span className="text-[var(--muted)] font-normal text-xs">(Optional)</span>
            </label>
            <AudioRecorder
              onRecordingComplete={setAudioBlob}
              onClear={() => setAudioBlob(null)}
              hasRecording={audioBlob !== null}
            />
          </div>

          {/* Photo Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Photo Evidence <span className="text-[var(--muted)] font-normal text-xs">(Optional)</span>
            </label>
            <PhotoUpload
              onFileSelected={setImageFile}
              onClear={() => setImageFile(null)}
              hasFile={imageFile !== null}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[var(--foreground)] text-[var(--background)] rounded font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Official Feedback
              </>
            )}
          </button>
        </form>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded border text-sm font-medium flex items-center gap-2 shadow-sm bg-[var(--background)] ${toast.type === 'success' ? 'border-green-600 text-green-700' : 'border-red-600 text-red-700'}`}>
          {toast.type === "success" && <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
