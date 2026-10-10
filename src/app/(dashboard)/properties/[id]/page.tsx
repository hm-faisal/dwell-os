"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { propertiesApi, roomsApi } from "@/lib/api";
import { getFieldError } from "@/lib/form";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import { addManagerSchema } from "@/lib/validations/property";
import type { Property, PropertyManager } from "@/types/property";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manager state
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [managerActionMessage, setManagerActionMessage] = useState<
    string | null
  >(null);

  const managerForm = useForm({
    defaultValues: {
      managerUserId: "",
      permissions: [
        "MANAGE_ROOMS",
        "MANAGE_APPLICATIONS",
        "MANAGE_MAINTENANCE",
      ],
    },
    validators: {
      onSubmit: addManagerSchema,
    },
    onSubmit: async ({ value }) => {
      setManagerActionMessage(null);
      try {
        await propertiesApi.addManager(
          propertyId,
          value.managerUserId.trim(),
          value.permissions,
        );
        showToast.success("Manager assigned", {
          description:
            "Manager permissions have been granted for this property.",
        });
        setManagerActionMessage("Manager successfully added!");
        managerForm.reset();
        setIsAddManagerOpen(false);
        await loadProperty();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to add manager";
        setManagerActionMessage(msg);
        showToast.error(msg, {
          title: "Could not add manager",
        });
      }
    },
  });

  const loadProperty = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [propertyData, roomsData] = await Promise.all([
        propertiesApi.get(propertyId),
        roomsApi.list(propertyId).catch(() => []),
      ]);
      const resolvedRooms =
        Array.isArray(roomsData) && roomsData.length > 0
          ? roomsData
          : Array.isArray(propertyData.rooms) && propertyData.rooms.length > 0
            ? propertyData.rooms
            : [];
      setProperty({
        ...propertyData,
        rooms: resolvedRooms,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load property details";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  const handleRemoveManager = async (userId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this manager from the property?",
      )
    )
      return;
    try {
      await propertiesApi.removeManager(propertyId, userId);
      showToast.success("Manager removed", {
        description: "The manager has been unassigned from this property.",
      });
      await loadProperty();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to remove manager";
      showToast.error(msg, {
        title: "Could not remove manager",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl w-1/3" />
        <div className="h-80 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-3xl" />
          <div className="h-64 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="apple-card p-8 rounded-3xl border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300">
          <h2 className="text-lg font-semibold tracking-tight">
            Failed to load property
          </h2>
          <p className="text-sm mt-1 mb-4 leading-normal">
            {error || "Property does not exist."}
          </p>
          <Link href="/properties">
            <Button variant="outline" size="sm">
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const mapUrl =
    property.latitude && property.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${property.address}, ${property.city} ${property.state || ""} ${
            property.country || ""
          }`,
        )}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <Link
              href="/properties"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Properties
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
              {property.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">
              {property.name}
            </h1>
            <StatusBadge status={property.status} />
            <Badge variant="neutral">{property.type}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/properties/${property.id}/rooms`}>
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
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Rooms Inventory
            </Button>
          </Link>
          <Link href={`/properties/${property.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Photos Carousel / Grid */}
      <div className="apple-card overflow-hidden rounded-3xl border border-black/6 dark:border-white/10 p-2 sm:p-2.5 shadow-sm">
        {property.photos && property.photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-2 h-72 sm:h-96 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              {/* biome-ignore lint/performance/noImgElement: Dynamic user-supplied property photo */}
              <img
                src={property.photos[0]}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 h-72 sm:h-96">
              {property.photos.slice(1, 3).map((url, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: photo index
                  key={i}
                  className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 h-full"
                >
                  {/* biome-ignore lint/performance/noImgElement: Dynamic user-supplied property photo */}
                  <img
                    src={url}
                    alt={`${property.name} view ${i + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {property.photos.length === 1 && (
                <div className="rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/40 flex items-center justify-center text-xs text-zinc-400">
                  No additional photos
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-zinc-400">
            <svg
              className="w-10 h-10 mb-2"
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
            <span className="text-sm font-medium">
              No photos uploaded for this property
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Details + Managers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location & Address */}
          <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
            <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-100 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-zinc-500"
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
              Address & Location
            </h2>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {property.address}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {property.city}
                {property.state ? `, ${property.state}` : ""}{" "}
                {property.zipCode || ""} {property.country || ""}
              </p>
            </div>

            {property.latitude && property.longitude && (
              <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
                  Lat: {property.latitude}
                </span>
                <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
                  Lng: {property.longitude}
                </span>
              </div>
            )}

            <div className="pt-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Open location in Google Maps →
              </a>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-3">
              <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-100">
                About this Property
              </h2>
              <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </div>
          )}

          {/* Amenities */}
          <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
            <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-100">
              Amenities & Perks
            </h2>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 text-xs font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    <svg
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">No amenities listed yet.</p>
            )}
          </div>

          {/* Rooms Inventory */}
          <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-100">
                    Rooms & Inventory
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                    {property.rooms?.length || 0}{" "}
                    {property.rooms?.length === 1 ? "room" : "rooms"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Individual room configurations, availability, and pricing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/properties/${property.id}/rooms/new`}>
                  <Button variant="outline" size="sm">
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
                <Link href={`/properties/${property.id}/rooms`}>
                  <Button variant="primary" size="sm">
                    Manage Rooms
                  </Button>
                </Link>
              </div>
            </div>

            {property.rooms && property.rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {property.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="apple-card apple-card-interactive p-4 rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate tracking-tight">
                          {room.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {room.furnishing.replace("_", " ")}
                          {room.size ? ` • ${room.size} sq ft` : ""}
                        </p>
                      </div>
                      <StatusBadge status={room.status} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5 dark:border-white/5">
                      <div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold tracking-wider block">
                          Rent
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(room.rent)}/mo
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold tracking-wider block">
                          Occupancy
                        </span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {room.occupiedSlots} / {room.maxOccupants} slots
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                      <Badge variant="neutral">{room.type}</Badge>
                      <div className="flex items-center gap-2.5">
                        {room.status === "AVAILABLE" && (
                          <Link
                            href={`/applications/apply?roomId=${room.id}`}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
                          >
                            Apply Now
                          </Link>
                        )}
                        <Link
                          href={`/properties/${property.id}/rooms/${room.id}/edit`}
                          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        >
                          Edit →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  No rooms configured for this property yet.
                </p>
                <Link href={`/properties/${property.id}/rooms/new`}>
                  <Button variant="primary" size="sm">
                    Add First Room
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Metadata + Managers */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
            <h3 className="font-caption-tracked text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold tracking-wider uppercase">
              Property Status
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
                <span className="text-zinc-500">Status</span>
                <StatusBadge status={property.status} />
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
                <span className="text-zinc-500">Category</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {property.type}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
                <span className="text-zinc-500">Roommate Voting</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {property.requiresRoommateApproval ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Created</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {formatDate(property.createdAt)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/properties/${property.id}/rooms`}
                className="w-full"
              >
                <Button variant="primary" size="md" className="w-full">
                  Browse Rooms Inventory →
                </Button>
              </Link>
            </div>
          </div>

          {/* Property Managers Panel */}
          <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-caption-tracked text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold tracking-wider uppercase">
                Assigned Managers
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddManagerOpen(true)}
              >
                + Assign
              </Button>
            </div>

            {(property.propertyManagers &&
              property.propertyManagers.length > 0) ||
            (property.managers && property.managers.length > 0) ? (
              <div className="space-y-3">
                {(property.propertyManagers || property.managers || []).map(
                  (mgr: PropertyManager) => (
                    <div
                      key={mgr.id}
                      className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {mgr.user?.name || `Manager ID: ${mgr.userId}`}
                        </p>
                        {mgr.user?.email && (
                          <p className="text-[11px] text-zinc-500">
                            {mgr.user.email}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {mgr.permissions.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-700 dark:text-zinc-300 rounded-md text-[9px] font-semibold tracking-wide uppercase"
                            >
                              {p.replace("MANAGE_", "")}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveManager(mgr.userId)}
                        className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 text-xs cursor-pointer active:scale-90 transition-transform"
                        title="Remove manager"
                      >
                        ✕
                      </button>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 leading-normal">
                No managers assigned to this property. As owner, you have full
                control.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Manager Modal */}
      <Modal
        isOpen={isAddManagerOpen}
        onClose={() => setIsAddManagerOpen(false)}
        title="Assign Property Manager"
        description="Grant a manager operational permissions over this property."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            managerForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <managerForm.Field name="managerUserId">
            {(field) => (
              <Input
                label="Manager User ID"
                placeholder="e.g. user-uuid-here"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                helperText="The user ID of the manager you wish to grant access."
                error={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                    ? getFieldError(field.state.meta.errors)
                    : undefined
                }
              />
            )}
          </managerForm.Field>

          <managerForm.Field name="permissions">
            {(field) => (
              <div className="space-y-2">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400">
                  Permissions
                </span>
                {[
                  { id: "MANAGE_ROOMS", label: "Manage Rooms & Inventories" },
                  {
                    id: "MANAGE_APPLICATIONS",
                    label: "Manage & Approve Applications",
                  },
                  {
                    id: "MANAGE_MAINTENANCE",
                    label: "Manage Maintenance Requests",
                  },
                ].map((perm) => {
                  const isChecked = field.state.value.includes(perm.id);
                  return (
                    <div key={perm.id} className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id={perm.id}
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            field.handleChange(
                              field.state.value.filter((p) => p !== perm.id),
                            );
                          } else {
                            field.handleChange([...field.state.value, perm.id]);
                          }
                        }}
                        className="w-4 h-4 rounded-md text-zinc-950 focus:ring-zinc-900 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                      />
                      <label
                        htmlFor={perm.id}
                        className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
                      >
                        {perm.label}
                      </label>
                    </div>
                  );
                })}
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-rose-600">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
              </div>
            )}
          </managerForm.Field>

          {managerActionMessage && (
            <p className="text-xs text-rose-600">{managerActionMessage}</p>
          )}

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddManagerOpen(false)}
            >
              Cancel
            </Button>
            <managerForm.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  Assign Manager
                </Button>
              )}
            </managerForm.Subscribe>
          </div>
        </form>
      </Modal>
    </div>
  );
}
