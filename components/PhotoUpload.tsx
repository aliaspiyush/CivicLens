"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

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
        alert("Please select an image file (JPEG, PNG, WebP, etc.).");
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
      <div className="relative rounded overflow-hidden border border-[var(--border)] bg-[var(--background)]">
        <img
          src={previewUrl}
          alt="Upload preview"
          className="w-full h-48 object-cover"
        />
        <div className="flex items-center justify-between p-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon size={14} className="text-[var(--muted)]" />
            <span className="text-xs truncate text-[var(--muted)]">
              {fileName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-[var(--muted)] hover:text-red-600 transition-colors"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border border-dashed rounded p-8 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--muted)] ${
        isDragging
          ? "border-[var(--foreground)] bg-[var(--card)]"
          : "border-[var(--border)] hover:border-[var(--muted)] hover:bg-[var(--card-hover)]"
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
      <Upload size={24} className="mx-auto mb-3 text-[var(--muted)]" />
      <p className="text-sm font-medium mb-1 text-[var(--foreground)]">
        Drop an image here or click to browse
      </p>
      <p className="text-xs text-[var(--muted)]">
        JPEG, PNG, WebP - up to 10 MB
      </p>
    </div>
  );
}
