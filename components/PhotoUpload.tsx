"use client";

import { useState, useRef, useCallback } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";

interface PhotoUploadProps {
  onFileSelected: (file: File) => void;
  onClear: () => void;
  hasFile: boolean;
}

export default function PhotoUpload({
  onFileSelected,
  onClear,
  hasFile,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file such as JPEG, PNG, or WebP.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be smaller than 10 MB.");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileName(file.name);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  }, [previewUrl, onClear]);

  if (hasFile && previewUrl) {
    return (
      <div className="overflow-hidden rounded border border-[var(--border)] bg-[var(--card)]">
        <img
          src={previewUrl}
          alt="Upload preview"
          className="h-52 w-full object-cover"
        />
        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--card-hover)] p-3">
          <div className="flex min-w-0 items-center gap-2">
            <ImageIcon size={15} className="text-[var(--muted)]" aria-hidden="true" />
            <span className="truncate text-sm font-medium text-[var(--secondary)]">
              {fileName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[var(--muted-strong)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
            aria-label="Remove image"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded border border-dashed p-5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-action)] ${
        isDragging
          ? "border-[var(--accent-action)] bg-[var(--accent-soft)]"
          : "border-[var(--border-strong)] bg-[var(--card-hover)] hover:border-[var(--accent-action)]"
      }`}
      tabIndex={0}
      role="button"
      aria-label="Upload photo evidence"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--card)]">
          <Upload size={18} className="text-[var(--muted-strong)]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Upload a photo
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Drop an image here or click to browse. JPEG, PNG, and WebP are
            supported up to 10 MB.
          </p>
        </div>
      </div>
    </div>
  );
}
