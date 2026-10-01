"use client";

import type React from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Backdrop click-to-dismiss overlay
    // biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard dismissal is handled via window Escape keydown listener
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 dark:bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "relative w-full max-w-lg bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden apple-rim-highlight animate-in zoom-in-95 duration-200 ease-[var(--ease-spring-default)]",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h3
              id="modal-title"
              className="text-lg font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50"
            >
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all active:scale-90 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Close icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.25"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
