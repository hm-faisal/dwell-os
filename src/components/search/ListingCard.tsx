"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/room";
import type { SearchResultProperty } from "@/types/search";
import { isRoommateListing } from "./ListingTypeToggle";

export interface ListingCardProps {
  property: SearchResultProperty;
  requestedMoveInDate?: string;
  onFocusOnMap?: (property: SearchResultProperty) => void;
  className?: string;
}

export function ListingCard({
  property,
  requestedMoveInDate,
  onFocusOnMap,
  className,
}: ListingCardProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const rooms: Room[] =
    property.availableRooms && property.availableRooms.length > 0
      ? property.availableRooms
      : property.rooms || [];

  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE");

  // Calculate price range across available rooms
  const rents = availableRooms
    .map((r) => r.rent)
    .filter((n) => typeof n === "number");
  const minRent = rents.length > 0 ? Math.min(...rents) : null;
  const maxRent = rents.length > 0 ? Math.max(...rents) : null;

  // Calculate earliest availability date
  const earliestAvailable = availableRooms.reduce<string | null>(
    (earliest, r) => {
      if (!r.availableFrom) return earliest;
      if (!earliest) return r.availableFrom;
      return new Date(r.availableFrom) < new Date(earliest)
        ? r.availableFrom
        : earliest;
    },
    null,
  );

  const isRoommate = isRoommateListing(property);
  const photos =
    property.photos && property.photos.length > 0 ? property.photos : [];
  const currentPhoto = photos[activePhotoIndex];

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300",
        "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-black/8 dark:border-white/10",
        "shadow-sm hover:shadow-xl hover:border-black/20 dark:hover:border-white/20",
        "hover:-translate-y-1",
        className,
      )}
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {currentPhoto ? (
          // biome-ignore lint/performance/noImgElement: Dynamic user-supplied property photo
          <img
            src={currentPhoto}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
            <svg
              className="w-10 h-10 mb-2 opacity-50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs font-medium">No photos available</span>
          </div>
        )}

        {/* Gradient shadow for text & badges */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges: Roommate Classification (FR-2.2) and Property Type */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex flex-wrap items-center gap-1.5">
            {isRoommate ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-purple-500/90 text-white backdrop-blur-md shadow-xs border border-purple-400/30">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                Roommate Unit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-500/90 text-white backdrop-blur-md shadow-xs border border-emerald-400/30">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Owner-Vacant
              </span>
            )}

            {property.requiresRoommateApproval && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
                Voting Required
              </span>
            )}
          </div>

          {/* Map focus shortcut if coordinates exist */}
          {property.latitude && property.longitude && onFocusOnMap && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFocusOnMap(property);
              }}
              title="Locate on map radar"
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer"
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
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </button>
          )}
        </div>

        {/* Bottom overlay: Price badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white pointer-events-none">
          <div>
            <div className="text-xl font-bold tracking-tight text-white drop-shadow-md">
              {minRent !== null ? (
                <>
                  {formatCurrency(minRent)}
                  {maxRent && maxRent > minRent && (
                    <span className="text-sm font-normal opacity-90">
                      {" "}
                      - {formatCurrency(maxRent)}
                    </span>
                  )}
                  <span className="text-xs font-normal opacity-80"> / mo</span>
                </>
              ) : (
                <span className="text-sm font-medium">Inquire for rent</span>
              )}
            </div>
            <p className="text-[11px] text-zinc-200/90 font-medium">
              {availableRooms.length}{" "}
              {availableRooms.length === 1
                ? "room available"
                : "rooms available"}
            </p>
          </div>

          {/* Multi-photo pagination dots */}
          {photos.length > 1 && (
            <div className="flex items-center gap-1 pointer-events-auto bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
              {photos.slice(0, 5).map((_, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: simple image dots
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(i);
                  }}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all cursor-pointer",
                    activePhotoIndex === i
                      ? "bg-white scale-125"
                      : "bg-white/40 hover:bg-white/70",
                  )}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Property Name & City */}
          <div>
            <h3 className="font-semibold text-base text-zinc-950 dark:text-zinc-50 tracking-tight group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors line-clamp-1">
              {property.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 flex items-center gap-1">
              <svg
                className="w-3 h-3 shrink-0 text-zinc-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {property.address}, {property.city}
              {property.state ? `, ${property.state}` : ""}
            </p>
          </div>

          {/* Move-in availability info (FR-2.3) */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
            {earliestAvailable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-medium">
                <svg
                  className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Available: {formatDate(earliestAvailable)}
              </span>
            )}

            {requestedMoveInDate && earliestAvailable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
                ✓ Ready by Move-in
              </span>
            )}
          </div>

          {/* Available Rooms Pill Preview */}
          {availableRooms.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Available Rooms
              </div>
              <div className="space-y-1.5">
                {availableRooms.slice(0, 2).map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5"
                  >
                    <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="truncate max-w-[140px]">
                        {room.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase font-mono">
                        ({room.type})
                      </span>
                    </div>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {formatCurrency(room.rent)}/mo
                    </span>
                  </div>
                ))}
                {availableRooms.length > 2 && (
                  <p className="text-[10px] text-zinc-400 font-medium px-1">
                    +{availableRooms.length - 2} more room options
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Amenity tags */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {property.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500">
                  +{property.amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5">
          <Link
            href={`/properties/${property.id}`}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
          >
            <span>View Rooms & Apply</span>
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
