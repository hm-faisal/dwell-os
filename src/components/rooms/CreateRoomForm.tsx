"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { Select } from "@/components/ui/Select";
import { roomsApi } from "@/lib/api";
import { getFieldError } from "@/lib/form";
import { dollarsToCents } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import { createRoomSchema } from "@/lib/validations/room";
import type { CreateRoomDTO, FurnishingStatus, RoomType } from "@/types/room";

interface CreateRoomFormProps {
  propertyId: string;
}

export function CreateRoomForm({ propertyId }: CreateRoomFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      type: "PRIVATE" as RoomType,
      furnishing: "FURNISHED" as FurnishingStatus,
      size: "",
      rentDollars: "",
      depositDollars: "",
      maxOccupants: "1",
      availableFrom: "",
      minStayMonths: "1",
      leaseTerms: "",
      hasPrivateBath: false,
      photos: [] as string[],
    },
    validators: {
      onSubmit: createRoomSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      const rentCents = dollarsToCents(value.rentDollars);
      const depositCents = value.depositDollars
        ? dollarsToCents(value.depositDollars)
        : 0;

      try {
        const payload: CreateRoomDTO = {
          name: value.name.trim(),
          type: value.type,
          furnishing: value.furnishing,
          size: value.size ? Number.parseInt(value.size, 10) : undefined,
          rent: rentCents,
          deposit: depositCents,
          maxOccupants: value.maxOccupants
            ? Number.parseInt(value.maxOccupants, 10)
            : 1,
          availableFrom: value.availableFrom
            ? new Date(value.availableFrom).toISOString()
            : undefined,
          minStayMonths: value.minStayMonths
            ? Number.parseInt(value.minStayMonths, 10)
            : 1,
          leaseTerms: value.leaseTerms.trim() || undefined,
          photos: value.photos,
          hasPrivateBath: value.hasPrivateBath,
        };

        await roomsApi.create(propertyId, payload);
        showToast.success("Room created!", {
          description: `${value.name.trim()} has been added to property inventory.`,
        });
        router.push(`/properties/${propertyId}/rooms`);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to create room";
        setErrorMessage(msg);
        showToast.error(msg, {
          title: "Could not create room",
        });
      }
    },
  });

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
          Add Room
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Add New Room
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure room specifications, pricing in dollars, occupancy, and
          lease terms.
        </p>
      </div>

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
        {/* Core Info */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            Room Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <form.Field name="name">
                {(field) => (
                  <Input
                    label="Room Name / Identifier"
                    placeholder="e.g. Master Bedroom 1A"
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
                    { value: "PRIVATE", label: "Private Room" },
                    { value: "SHARED", label: "Shared Room" },
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <form.Field name="furnishing">
              {(field) => (
                <Select
                  label="Furnishing"
                  options={[
                    { value: "FURNISHED", label: "Fully Furnished" },
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

            <form.Field name="size">
              {(field) => (
                <Input
                  label="Size (sq ft)"
                  type="number"
                  placeholder="e.g. 220"
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
                  max="50"
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
                  placeholder="e.g. 1400.00"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  helperText="Entered in dollars; stored in integer cents"
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
                  placeholder="e.g. 1400.00"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  helperText="Refundable deposit amount in dollars"
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
                  helperText="Date from which the room is ready for move-in"
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
                  max="120"
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
                  htmlFor="room-leaseTerms"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Lease Terms & Special Rules
                </label>
                <textarea
                  id="room-leaseTerms"
                  rows={3}
                  placeholder="e.g. Utilities included, 30 days notice required before departure..."
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
                Add Room
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
