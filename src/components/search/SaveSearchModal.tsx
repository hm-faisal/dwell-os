"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { getStoredToken, searchApi } from "@/lib/api";
import { dollarsToCents, formatDate } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import type {
  CreateSavedSearchDTO,
  SavedSearch,
  SearchFilters,
} from "@/types/search";

export interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onSaved?: (savedSearch: SavedSearch) => void;
}

export function SaveSearchModal({
  isOpen,
  onClose,
  filters,
  onSaved,
}: SaveSearchModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const token = getStoredToken();
      setIsAuthenticated(Boolean(token));

      // Generate a smart default name based on filters
      const parts = [];
      if (filters.location) parts.push(filters.location);
      if (filters.roomType) {
        parts.push(
          filters.roomType === "PRIVATE" ? "Private Room" : "Shared Room",
        );
      }
      if (filters.priceMax) parts.push(`Under $${filters.priceMax}`);
      setName(parts.length > 0 ? parts.join(" - ") : "My Saved Search");
    }
  }, [isOpen, filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast.error("Please enter a name for this search");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSavedSearchDTO = {
        name: name.trim(),
        location: filters.location?.trim() || undefined,
        priceMin:
          filters.priceMin !== undefined
            ? dollarsToCents(filters.priceMin)
            : undefined,
        priceMax:
          filters.priceMax !== undefined
            ? dollarsToCents(filters.priceMax)
            : undefined,
        roomType: filters.roomType,
        moveInDate: filters.moveInDate,
        amenities: filters.amenities || [],
      };

      const result = await searchApi.createSavedSearch(payload);
      showToast.success(
        "Search saved! We will alert you when new rooms match.",
      );
      onSaved?.(result);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save search criteria";
      showToast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Search & Enable Alerts"
      description="Save your search criteria to re-apply later and receive automated notifications when new matching rooms are listed."
    >
      {!isAuthenticated ? (
        <div className="space-y-4 py-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <svg
              className="w-6 h-6"
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
            <h4 className="font-semibold text-base text-zinc-950 dark:text-zinc-50">
              Sign In to Save Searches
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Create an account or sign in to save this query and receive
              instant notifications whenever a new room matches your criteria.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/login?redirect=/explore"
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
            <Link
              href="/register?redirect=/explore"
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Input
            label="Search Name"
            placeholder="e.g. Seattle Capitol Hill 2BR"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          {/* Filter summary card */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Criteria to be saved:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-400">Location: </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {filters.location || "Any"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Room Type: </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {filters.roomType || "Any"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Price Range: </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {filters.priceMin || filters.priceMax
                    ? `$${filters.priceMin ?? 0} - $${filters.priceMax ?? "Any"}`
                    : "Any"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Move-in: </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {filters.moveInDate ? formatDate(filters.moveInDate) : "Any"}
                </span>
              </div>
            </div>
            {filters.amenities && filters.amenities.length > 0 && (
              <div className="pt-1 text-[11px] text-zinc-500">
                <span className="text-zinc-400">Amenities: </span>
                {filters.amenities.join(", ")}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Automated notifications enabled for newly available matching rooms
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              Save Search & Alerts
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
