"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Pause, Play, Square, Trash2 } from "lucide-react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onClear: () => void;
  hasRecording: boolean;
}

export default function AudioRecorder({
  onRecordingComplete,
  onClear,
  hasRecording,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert(
        "Microphone access is required for voice recording. Please allow microphone permission."
      );
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
    onClear();
  }, [audioUrl, onClear]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (hasRecording) {
    return (
      <div className="flex items-center gap-3 rounded border border-[var(--border)] bg-[var(--card-hover)] p-3">
        <button
          type="button"
          onClick={togglePlayback}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-colors hover:bg-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
          aria-label={isPlaying ? "Pause recording" : "Play recording"}
        >
          {isPlaying ? (
            <Pause size={16} aria-hidden="true" />
          ) : (
            <Play size={16} className="ml-0.5" aria-hidden="true" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
            Voice recording attached
          </p>
          <p className="text-xs text-[var(--muted)]">
            Duration {formatTime(duration)}
          </p>
        </div>

        <button
          type="button"
          onClick={clearRecording}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-[var(--muted-strong)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)]"
          aria-label="Remove recording"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded border border-[var(--border)] bg-[var(--card-hover)] p-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)] ${
            isRecording
              ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
              : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--background)]"
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <Square size={20} fill="currentColor" aria-hidden="true" />
          ) : (
            <Mic size={20} aria-hidden="true" />
          )}
        </button>

        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {isRecording ? "Recording in progress" : "Record a voice note"}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            {isRecording
              ? `Tap stop when finished. Duration ${formatTime(duration)}`
              : "Use this if typing is difficult or the issue is easier to explain aloud."}
          </p>
        </div>
      </div>
    </div>
  );
}
