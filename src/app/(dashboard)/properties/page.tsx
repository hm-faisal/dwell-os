"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { propertiesApi } from "@/lib/api";
import type { Property } from "@/types/property";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "ARCHIVED"
  >("ALL");

  const loadProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await propertiesApi.list();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load properties";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.address || "").toLowerCase().includes(searchTerm.toLowerCase());

    const pType = (p.type || p._type || "").toUpperCase();
    const matchesType = selectedType === "ALL" || pType === selectedType;

    const pStatus = (p.status || "").toUpperCase();
    const matchesStatus = statusFilter === "ALL" || pStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">
            Properties
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
            Manage your real estate portfolio, room inventories, and property
            configurations.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadProperties}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Link href="/properties/new">
            <Button variant="primary" size="sm">
              <svg
                className="w-3.5 h-3.5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.25"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-3 sm:p-4 apple-rim-highlight rounded-2xl border border-black/6 dark:border-white/10 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3.5">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, address, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9.5 px-3.5 pl-9.5 text-sm bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/70 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-white/15 transition-all"
          />
          <svg
            className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400 dark:text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9.5 px-3.5 text-xs font-medium bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/70 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-white/15 cursor-pointer transition-all"
          >
            <option value="ALL">All Types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="PG">PG</option>
            <option value="HOSTEL">Hostel</option>
            <option value="STUDIO">Studio</option>
            <option value="CONDO">Condo</option>
            <option value="TOWNHOUSE">Townhouse</option>
            <option value="OTHER">Other</option>
          </select>

          <div className="flex p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60 backdrop-blur-xs border border-black/5 dark:border-white/5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 font-semibold rounded-lg cursor-pointer transition-all duration-150 ease-[var(--ease-spring-snappy)] ${
                statusFilter === "ALL"
                  ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1 font-semibold rounded-lg cursor-pointer transition-all duration-150 ease-[var(--ease-spring-snappy)] ${
                statusFilter === "ACTIVE"
                  ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ARCHIVED")}
              className={`px-3 py-1 font-semibold rounded-lg cursor-pointer transition-all duration-150 ease-[var(--ease-spring-snappy)] ${
                statusFilter === "ARCHIVED"
                  ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs shrink-0">
              !
            </span>
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadProperties}>
            Try Again
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="apple-card rounded-3xl p-5 space-y-4 animate-pulse border border-black/6 dark:border-white/10"
            >
              <div className="h-44 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl" />
              <div className="h-5 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg w-3/4" />
              <div className="h-4 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg w-1/2" />
              <div className="h-9 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Property Cards Grid */}
      {!isLoading && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className={`apple-card apple-card-interactive group overflow-hidden rounded-3xl border border-black/6 dark:border-white/10 flex flex-col justify-between ${
                property.status === "ARCHIVED" ? "opacity-75" : ""
              }`}
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-44 bg-zinc-100 dark:bg-zinc-800/50 overflow-hidden">
                  {property.photos && property.photos.length > 0 ? (
                    // biome-ignore lint/performance/noImgElement: Dynamic user-supplied property photo
                    <img
                      src={property.photos[0]}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-[var(--ease-spring-default)]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                      <svg
                        className="w-10 h-10 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="text-xs font-medium">No photos</span>
                    </div>
                  )}

                  {/* Status & Type Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <StatusBadge status={property.status} />
                    <Badge variant="neutral">{property.type}</Badge>
                  </div>

                  {property.requiresRoommateApproval && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.03em] uppercase rounded-full bg-amber-500/90 text-white backdrop-blur-xs shadow-xs">
                        Roommate Vote
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-semibold text-base tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 truncate">
                      {property.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {property.address}, {property.city}
                      {property.state ? `, ${property.state}` : ""}
                    </p>
                  </div>

                  {/* Geolocation Tag */}
                  {property.latitude && property.longitude && (
                    <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 gap-1 font-mono text-[11px]">
                      <svg
                        className="w-3.5 h-3.5 text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>
                        {property.latitude.toFixed(4)},{" "}
                        {property.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}

                  {/* Amenities Snippet */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2.5 py-0.5 text-[11px] font-medium tracking-tight bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[11px] text-zinc-400 font-medium">
                          +{property.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2 mt-2">
                <Link
                  href={`/properties/${property.id}/rooms`}
                  className="flex-1"
                >
                  <Button variant="secondary" size="sm" className="w-full">
                    View Rooms
                  </Button>
                </Link>
                <Link href={`/properties/${property.id}`}>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </Link>
                <Link href={`/properties/${property.id}/edit`}>
                  <Button variant="ghost" size="sm" aria-label="Edit property">
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
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProperties.length === 0 && (
        <div className="apple-card rounded-3xl p-12 text-center max-w-md mx-auto border border-black/6 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mx-auto flex items-center justify-center mb-3.5 shadow-xs">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 text-base tracking-[-0.015em]">
            No properties found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5 leading-normal">
            {searchTerm || selectedType !== "ALL" || statusFilter !== "ALL"
              ? "Try adjusting your search filters or create a new property."
              : "Get started by adding your first property to DwellOS."}
          </p>
          <Link href="/properties/new">
            <Button variant="primary" size="sm">
              Create First Property
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
