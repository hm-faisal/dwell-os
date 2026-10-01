"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { uploadsApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export interface PhotoUploadFieldProps {
  value?: string[];
  onChange: (photos: string[]) => void;
  label?: string;
  helperText?: string;
  maxPhotos?: number;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function PhotoUploadField({
  value = [],
  onChange,
  label = "Photos",
  helperText = "Upload high quality photos (JPEG, PNG, WebP up to 10MB) or paste external URLs.",
  maxPhotos = 20,
  disabled = false,
}: PhotoUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [isUrlInputVisible, setIsUrlInputVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (disabled || isUploading) return;

    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    if (value.length + fileList.length > maxPhotos) {
      showToast.warning("Photo Limit Reached", {
        description: `You can upload up to ${maxPhotos} photos maximum.`,
      });
      return;
    }

    // Validate files before upload
    for (const file of fileList) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        showToast.error("Invalid File Format", {
          description: `"${file.name}" is not a supported format. Please upload JPEG, PNG, or WebP images.`,
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        showToast.error("File Too Large", {
          description: `"${file.name}" exceeds the 10MB limit.`,
        });
        return;
      }
    }

    try {
      setIsUploading(true);
      const uploadPromises = fileList.map((file) =>
        uploadsApi.uploadImage(file),
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.url);

      onChange([...value, ...newUrls]);
      showToast.success(
        fileList.length === 1
          ? "Photo uploaded"
          : `${fileList.length} photos uploaded`,
        {
          description: "Images have been saved to cloud storage.",
        },
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload photo";
      showToast.error(msg, {
        title: "Photo upload failed",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualUrl.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      showToast.warning("Invalid URL", {
        description: "Please enter a valid HTTP or HTTPS image URL.",
      });
      return;
    }

    if (value.includes(trimmed)) {
      showToast.warning("Duplicate Photo", {
        description: "This photo URL has already been added.",
      });
      return;
    }

    if (value.length >= maxPhotos) {
      showToast.warning("Photo Limit Reached", {
        description: `You can upload up to ${maxPhotos} photos maximum.`,
      });
      return;
    }

    onChange([...value, trimmed]);
    setManualUrl("");
    showToast.success("Photo added from URL");
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Label & Header */}
      <div className="flex items-center justify-between">
        <div>
          {label && (
            <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              {label}
            </span>
          )}
          {helperText && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {helperText}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsUrlInputVisible(!isUrlInputVisible)}
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline cursor-pointer"
        >
          {isUrlInputVisible ? "Hide URL Input" : "+ Add from URL"}
        </button>
      </div>

      {/* Manual URL Input Fallback */}
      {isUrlInputVisible && (
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Paste External Image URL
          </span>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/20 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddManualUrl}
              disabled={disabled || !manualUrl.trim()}
            >
              Add URL
            </Button>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <label
        htmlFor="photo-upload-input"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 select-none block",
          "apple-card apple-rim-highlight flex flex-col items-center justify-center gap-3",
          isDragging
            ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100/90 dark:bg-zinc-800/90 scale-[1.008]"
            : "border-zinc-300/80 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/40",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        )}
      >
        <input
          id="photo-upload-input"
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <svg
              className="w-7 h-7 animate-spin text-zinc-900 dark:text-zinc-100"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Uploading image to cloud storage...
            </span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-xs">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Click or drag & drop to upload photos
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                JPEG, PNG, WebP or GIF up to 10MB
              </p>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center justify-center font-medium select-none cursor-pointer transition-all duration-150 border border-zinc-200/90 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xs text-zinc-900 dark:text-zinc-100 shadow-xs hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 h-8 rounded-lg px-3 text-xs gap-1.5 active:scale-[0.97]">
                Browse Files
              </span>
            </div>
          </>
        )}
      </label>

      {/* Thumbnails Gallery */}
      {value.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {value.length} {value.length === 1 ? "photo" : "photos"} selected
            </span>
            <span>First photo will be displayed as the main cover</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {value.map((url, idx) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Photo list ordering
                key={`${url}-${idx}`}
                className="relative group rounded-2xl overflow-hidden border border-black/8 dark:border-white/10 h-28 bg-zinc-100 dark:bg-zinc-800 shadow-2xs"
              >
                {/* biome-ignore lint/performance/noImgElement: Dynamic user-supplied property photo */}
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />

                {/* Cover badge on first image */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Cover
                  </div>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(idx);
                  }}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-rose-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-90 group-hover:opacity-100 transition-colors shadow-xs cursor-pointer"
                  aria-label={`Remove photo ${idx + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
