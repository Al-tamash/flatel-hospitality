"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 12;
const MAX_EDGE_PX = 2400;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
/** Matches the server limit; larger photos are shrunk in the browser first. */
const TARGET_BYTES = 3.5 * 1024 * 1024;

interface ImageUploaderProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  /** R2 folder the photos are stored under, e.g. the flat's slug. */
  folder: string;
  disabled?: boolean;
}

/** Shrinks big phone/camera photos so they fit the upload limit; small files pass through untouched. */
async function prepareForUpload(file: File): Promise<File> {
  if (file.size <= TARGET_BYTES && file.size <= 1.5 * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export function ImageUploader({ urls, onChange, folder, disabled }: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [manualUrl, setManualUrl] = React.useState("");

  const uploadFiles = async (picked: File[]) => {
    setMessage(null);
    const images = picked.filter((file) => ACCEPTED_TYPES.includes(file.type));
    if (images.length === 0) {
      setMessage("Choose JPG, PNG or WebP photos.");
      return;
    }
    const room = MAX_PHOTOS - urls.length;
    if (room <= 0) {
      setMessage(`A residence can have up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const batch = images.slice(0, room);

    setIsUploading(true);
    try {
      const prepared = await Promise.all(batch.map(prepareForUpload));
      const body = new FormData();
      prepared.forEach((file) => body.append("files", file));
      body.append("folder", folder);

      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as
        | { success: boolean; urls?: string[]; failed?: Array<{ name: string; error: string }>; error?: string }
        | null;

      if (!data?.success) {
        setMessage(data?.error || "Upload failed. Please try again.");
        return;
      }
      onChange([...urls, ...(data.urls ?? [])]);
      const problems = [
        ...(data.failed ?? []).map((item) => `${item.name}: ${item.error}`),
        ...(images.length > batch.length ? [`Only the first ${batch.length} photos were added (limit ${MAX_PHOTOS}).`] : []),
      ];
      if (problems.length > 0) setMessage(problems.join(" "));
    } catch {
      setMessage("Network error while uploading. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= urls.length) return;
    const next = [...urls];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addManualUrl = () => {
    const value = manualUrl.trim();
    if (!value) return;
    if (urls.includes(value)) {
      setMessage("That photo is already in the gallery.");
      return;
    }
    onChange([...urls, value]);
    setManualUrl("");
    setMessage(null);
  };

  const isFull = urls.length >= MAX_PHOTOS;

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !isFull) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled && !isFull) void uploadFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          "rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
          isDragging ? "border-gold bg-gold/10" : "border-line bg-ink"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="sr-only"
          aria-label="Choose residence photos to upload"
          onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))}
          disabled={disabled || isUploading || isFull}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading || isFull}
          className="inline-flex items-center gap-2 px-4 min-h-[40px] rounded-lg bg-gold text-ink text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {isUploading ? "Uploading…" : "Upload photos"}
        </button>
        <p className="mt-2 text-xs text-fg-muted">
          Drag photos here or browse. JPG, PNG or WebP · up to {MAX_PHOTOS} photos · {urls.length}/{MAX_PHOTOS} added
        </p>
      </div>

      {message && (
        <p role="alert" className="text-xs text-danger-soft">
          {message}
        </p>
      )}

      {urls.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {urls.map((url, index) => (
            <li
              key={url}
              className="relative aspect-video rounded-xl overflow-hidden bg-ink border border-line-soft group"
            >
              <Image src={url} alt={`Residence photo ${index + 1}`} fill sizes="160px" className="object-cover" />
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-gold text-ink px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-canvas/85 px-1 py-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move photo ${index + 1} earlier`}
                    className="w-6 h-6 rounded flex items-center justify-center text-fg hover:text-gold disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === urls.length - 1}
                    aria-label={`Move photo ${index + 1} later`}
                    className="w-6 h-6 rounded flex items-center justify-center text-fg hover:text-gold disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(urls.filter((_, i) => i !== index))}
                  aria-label={`Remove photo ${index + 1}`}
                  className="w-6 h-6 rounded flex items-center justify-center text-danger-soft hover:text-danger cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-fg-muted shrink-0" aria-hidden="true" />
        <input
          type="text"
          value={manualUrl}
          onChange={(event) => setManualUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addManualUrl();
            }
          }}
          placeholder="Or paste a photo link (R2 or /images/… path)"
          aria-label="Add a photo by link"
          disabled={disabled || isFull}
          className="flex-1 min-w-0 bg-ink border border-control rounded-lg px-3 py-1.5 text-xs text-fg font-mono focus:border-gold focus:outline-none"
        />
        <button
          type="button"
          onClick={addManualUrl}
          disabled={disabled || isFull || !manualUrl.trim()}
          className="px-3 min-h-[32px] rounded-lg border border-line text-xs font-semibold text-gold hover:border-gold disabled:opacity-40 cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}
