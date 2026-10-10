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
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
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
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/45 dark:bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "relative w-full max-w-lg max-h-[88vh] flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden apple-rim-highlight animate-in zoom-in-95 duration-200 ease-[var(--ease-spring-default)]",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header - Pinned */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
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
            className="w-7 h-7 shrink-0 ml-3 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all active:scale-90 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 cursor-pointer"
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

        {/* Scrollable Content Body with Visible Scrollbar */}
        <div
          className={cn(
            "p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 overscroll-contain modal-scrollbar",
            contentClassName,
          )}
        >
          {children}
        </div>

        {/* Optional Pinned Footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80 shrink-0 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
