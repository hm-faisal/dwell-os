"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { SearchResultProperty } from "@/types/search";
import { isRoommateListing } from "./ListingTypeToggle";

export interface MapRadiusViewProps {
  properties: SearchResultProperty[];
  selectedProperty?: SearchResultProperty | null;
  onSelectProperty: (property: SearchResultProperty | null) => void;
  radiusMiles?: number;
  onRadiusChange?: (miles: number) => void;
  className?: string;
}

const RADIUS_OPTIONS = [5, 10, 25, 50];

export function MapRadiusView({
  properties,
  selectedProperty,
  onSelectProperty,
  radiusMiles = 15,
  onRadiusChange,
  className,
}: MapRadiusViewProps) {
  const [internalRadius, setInternalRadius] = useState(radiusMiles);
  const activeRadius = radiusMiles || internalRadius;
  const mapGridPatternId = useId();

  // Filter properties with valid numeric latitude & longitude
  const geoProperties = useMemo(() => {
    return properties
      .map((p) => {
        const lat = p.latitude ? Number.parseFloat(String(p.latitude)) : null;
        const lng = p.longitude ? Number.parseFloat(String(p.longitude)) : null;
        return {
          property: p,
          lat: lat !== null && !Number.isNaN(lat) ? lat : null,
          lng: lng !== null && !Number.isNaN(lng) ? lng : null,
        };
      })
      .filter(
        (
          item,
        ): item is {
          property: SearchResultProperty;
          lat: number;
          lng: number;
        } => {
          return item.lat !== null && item.lng !== null;
        },
      );
  }, [properties]);

  // Compute map center
  const center = useMemo(() => {
    if (geoProperties.length === 0) {
      // Default center (e.g. SF Bay / US Tech Hub coordinate)
      return { lat: 37.7749, lng: -122.4194 };
    }
    const sumLat = geoProperties.reduce((acc, p) => acc + p.lat, 0);
    const sumLng = geoProperties.reduce((acc, p) => acc + p.lng, 0);
    return {
      lat: sumLat / geoProperties.length,
      lng: sumLng / geoProperties.length,
    };
  }, [geoProperties]);

  // Dynamic span based on radius (approx 1 deg lat ~= 69 miles)
  const degSpan = Math.max(0.08, (activeRadius / 69) * 2.2);

  // Map coordinates to SVG percentage (0% - 100%)
  const getCoordinates = (lat: number, lng: number) => {
    const x = 50 + ((lng - center.lng) / degSpan) * 45;
    const y = 50 - ((lat - center.lat) / degSpan) * 45;
    // Clamp to map bounds
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  const handleRadiusClick = (miles: number) => {
    setInternalRadius(miles);
    onRadiusChange?.(miles);
  };

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden bg-zinc-950 text-white border border-white/10 shadow-2xl flex flex-col min-h-[460px] md:min-h-[560px]",
        className,
      )}
    >
      {/* Top Header & Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-md border border-white/15 text-xs shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-100">
            {geoProperties.length} of {properties.length} mapped
          </span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">Radar View</span>
        </div>

        {/* Radius selector pills (FR-2.1) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-white/15 shadow-md">
          <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Radius:
          </span>
          {RADIUS_OPTIONS.map((miles) => {
            const isSelected = activeRadius === miles;
            return (
              <button
                key={miles}
                type="button"
                onClick={() => handleRadiusClick(miles)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer",
                  isSelected
                    ? "bg-white text-zinc-950 font-bold shadow-xs scale-105"
                    : "text-zinc-400 hover:text-white hover:bg-white/10",
                )}
              >
                {miles} mi
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Interactive Radar Canvas */}
      <div className="relative w-full flex-1 flex items-center justify-center p-4 overflow-hidden select-none">
        <svg
          className="w-full h-full min-h-[400px]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label="Interactive coordinate radar map"
        >
          <title>Map Radar View</title>
          {/* Subtle grid pattern */}
          <defs>
            <pattern
              id={mapGridPatternId}
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#${mapGridPatternId})`} />

          {/* Concentric Search Radius Circles (FR-2.1) */}
          <circle
            cx="50"
            cy="50"
            r="18"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="rgba(56, 189, 248, 0.03)"
            stroke="rgba(56, 189, 248, 0.35)"
            strokeWidth="1"
          />

          {/* Axis lines */}
          <line
            x1="50"
            y1="5"
            x2="50"
            y2="95"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="0.5"
          />
          <line
            x1="5"
            y1="50"
            x2="95"
            y2="50"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="0.5"
          />

          {/* Center search focal point */}
          <circle cx="50" cy="50" r="2.5" fill="rgba(56, 189, 248, 0.2)" />
          <circle cx="50" cy="50" r="1.2" fill="#38bdf8" />
        </svg>

        {/* HTML Geo-Pins Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {geoProperties.map(({ property, lat, lng }) => {
            const { x, y } = getCoordinates(lat, lng);
            const isSelected = selectedProperty?.id === property.id;
            const isRoommate = isRoommateListing(property);

            // Calculate starting rent
            const rents = (property.availableRooms || property.rooms || [])
              .map((r) => r.rent)
              .filter((n) => typeof n === "number");
            const minRent = rents.length > 0 ? Math.min(...rents) : null;

            return (
              <div
                key={property.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => onSelectProperty(isSelected ? null : property)}
                  className={cn(
                    "group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg transition-all duration-200 cursor-pointer select-none",
                    isSelected
                      ? "ring-4 ring-white/40 scale-125 z-30"
                      : "hover:scale-110 z-10",
                    isRoommate
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white",
                  )}
                  title={`${property.name} - ${property.city}`}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isRoommate ? "bg-purple-200" : "bg-emerald-200",
                    )}
                  />
                  <span>
                    {minRent !== null ? formatCurrency(minRent) : property.name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Property Quick-Peek Modal / Card */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="p-4 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {selectedProperty.photos?.[0] ? (
                // biome-ignore lint/performance/noImgElement: Dynamic user-supplied property photo
                <img
                  src={selectedProperty.photos[0]}
                  alt={selectedProperty.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
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
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-zinc-100 line-clamp-1">
                    {selectedProperty.name}
                  </h4>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                      isRoommateListing(selectedProperty)
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                    )}
                  >
                    {isRoommateListing(selectedProperty)
                      ? "Roommate"
                      : "Vacant"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {selectedProperty.address}, {selectedProperty.city}
                </p>
                <p className="text-xs font-medium text-emerald-400 mt-0.5">
                  {(selectedProperty.availableRooms || []).length} rooms
                  available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => onSelectProperty(null)}
                className="px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/properties/${selectedProperty.id}`}
                className="px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <span>View Rooms</span>
                <svg
                  className="w-3.5 h-3.5"
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
      )}

      {/* Empty coordinates notice */}
      {geoProperties.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <p className="text-sm font-medium text-zinc-400 max-w-sm">
            No properties in the current search criteria have GPS coordinate
            data. Use the list view to browse all listings.
          </p>
        </div>
      )}
    </div>
  );
}
