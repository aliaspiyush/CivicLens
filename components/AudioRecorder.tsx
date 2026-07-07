"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";

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

  return (
    <div className="flex flex-col items-center gap-4">
      {!hasRecording ? (
        <>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`recorder-ring ${isRecording ? "recording" : "idle"}`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <Square size={24} className="text-danger" fill="currentColor" />
            ) : (
              <Mic size={28} style={{ color: "var(--muted)" }} />
            )}
          </button>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {isRecording ? (
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "var(--danger)" }}
                />
                Recording... {formatTime(duration)}
              </span>
            ) : (
              "Tap to start recording"
            )}
          </p>
        </>
      ) : (
        <div
          className="flex items-center gap-4 w-full p-4 rounded-xl"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--input-border)",
          }}
        >
          <button
            type="button"
            onClick={togglePlayback}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--accent-glow)" }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={18} className="text-accent-light" />
            ) : (
              <Play size={18} className="text-accent-light" style={{ marginLeft: 2 }} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Voice Recording</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Duration: {formatTime(duration)}
            </p>
          </div>

          <button
            type="button"
            onClick={clearRecording}
            className="btn-danger px-3 py-2"
            aria-label="Remove recording"
          >
            <Trash2 size={14} />
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
      )}
    </div>
  );
}
