"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getStoredToken, searchApi } from "@/lib/api";
import { centsToDollars, formatCurrency, formatDate } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { SavedSearch, SearchFilters } from "@/types/search";

export interface SavedSearchesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySearch: (filters: SearchFilters) => void;
  onSearchesCountChange?: (count: number) => void;
}

export function SavedSearchesDrawer({
  isOpen,
  onClose,
  onApplySearch,
  onSearchesCountChange,
}: SavedSearchesDrawerProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSavedSearches = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await searchApi.getSavedSearches();
      setSearches(data);
      onSearchesCountChange?.(data.length);
    } catch {
      showToast.error("Failed to load saved searches");
    } finally {
      setIsLoading(false);
    }
  }, [onSearchesCountChange]);

  useEffect(() => {
    if (isOpen) {
      const token = getStoredToken();
      setIsAuthenticated(Boolean(token));
      if (token) {
        fetchSavedSearches();
      }
    }
  }, [isOpen, fetchSavedSearches]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await searchApi.deleteSavedSearch(id);
      const updated = searches.filter((s) => s.id !== id);
      setSearches(updated);
      onSearchesCountChange?.(updated.length);
      showToast.success("Saved search deleted");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete saved search";
      showToast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleApply = (search: SavedSearch) => {
    const filters: SearchFilters = {
      location: search.location || undefined,
      priceMin: search.priceMin ? centsToDollars(search.priceMin) : undefined,
      priceMax: search.priceMax ? centsToDollars(search.priceMax) : undefined,
      roomType: search.roomType || undefined,
      moveInDate: search.moveInDate || undefined,
      amenities:
        search.amenities && search.amenities.length > 0
          ? search.amenities
          : undefined,
      cursor: undefined,
    };

    onApplySearch(filters);
    onClose();
    showToast.success(
      `Applied filters from "${search.name || "Saved Search"}"`,
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Backdrop click-to-dismiss overlay
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape handler on window
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 dark:bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "w-full max-w-md h-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-l border-black/10 dark:border-white/10 shadow-2xl flex flex-col p-6 overflow-hidden",
          "animate-in slide-in-from-right duration-250 ease-out",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Saved Searches & Alerts"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-950 dark:text-zinc-50 tracking-tight">
                Saved Searches & Alerts
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {searches.length}{" "}
                {searches.length === 1 ? "saved query" : "saved queries"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.25"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {!isAuthenticated ? (
            <div className="text-center py-12 px-4 space-y-3">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Sign in to view and manage your saved searches
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Link
                  href="/login?redirect=/explore"
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <div className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
          ) : searches.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                No saved searches yet
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                Use the &ldquo;Save Search&rdquo; button on any query to
                bookmark it and receive instant notifications when matching
                rooms become available.
              </p>
            </div>
          ) : (
            searches.map((search) => (
              <div
                key={search.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-black/6 dark:border-white/8 hover:border-black/15 dark:hover:border-white/15 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">
                      {search.name || "Untitled Search"}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Created {formatDate(search.createdAt)}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Alerts Active
                  </span>
                </div>

                {/* Criteria tags */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {search.location && (
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-[11px]">
                      📍 {search.location}
                    </span>
                  )}
                  {(search.priceMin || search.priceMax) && (
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-[11px]">
                      💰{" "}
                      {search.priceMin ? formatCurrency(search.priceMin) : "$0"}{" "}
                      -{" "}
                      {search.priceMax
                        ? formatCurrency(search.priceMax)
                        : "Any"}
                    </span>
                  )}
                  {search.roomType && (
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-[11px]">
                      🚪 {search.roomType === "PRIVATE" ? "Private" : "Shared"}
                    </span>
                  )}
                  {search.moveInDate && (
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-[11px]">
                      🗓️ By {formatDate(search.moveInDate)}
                    </span>
                  )}
                  {search.amenities && search.amenities.length > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-[11px]">
                      ✨ {search.amenities.length} amenities
                    </span>
                  )}
                </div>

                {/* Actions: Apply & Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(search.id, e)}
                    disabled={deletingId === search.id}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium cursor-pointer"
                  >
                    {deletingId === search.id ? "Deleting..." : "Delete"}
                  </button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleApply(search)}
                    className="h-8 rounded-xl px-3 text-xs font-semibold"
                  >
                    Apply Search
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
