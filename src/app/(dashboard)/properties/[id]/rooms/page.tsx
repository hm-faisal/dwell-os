"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { propertiesApi, roomsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import type { Property } from "@/types/property";
import type { Room, RoomAvailabilityStatus } from "@/types/room";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoomsInventoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [propertyData, roomsData] = await Promise.all([
        propertiesApi.get(propertyId),
        roomsApi.list(propertyId),
      ]);
      setProperty(propertyData);
      const resolvedRooms =
        Array.isArray(roomsData) && roomsData.length > 0
          ? roomsData
          : Array.isArray(propertyData?.rooms) && propertyData.rooms.length > 0
            ? propertyData.rooms
            : Array.isArray(roomsData)
              ? roomsData
              : [];
      setRooms(resolvedRooms);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load rooms inventory";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleMaintenance = async (room: Room) => {
    const nextStatus: RoomAvailabilityStatus =
      room.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";

    try {
      await roomsApi.update(room.id, {
        status: nextStatus,
        expectedVersion: room.version,
      });
      showToast.success(
        nextStatus === "MAINTENANCE"
          ? "Room marked for maintenance"
          : "Room marked as available",
        {
          description: `${room.name} status updated to ${nextStatus}.`,
        },
      );
      await loadData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update room availability";
      showToast.error(msg, {
        title: "Could not update room status",
      });
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || r.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate inventory counts
  const availableCount = rooms.filter((r) => r.status === "AVAILABLE").length;
  const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
  const reservedCount = rooms.filter((r) => r.status === "RESERVED").length;
  const maintenanceCount = rooms.filter(
    (r) => r.status === "MAINTENANCE",
  ).length;

  return (
    <div className="space-y-7">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        <Link
          href="/properties"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Properties
        </Link>
        <span>/</span>
        <Link
          href={`/properties/${propertyId}`}
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors truncate max-w-[200px]"
        >
          {property?.name || "Property"}
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">
          Rooms Inventory
        </span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">
              Rooms Inventory
            </h1>
            {property && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                {property.name}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
            Manage individual rooms, occupancy tracking, rental pricing, and
            maintenance statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Link href={`/properties/${propertyId}/rooms/new`}>
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
              Add Room
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="apple-card p-4 rounded-2xl apple-rim-highlight border border-black/6 dark:border-white/10">
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Available
          </p>
          <p className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
            {availableCount}
          </p>
        </div>
        <div className="apple-card p-4 rounded-2xl apple-rim-highlight border border-black/6 dark:border-white/10">
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Occupied
          </p>
          <p className="text-2xl font-semibold tracking-tight text-indigo-600 dark:text-indigo-400 mt-1">
            {occupiedCount}
          </p>
        </div>
        <div className="apple-card p-4 rounded-2xl apple-rim-highlight border border-black/6 dark:border-white/10">
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Reserved
          </p>
          <p className="text-2xl font-semibold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
            {reservedCount}
          </p>
        </div>
        <div className="apple-card p-4 rounded-2xl apple-rim-highlight border border-black/6 dark:border-white/10">
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Maintenance
          </p>
          <p className="text-2xl font-semibold tracking-tight text-purple-600 dark:text-purple-400 mt-1">
            {maintenanceCount}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-3 sm:p-4 apple-rim-highlight rounded-2xl border border-black/6 dark:border-white/10 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3.5">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search room by name..."
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

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1 text-xs">
          {[
            "ALL",
            "AVAILABLE",
            "RESERVED",
            "OCCUPIED",
            "MAINTENANCE",
            "ARCHIVED",
          ].map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-medium cursor-pointer transition-all duration-150 active:scale-[0.97] ${
                statusFilter === st
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-2xs"
                  : "bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="apple-card rounded-3xl p-5 space-y-4 animate-pulse border border-black/6 dark:border-white/10"
            >
              <div className="h-44 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl" />
              <div className="h-5 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg w-1/2" />
              <div className="h-4 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Room Grid */}
      {!isLoading && filteredRooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const occupancyPct =
              room.maxOccupants > 0
                ? Math.min(
                    100,
                    Math.round((room.occupiedSlots / room.maxOccupants) * 100),
                  )
                : 0;

            return (
              <div
                key={room.id}
                className={`apple-card apple-card-interactive group overflow-hidden rounded-3xl border border-black/6 dark:border-white/10 flex flex-col justify-between ${
                  room.status === "ARCHIVED" ? "opacity-75" : ""
                }`}
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative h-44 bg-zinc-100 dark:bg-zinc-800/50 overflow-hidden">
                    {room.photos && room.photos.length > 0 ? (
                      // biome-ignore lint/performance/noImgElement: Dynamic user-supplied room photo
                      <img
                        src={room.photos[0]}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-[var(--ease-spring-default)]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                        <svg
                          className="w-8 h-8 mb-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span className="text-[11px] font-medium text-zinc-400">
                          No room photos
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <StatusBadge status={room.status} />
                      <Badge variant="neutral">{room.type}</Badge>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs font-semibold shadow-xs">
                      {formatCurrency(room.rent)}/mo
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-base text-zinc-950 dark:text-zinc-50 truncate tracking-tight">
                          {room.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {room.furnishing.replace("_", " ")}
                          {room.size ? ` • ${room.size} sq ft` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Financial & Stay Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-black/5 dark:border-white/5">
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider">
                          Security Deposit
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                          {formatCurrency(room.deposit)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider">
                          Min Stay
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                          {room.minStayMonths}{" "}
                          {room.minStayMonths === 1 ? "month" : "months"}
                        </span>
                      </div>
                    </div>

                    {/* Occupancy Indicator */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                          Occupancy
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {room.occupiedSlots} / {room.maxOccupants} slots
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-[var(--ease-spring-default)] ${
                            occupancyPct >= 100
                              ? "bg-rose-500"
                              : occupancyPct > 0
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Available From */}
                    {room.availableFrom && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Available from: {formatDate(room.availableFrom)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2 mt-2">
                  {room.status === "AVAILABLE" && (
                    <Link
                      href={`/applications/apply?roomId=${room.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      >
                        Apply Now
                      </Button>
                    </Link>
                  )}

                  {room.status !== "ARCHIVED" && (
                    <Button
                      variant={
                        room.status === "MAINTENANCE" ? "secondary" : "outline"
                      }
                      size="sm"
                      onClick={() => handleToggleMaintenance(room)}
                      className="text-xs"
                    >
                      {room.status === "MAINTENANCE"
                        ? "Mark Available"
                        : "Maintenance"}
                    </Button>
                  )}

                  <Link
                    href={`/properties/${propertyId}/rooms/${room.id}/edit`}
                    className={room.status === "AVAILABLE" ? "" : "flex-1"}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRooms.length === 0 && (
        <div className="apple-card rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center max-w-md mx-auto apple-rim-highlight">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mx-auto flex items-center justify-center mb-3.5">
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
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 text-base tracking-tight">
            No rooms found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 mb-5 leading-normal">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your filter criteria."
              : "This property currently has no rooms configured. Add your first room below."}
          </p>
          <Link href={`/properties/${propertyId}/rooms/new`}>
            <Button variant="primary" size="sm">
              Add First Room
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
