"use client";

import { Button } from "@/components/ui/Button";
import type { ListingTypeFilter, SearchResultProperty } from "@/types/search";
import { ListingCard } from "./ListingCard";
import { matchesListingType } from "./ListingTypeToggle";

export interface ListingGridProps {
  properties: SearchResultProperty[];
  listingType?: ListingTypeFilter;
  requestedMoveInDate?: string;
  isLoading?: boolean;
  onResetFilters?: () => void;
  onFocusOnMap?: (property: SearchResultProperty) => void;
}

export function ListingSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white/50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 animate-pulse">
      <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/2" />
        <div className="pt-2 space-y-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3" />
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full" />
        </div>
        <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full pt-2" />
      </div>
    </div>
  );
}

export function ListingGrid({
  properties,
  listingType = "ALL",
  requestedMoveInDate,
  isLoading = false,
  onResetFilters,
  onFocusOnMap,
}: ListingGridProps) {
  // Client-side segregation filter
  const filteredProperties = properties.filter((p) =>
    matchesListingType(p, listingType),
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListingSkeleton />
        <ListingSkeleton />
        <ListingSkeleton />
        <ListingSkeleton />
        <ListingSkeleton />
        <ListingSkeleton />
      </div>
    );
  }

  if (filteredProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/6 dark:border-white/10 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-4">
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          No listings found
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
          {listingType === "ROOMMATE"
            ? "No roommate-based listings match your current filters. Try switching to 'All Listings' or adjusting your move-in date and price criteria."
            : listingType === "VACANT"
              ? "No owner-vacant properties match your current filters. Try expanding your search location or price range."
              : "No properties or rooms matched your search criteria. Try broadening your location, price, or amenity options."}
        </p>

        {onResetFilters && (
          <div className="mt-5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onResetFilters}
              className="rounded-xl px-4 text-xs font-semibold"
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <ListingCard
            key={property.id}
            property={property}
            requestedMoveInDate={requestedMoveInDate}
            onFocusOnMap={onFocusOnMap}
          />
        ))}
      </div>
    </div>
  );
}
