"use client";

import { useEffect, useState } from "react";
import { Button } from "@/lib/../components/ui/Button";
import { Select } from "@/lib/../components/ui/Select";
import { cn } from "@/lib/utils";
import { fairHousingCheck } from "@/lib/validations/search";
import type { RoomType } from "@/types/room";
import type { SearchFilters } from "@/types/search";

const COMMON_AMENITIES = [
  "High-Speed WiFi",
  "Air Conditioning",
  "In-Unit Laundry",
  "Parking",
  "Gym / Fitness Center",
  "24/7 Security",
  "Balcony",
  "Furnished Kitchen",
  "Pet Friendly",
  "Power Backup",
  "Study Room",
  "Elevator",
];

const ROOM_TYPE_OPTIONS = [
  { value: "", label: "All Room Types" },
  { value: "PRIVATE", label: "Private Room" },
  { value: "SHARED", label: "Shared Room" },
];

export interface SearchFilterBarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  onOpenSaveModal: () => void;
  onOpenSavedDrawer: () => void;
  savedSearchesCount?: number;
  totalResultsCount?: number;
  isLoading?: boolean;
}

export function SearchFilterBar({
  filters,
  onChange,
  onReset,
  onOpenSaveModal,
  onOpenSavedDrawer,
  savedSearchesCount = 0,
  totalResultsCount,
  isLoading = false,
}: SearchFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [locationInput, setLocationInput] = useState(filters.location || "");
  const [locationWarning, setLocationWarning] = useState<string | null>(null);

  // Sync internal input when external filters change
  useEffect(() => {
    setLocationInput(filters.location || "");
  }, [filters.location]);

  const handleLocationChange = (val: string) => {
    setLocationInput(val);
    if (!fairHousingCheck(val)) {
      setLocationWarning(
        "Notice: Housing searches cannot filter by demographic, religious, or familial terms under Fair Housing regulations.",
      );
    } else {
      setLocationWarning(null);
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fairHousingCheck(locationInput)) return;
    onChange({
      ...filters,
      location: locationInput.trim() || undefined,
      cursor: undefined,
    });
  };

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const num = value ? Number.parseInt(value, 10) : undefined;
    if (type === "min") {
      onChange({ ...filters, priceMin: num, cursor: undefined });
    } else {
      onChange({ ...filters, priceMax: num, cursor: undefined });
    }
  };

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as RoomType | "";
    onChange({
      ...filters,
      roomType: val ? val : undefined,
      cursor: undefined,
    });
  };

  const handleMoveInDateChange = (val: string) => {
    onChange({
      ...filters,
      moveInDate: val || undefined,
      cursor: undefined,
    });
  };

  const handleFurnishedToggle = (
    status: "any" | "furnished" | "unfurnished",
  ) => {
    let isFurnished: boolean | undefined;
    if (status === "furnished") isFurnished = true;
    else if (status === "unfurnished") isFurnished = false;
    else isFurnished = undefined;

    onChange({
      ...filters,
      isFurnished,
      cursor: undefined,
    });
  };

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];

    onChange({
      ...filters,
      amenities: updated.length > 0 ? updated : undefined,
      cursor: undefined,
    });
  };

  const activeFiltersCount = [
    Boolean(filters.location),
    filters.priceMin !== undefined,
    filters.priceMax !== undefined,
    Boolean(filters.roomType),
    filters.isFurnished !== undefined,
    Boolean(filters.moveInDate),
    (filters.amenities?.length || 0) > 0,
  ].filter(Boolean).length;

  return (
    <div className="w-full space-y-3">
      {/* Primary search bar & action buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search input with fair housing check */}
        <form
          onSubmit={handleLocationSubmit}
          className="relative flex-1 flex items-center"
        >
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by city, neighborhood, or area..."
              value={locationInput}
              onChange={(e) => handleLocationChange(e.target.value)}
              onBlur={() => {
                if (fairHousingCheck(locationInput)) {
                  onChange({
                    ...filters,
                    location: locationInput.trim() || undefined,
                    cursor: undefined,
                  });
                }
              }}
              className={cn(
                "w-full h-11 pl-10 pr-24 rounded-2xl border text-sm transition-all duration-150",
                "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs",
                "text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                "focus:outline-hidden focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300",
                locationWarning
                  ? "border-amber-500/80 focus:ring-amber-500/30"
                  : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20",
              )}
            />
            {locationInput && (
              <button
                type="button"
                onClick={() => {
                  setLocationInput("");
                  setLocationWarning(null);
                  onChange({
                    ...filters,
                    location: undefined,
                    cursor: undefined,
                  });
                }}
                className="absolute inset-y-0 right-12 flex items-center pr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                aria-label="Clear location search"
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="absolute inset-y-1.5 right-1.5 px-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold tracking-wide hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isLoading && (
                <svg
                  className="animate-spin h-3.5 w-3.5 text-current"
                  viewBox="0 0 24 24"
                  fill="none"
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
              )}
              Search
            </button>
          </div>
        </form>

        {/* Action pills: Filter drawer toggle, Save Search, Saved Searches list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {totalResultsCount !== undefined && (
            <div className="hidden lg:flex items-center text-xs text-zinc-500 font-medium px-2 whitespace-nowrap">
              {totalResultsCount}{" "}
              {totalResultsCount === 1 ? "listing" : "listings"}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "h-11 rounded-2xl px-4 text-xs font-medium border-black/10 dark:border-white/10",
              showAdvanced &&
                "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-950 dark:text-white",
            )}
          >
            <svg
              className="w-4 h-4 mr-1.5 text-zinc-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onOpenSaveModal}
            className="h-11 rounded-2xl px-3.5 text-xs font-medium border-black/10 dark:border-white/10"
            title="Save current search criteria and get notified for new rooms"
          >
            <svg
              className="w-4 h-4 mr-1 text-amber-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Save Search
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onOpenSavedDrawer}
            className="h-11 rounded-2xl px-3.5 text-xs font-medium border-black/10 dark:border-white/10"
            title="View saved searches & notification alerts"
          >
            <svg
              className="w-4 h-4 mr-1 text-sky-500"
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
            Alerts
            {savedSearchesCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold">
                {savedSearchesCount}
              </span>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onReset}
              className="h-11 rounded-2xl px-3 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Fair Housing Advisory warning if demographic keywords are typed */}
      {locationWarning && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2 animate-in fade-in duration-200">
          <svg
            className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{locationWarning}</span>
        </div>
      )}

      {/* Collapsible advanced filters panel */}
      {showAdvanced && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Price Range */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400">
                Monthly Rent (USD)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  aria-label="Minimum monthly rent in dollars"
                  placeholder="Min ($)"
                  min={0}
                  step={50}
                  value={filters.priceMin ?? ""}
                  onChange={(e) => handlePriceChange("min", e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                />
                <span className="text-zinc-400 text-xs">—</span>
                <input
                  type="number"
                  aria-label="Maximum monthly rent in dollars"
                  placeholder="Max ($)"
                  min={0}
                  step={50}
                  value={filters.priceMax ?? ""}
                  onChange={(e) => handlePriceChange("max", e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Room Type */}
            <div>
              <Select
                label="Room Configuration"
                options={ROOM_TYPE_OPTIONS}
                value={filters.roomType || ""}
                onChange={handleRoomTypeChange}
              />
            </div>

            {/* Requested Move-in Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="search-filter-move-in-date"
                className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
              >
                Move-in Date
              </label>
              <input
                id="search-filter-move-in-date"
                type="date"
                value={
                  filters.moveInDate ? filters.moveInDate.split("T")[0] : ""
                }
                onChange={(e) => handleMoveInDateChange(e.target.value)}
                className="w-full h-9.5 px-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Only shows rooms available on or before this date
              </p>
            </div>

            {/* Furnishing Preference */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400">
                Furnishing
              </span>
              <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 border border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => handleFurnishedToggle("any")}
                  className={cn(
                    "flex-1 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer",
                    filters.isFurnished === undefined
                      ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400",
                  )}
                >
                  Any
                </button>
                <button
                  type="button"
                  onClick={() => handleFurnishedToggle("furnished")}
                  className={cn(
                    "flex-1 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer",
                    filters.isFurnished === true
                      ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400",
                  )}
                >
                  Furnished
                </button>
                <button
                  type="button"
                  onClick={() => handleFurnishedToggle("unfurnished")}
                  className={cn(
                    "flex-1 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer",
                    filters.isFurnished === false
                      ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400",
                  )}
                >
                  Unfurnished
                </button>
              </div>
            </div>
          </div>

          {/* Amenities Multi-Select Pills */}
          <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400">
                Amenities & Facilities
              </span>
              {(filters.amenities?.length || 0) > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      amenities: undefined,
                      cursor: undefined,
                    })
                  }
                  className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Clear amenities
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((amenity) => {
                const isSelected = filters.amenities?.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer select-none",
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs font-semibold scale-[1.02]"
                        : "bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/90 dark:hover:bg-zinc-700/80 border border-black/5 dark:border-white/5",
                    )}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
