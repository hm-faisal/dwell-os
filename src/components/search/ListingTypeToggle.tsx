"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import type { ListingTypeFilter, SearchResultProperty } from "@/types/search";

export function isRoommateListing(property: SearchResultProperty): boolean {
  if (property.requiresRoommateApproval) return true;
  const rooms =
    property.availableRooms && property.availableRooms.length > 0
      ? property.availableRooms
      : property.rooms || [];
  return rooms.some((r) => (r.occupiedSlots ?? 0) > 0);
}

export function isOwnerVacantListing(property: SearchResultProperty): boolean {
  if (property.requiresRoommateApproval) return false;
  const rooms =
    property.availableRooms && property.availableRooms.length > 0
      ? property.availableRooms
      : property.rooms || [];
  return rooms.every((r) => (r.occupiedSlots ?? 0) === 0);
}

export function matchesListingType(
  property: SearchResultProperty,
  filter?: ListingTypeFilter,
): boolean {
  if (!filter || filter === "ALL") return true;
  if (filter === "ROOMMATE") return isRoommateListing(property);
  if (filter === "VACANT") return isOwnerVacantListing(property);
  return true;
}

export interface ListingTypeToggleProps {
  value: ListingTypeFilter;
  onChange: (value: ListingTypeFilter) => void;
  counts?: {
    all?: number;
    roommate?: number;
    vacant?: number;
  };
  className?: string;
}

export function ListingTypeToggle({
  value,
  onChange,
  counts,
  className,
}: ListingTypeToggleProps) {
  const options: {
    key: ListingTypeFilter;
    label: string;
    description: string;
    count?: number;
    icon: React.ReactNode;
  }[] = [
    {
      key: "ALL",
      label: "All Listings",
      description: "Every available home and room",
      count: counts?.all,
      icon: (
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
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      key: "ROOMMATE",
      label: "Roommate Listings",
      description: "Co-living units with voting & roommates",
      count: counts?.roommate,
      icon: (
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      key: "VACANT",
      label: "Owner-Vacant",
      description: "Wholly vacant, owner-managed units",
      count: counts?.vacant,
      icon: (
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
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={cn(
        "inline-flex flex-wrap p-1.5 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs",
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none",
              isActive
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm border border-black/5 dark:border-white/10 font-semibold scale-[1.01]"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-700/50",
            )}
            title={opt.description}
          >
            <span
              className={cn(
                "transition-colors",
                isActive
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500",
              )}
            >
              {opt.icon}
            </span>
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-mono transition-colors",
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    : "bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
