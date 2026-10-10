"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { Select } from "@/components/ui/Select";
import { ApiError, roomsApi } from "@/lib/api";
import { getFieldError } from "@/lib/form";
import {
  centsToDollars,
  dollarsToCents,
  toInputDateFormat,
} from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import { updateRoomSchema } from "@/lib/validations/room";
import type {
  FurnishingStatus,
  Room,
  RoomAvailabilityStatus,
  RoomType,
  UpdateRoomDTO,
} from "@/types/room";

interface RoomEditFormContentProps {
  room: Room;
  propertyId: string;
  onReload: () => Promise<void>;
}

function RoomEditFormContent({
  room,
  propertyId,
  onReload,
}: RoomEditFormContentProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      name: room.name || "",
      type: (room.type || room._type || "PRIVATE") as RoomType,
      furnishing: (room.furnishing || "FURNISHED") as FurnishingStatus,
      status: (room.status || "AVAILABLE") as RoomAvailabilityStatus,
      size: room.size ? String(room.size) : "",
      rentDollars: String(centsToDollars(room.rent || 0)),
      depositDollars: String(centsToDollars(room.deposit || 0)),
      maxOccupants: String(room.maxOccupants ?? 1),
      occupiedSlots: String(room.occupiedSlots ?? 0),
      availableFrom: room.availableFrom
        ? toInputDateFormat(room.availableFrom)
        : "",
      minStayMonths: String(room.minStayMonths ?? 1),
      leaseTerms: room.leaseTerms || "",
      hasPrivateBath: room.hasPrivateBath ?? false,
      photos: room.photos || [],
    }),
    [room],
  );

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: updateRoomSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      setConflictError(null);

      const rentCents = dollarsToCents(value.rentDollars);
      const depositCents = value.depositDollars
        ? dollarsToCents(value.depositDollars)
        : 0;

      try {
        const payload: UpdateRoomDTO = {
          name: value.name.trim(),
          type: value.type,
          furnishing: value.furnishing,
          status: value.status,
          size: value.size ? Number.parseInt(value.size, 10) : undefined,
          rent: rentCents,
          deposit: depositCents,
          maxOccupants: value.maxOccupants
            ? Number.parseInt(value.maxOccupants, 10)
            : 1,
          occupiedSlots: value.occupiedSlots
            ? Number.parseInt(value.occupiedSlots, 10)
            : 0,
          availableFrom: value.availableFrom
            ? new Date(value.availableFrom).toISOString()
            : undefined,
          minStayMonths: value.minStayMonths
            ? Number.parseInt(value.minStayMonths, 10)
            : 1,
          leaseTerms: value.leaseTerms.trim() || undefined,
          hasPrivateBath: value.hasPrivateBath,
          photos: value.photos,
          expectedVersion: room.version,
        };

        await roomsApi.update(room.id, payload);
        showToast.success("Room updated!", {
          description: "Room details have been saved successfully.",
        });
        router.push(`/properties/${propertyId}/rooms`);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to update room";
        const isConflict =
          (err instanceof ApiError && err.statusCode === 409) ||
          msg.toLowerCase().includes("conflict") ||
          msg.toLowerCase().includes("version");

        if (isConflict) {
          setConflictError(
            "Concurrency Conflict: Another user or process updated this room concurrently. Please refresh to inspect latest changes before re-submitting.",
          );
          showToast.warning("Concurrency Conflict", {
            description:
              "Another user updated this room concurrently. Please reload to inspect latest changes.",
          });
        } else {
          setErrorMessage(msg);
          showToast.error(msg, {
            title: "Could not update room",
          });
        }
      }
    },
  });

  const handleArchive = async () => {
    setIsArchiving(true);
    setArchiveError(null);

    try {
      await roomsApi.archive(room.id);
      showToast.success("Room archived", {
        description: "The room has been archived safely.",
      });
      setIsArchiveModalOpen(false);
      router.push(`/properties/${propertyId}/rooms`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive room";
      setArchiveError(msg);
      showToast.error(msg, {
        title: "Could not archive room",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const roomName = form.getFieldValue("name");
  const roomStatus = form.getFieldValue("status");
  const occupiedCount = form.getFieldValue("occupiedSlots");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/properties" className="hover:underline">
          Properties
        </Link>
        <span>/</span>
        <Link
          href={`/properties/${propertyId}/rooms`}
          className="hover:underline"
        >
          Rooms
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          Edit {roomName}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Edit Room
            </h1>
            {room && <StatusBadge status={roomStatus} />}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Modify room availability, occupancy limits, and pricing.
          </p>
        </div>

        {roomStatus !== "ARCHIVED" && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              setArchiveError(null);
              setIsArchiveModalOpen(true);
            }}
          >
            Archive Room
          </Button>
        )}
      </div>

      {conflictError && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{conflictError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onReload}>
            Reload Latest
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Core Config */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            Room Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <form.Field name="name">
                {(field) => (
                  <Input
                    label="Room Name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                        ? getFieldError(field.state.meta.errors)
                        : undefined
                    }
                    required
                  />
                )}
              </form.Field>
            </div>
            <form.Field name="type">
              {(field) => (
                <Select
                  label="Room Type"
                  options={[
                    { value: "PRIVATE", label: "Private" },
                    { value: "SHARED", label: "Shared" },
                  ]}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value as RoomType)
                  }
                  required
                />
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field name="status">
              {(field) => (
                <Select
                  label="Availability Status"
                  options={[
                    { value: "AVAILABLE", label: "Available" },
                    {
                      value: "RESERVED",
                      label: "Reserved (Application In Progress)",
                    },
                    { value: "OCCUPIED", label: "Occupied" },
                    { value: "MAINTENANCE", label: "Under Maintenance" },
                    { value: "ARCHIVED", label: "Archived" },
                  ]}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value as RoomAvailabilityStatus)
                  }
                  required
                />
              )}
            </form.Field>

            <form.Field name="furnishing">
              {(field) => (
                <Select
                  label="Furnishing"
                  options={[
                    { value: "FURNISHED", label: "Furnished" },
                    { value: "SEMI_FURNISHED", label: "Semi-Furnished" },
                    { value: "UNFURNISHED", label: "Unfurnished" },
                  ]}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value as FurnishingStatus)
                  }
                  required
                />
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <form.Field name="size">
              {(field) => (
                <Input
                  label="Size (sq ft)"
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                      ? getFieldError(field.state.meta.errors)
                      : undefined
                  }
                />
              )}
            </form.Field>

            <form.Field name="maxOccupants">
              {(field) => (
                <Input
                  label="Max Occupants"
                  type="number"
                  min="1"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                      ? getFieldError(field.state.meta.errors)
                      : undefined
                  }
                  required
                />
              )}
            </form.Field>

            <form.Field name="occupiedSlots">
              {(field) => (
                <Input
                  label="Occupied Slots"
                  type="number"
                  min="0"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  helperText="Active tenant count"
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                      ? getFieldError(field.state.meta.errors)
                      : undefined
                  }
                />
              )}
            </form.Field>
          </div>

          <form.Field name="hasPrivateBath">
            {(field) => (
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="privateBath"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300"
                />
                <label
                  htmlFor="privateBath"
                  className="text-sm font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  Has Private En-suite Bathroom
                </label>
              </div>
            )}
          </form.Field>
        </div>

        {/* Pricing & Lease Terms */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            Financial & Lease Conditions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field name="rentDollars">
              {(field) => (
                <Input
                  label="Monthly Rent ($ USD)"
                  type="number"
                  step="any"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                      ? getFieldError(field.state.meta.errors)
                      : undefined
                  }
                  required
                />
              )}
            </form.Field>

            <form.Field name="depositDollars">
              {(field) => (
                <Input
                  label="Security Deposit ($ USD)"
                  type="number"
                  step="any"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                      ? getFieldError(field.state.meta.errors)
                      : undefined
                  }
                />
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field name="availableFrom">
              {(field) => (
                <Input
                  label="Available From"
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                      ? getFieldError(field.state.meta.errors)
                      : undefined
                  }
                />
              )}
            </form.Field>

            <form.Field name="minStayMonths">
              {(field) => (
                <Input
                  label="Minimum Stay (Months)"
                  type="number"
                  min="1"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                      ? getFieldError(field.state.meta.errors)
                      : undefined
                  }
                  required
                />
              )}
            </form.Field>
          </div>

          <form.Field name="leaseTerms">
            {(field) => (
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-room-leaseTerms"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Lease Terms
                </label>
                <textarea
                  id="edit-room-leaseTerms"
                  rows={3}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/70 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-white/15 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all"
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Photos */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            Room Photos
          </h2>

          <form.Field name="photos">
            {(field) => (
              <PhotoUploadField
                value={field.state.value}
                onChange={(photos) => field.handleChange(photos)}
                label="Room Photos"
              />
            )}
          </form.Field>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/properties/${propertyId}/rooms`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Room Changes
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>

      {/* Archive Modal */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Archive Room"
        description="Are you sure you want to archive this room? Archiving soft-deletes the room while preserving all historical tenancy and financial records."
      >
        <div className="space-y-4">
          {Number.parseInt(occupiedCount, 10) > 0 && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
              <strong>Warning:</strong> This room currently has {occupiedCount}{" "}
              active occupant(s). You must terminate or expire the active leases
              before archiving this room.
            </div>
          )}

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs">
            Archiving marks this room as <strong>ARCHIVED</strong> and removes
            it from active availability listings. Historical lease and payment
            records remain accessible.
          </div>

          {archiveError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {archiveError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsArchiveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleArchive}
              isLoading={isArchiving}
            >
              Confirm Archive
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function EditRoomForm({
  propertyId,
  roomId,
}: {
  propertyId: string;
  roomId: string;
}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data: Room = await roomsApi.get(roomId);
      setRoom(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load room";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
        <div className="h-10 w-3/4 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
        <div className="h-64 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-3xl" />
      </div>
    );
  }

  if (errorMessage || !room) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="apple-card p-8 rounded-3xl border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300 apple-rim-highlight">
          <h2 className="text-base font-semibold tracking-tight">
            Failed to load room
          </h2>
          <p className="text-xs mt-1 mb-4 leading-normal">
            {errorMessage || "Room not found or no longer exists."}
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <Button variant="outline" size="sm" onClick={loadRoom}>
              Retry
            </Button>
            <Link href={`/properties/${propertyId}/rooms`}>
              <Button variant="primary" size="sm">
                Back to Rooms
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoomEditFormContent
      key={`${room.id}-${room.version}`}
      room={room}
      propertyId={propertyId}
      onReload={loadRoom}
    />
  );
}
