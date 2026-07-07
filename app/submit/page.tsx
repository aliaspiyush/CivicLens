"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
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
          Back
        </Link>
        <div className="flex-1" />
        <h1
          className="text-sm font-semibold tracking-wide"
          style={{ color: "var(--accent-light)" }}
        >
          CivicLens
        </h1>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="glass-card w-full max-w-2xl p-8 md:p-10 animate-fade-in-up"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Submit Your Feedback
            </h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Write in any language, record your voice, or attach a photo.
            </p>
          </div>

          {/* Ward Selection */}
          <div className="mb-6 animate-fade-in-up-delay-1">
            <label htmlFor="ward" className="civic-label">
              Ward / Location{" "}
              <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              id="ward"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="civic-select"
              required
            >
              <option value="">Select your ward...</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.name}>
                  {ward.name} — {ward.zone}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input */}
          <div className="mb-6 animate-fade-in-up-delay-2">
            <label htmlFor="rawText" className="civic-label">
              Describe your concern{" "}
              <span className="civic-label-hint">(any language)</span>
            </label>
            <textarea
              id="rawText"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="civic-input"
              rows={5}
              placeholder="e.g. हमारी गली में दो हफ्ते से स्ट्रीट लाइट बंद है... / The streetlight on our lane has been out for two weeks..."
              style={{ resize: "vertical", minHeight: 120 }}
            />
          </div>

          {/* Audio Recorder */}
          <div className="mb-6 animate-fade-in-up-delay-3">
            <label className="civic-label mb-3 block">
              Voice Recording{" "}
              <span className="civic-label-hint">(optional)</span>
            </label>
            <AudioRecorder
              onRecordingComplete={setAudioBlob}
              onClear={() => setAudioBlob(null)}
              hasRecording={audioBlob !== null}
            />
          </div>

          {/* Photo Upload */}
          <div className="mb-8">
            <label className="civic-label mb-3 block">
              Photo Evidence{" "}
              <span className="civic-label-hint">(optional)</span>
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
            className="btn-primary w-full py-4 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="flex items-center gap-2">
            {toast.type === "success" && <CheckCircle2 size={16} />}
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}
