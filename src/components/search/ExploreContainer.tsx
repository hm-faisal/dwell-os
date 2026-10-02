"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getStoredToken, searchApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { RoomType } from "@/types/room";
import type {
  ListingTypeFilter,
  SearchFilters,
  SearchResultProperty,
} from "@/types/search";
import { ListingGrid } from "./ListingGrid";
import {
  isOwnerVacantListing,
  isRoommateListing,
  ListingTypeToggle,
} from "./ListingTypeToggle";
import { MapRadiusView } from "./MapRadiusView";
import { SavedSearchesDrawer } from "./SavedSearchesDrawer";
import { SaveSearchModal } from "./SaveSearchModal";
import { SearchFilterBar } from "./SearchFilterBar";

export function ExploreSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-1/3" />
      <div className="h-14 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full" />
      <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
      </div>
    </div>
  );
}

export function ExploreContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from searchParams
  const filters: SearchFilters = useMemo(() => {
    const location = searchParams.get("location") || undefined;
    const priceMinStr = searchParams.get("priceMin");
    const priceMaxStr = searchParams.get("priceMax");
    const roomType = (searchParams.get("roomType") as RoomType) || undefined;
    const isFurnishedStr = searchParams.get("isFurnished");
    const moveInDate = searchParams.get("moveInDate") || undefined;
    const amenitiesStr = searchParams.get("amenities");
    const listingType =
      (searchParams.get("listingType") as ListingTypeFilter) || "ALL";

    return {
      location,
      priceMin: priceMinStr ? Number.parseInt(priceMinStr, 10) : undefined,
      priceMax: priceMaxStr ? Number.parseInt(priceMaxStr, 10) : undefined,
      roomType,
      isFurnished:
        isFurnishedStr === "true"
          ? true
          : isFurnishedStr === "false"
            ? false
            : undefined,
      moveInDate,
      amenities: amenitiesStr
        ? amenitiesStr.split(",").filter(Boolean)
        : undefined,
      listingType,
    };
  }, [searchParams]);

  const [properties, setProperties] = useState<SearchResultProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMapProperty, setSelectedMapProperty] =
    useState<SearchResultProperty | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map" | "split">("grid");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedSearchesCount, setSavedSearchesCount] = useState(0);

  // Sync URL search params when filters change
  const updateUrlFilters = useCallback(
    (newFilters: SearchFilters) => {
      const params = new URLSearchParams();
      if (newFilters.location) params.set("location", newFilters.location);
      if (newFilters.priceMin !== undefined) {
        params.set("priceMin", String(newFilters.priceMin));
      }
      if (newFilters.priceMax !== undefined) {
        params.set("priceMax", String(newFilters.priceMax));
      }
      if (newFilters.roomType) params.set("roomType", newFilters.roomType);
      if (newFilters.isFurnished !== undefined) {
        params.set("isFurnished", String(newFilters.isFurnished));
      }
      if (newFilters.moveInDate)
        params.set("moveInDate", newFilters.moveInDate);
      if (newFilters.amenities && newFilters.amenities.length > 0) {
        params.set("amenities", newFilters.amenities.join(","));
      }
      if (newFilters.listingType && newFilters.listingType !== "ALL") {
        params.set("listingType", newFilters.listingType);
      }

      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [router, pathname],
  );

  // Initial load of saved searches count for authenticated users
  useEffect(() => {
    if (getStoredToken()) {
      searchApi
        .getSavedSearches()
        .then((res) => setSavedSearchesCount(res.length))
        .catch(() => {});
    }
  }, []);

  // Fetch search results whenever filters change
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    searchApi
      .searchProperties(filters)
      .then((res) => {
        if (!isCancelled) {
          setProperties(res.items);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setIsLoading(false);
          const msg =
            err instanceof Error ? err.message : "Failed to load properties";
          showToast.error(msg);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [filters]);

  // Compute listing type counts for pill toggle (FR-2.2)
  const listingCounts = useMemo(() => {
    const roommate = properties.filter(isRoommateListing).length;
    const vacant = properties.filter(isOwnerVacantListing).length;
    return {
      all: properties.length,
      roommate,
      vacant,
    };
  }, [properties]);

  const handleResetFilters = () => {
    updateUrlFilters({ listingType: "ALL" });
  };

  const handleFocusOnMap = (property: SearchResultProperty) => {
    setSelectedMapProperty(property);
    setViewMode("split");
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Title & Intro */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Search & Discover
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Find available rooms across verified properties with real-time move-in
          dates, roommate voting, and custom alert notifications.
        </p>
      </div>

      {/* Multimodal Filter Bar (FR-2.1, FR-2.3) */}
      <SearchFilterBar
        filters={filters}
        onChange={updateUrlFilters}
        onReset={handleResetFilters}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        savedSearchesCount={savedSearchesCount}
        totalResultsCount={properties.length}
        isLoading={isLoading}
      />

      {/* Secondary Controls: Listing Type Segregation (FR-2.2) & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <ListingTypeToggle
          value={filters.listingType || "ALL"}
          onChange={(newType) =>
            updateUrlFilters({ ...filters, listingType: newType })
          }
          counts={listingCounts}
        />

        {/* View Switcher: Grid, Map Radar, or Split */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Listings
          </button>

          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              viewMode === "split"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
            Split View
          </button>

          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              viewMode === "map"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
            Radar Map
          </button>
        </div>
      </div>

      {/* Main Content Layout based on viewMode */}
      {viewMode === "grid" && (
        <ListingGrid
          properties={properties}
          listingType={filters.listingType}
          requestedMoveInDate={filters.moveInDate}
          isLoading={isLoading}
          onResetFilters={handleResetFilters}
          onFocusOnMap={handleFocusOnMap}
        />
      )}

      {viewMode === "map" && (
        <MapRadiusView
          properties={properties}
          selectedProperty={selectedMapProperty}
          onSelectProperty={setSelectedMapProperty}
        />
      )}

      {viewMode === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <ListingGrid
              properties={properties}
              listingType={filters.listingType}
              requestedMoveInDate={filters.moveInDate}
              isLoading={isLoading}
              onResetFilters={handleResetFilters}
              onFocusOnMap={handleFocusOnMap}
            />
          </div>
          <div className="lg:col-span-5 sticky top-20">
            <MapRadiusView
              properties={properties}
              selectedProperty={selectedMapProperty}
              onSelectProperty={setSelectedMapProperty}
              className="min-h-[500px]"
            />
          </div>
        </div>
      )}

      {/* Save Search Modal (FR-2.4) */}
      <SaveSearchModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        filters={filters}
        onSaved={() => setSavedSearchesCount((c) => c + 1)}
      />

      {/* Saved Searches Drawer (FR-2.4) */}
      <SavedSearchesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        onApplySearch={updateUrlFilters}
        onSearchesCountChange={setSavedSearchesCount}
      />
    </div>
  );
}
