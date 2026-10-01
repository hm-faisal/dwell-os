"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { Select } from "@/components/ui/Select";
import { propertiesApi } from "@/lib/api";
import { getFieldError } from "@/lib/form";
import { showToast } from "@/lib/toast";
import { updatePropertySchema } from "@/lib/validations/property";
import type {
  Property,
  PropertyStatus,
  PropertyType,
  UpdatePropertyDTO,
} from "@/types/property";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "PG", label: "PG (Paying Guest)" },
  { value: "HOSTEL", label: "Hostel" },
  { value: "STUDIO", label: "Studio" },
  { value: "CONDO", label: "Condo" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "OTHER", label: "Other" },
];

const SUGGESTED_AMENITIES = [
  "High-Speed WiFi",
  "Air Conditioning",
  "In-Unit Laundry",
  "Parking",
  "Gym / Fitness Center",
  "24/7 Security",
  "Balcony",
  "Furnished Kitchen",
  "Elevator",
  "Pet Friendly",
  "Study Room",
  "Power Backup",
];

interface PropertyEditFormProps {
  property: Property;
  propertyId: string;
}

function PropertyEditFormContent({
  property,
  propertyId,
}: PropertyEditFormProps) {
  const router = useRouter();

  const [isArchiving, setIsArchiving] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  // Auxiliary inputs
  const [customAmenity, setCustomAmenity] = useState("");

  const defaultValues = useMemo(
    () => ({
      name: property.name || "",
      type: (property.type || property._type || "APARTMENT") as PropertyType,
      status: (property.status || "ACTIVE") as PropertyStatus,
      address: property.address || "",
      city: property.city || "",
      state: property.state || "",
      zipCode: property.zipCode || "",
      country: property.country || "",
      latitude:
        property.latitude !== null && property.latitude !== undefined
          ? String(property.latitude)
          : "",
      longitude:
        property.longitude !== null && property.longitude !== undefined
          ? String(property.longitude)
          : "",
      description: property.description || "",
      requiresRoommateApproval: property.requiresRoommateApproval ?? false,
      amenities: property.amenities || [],
      photos: property.photos || [],
      houseRules: property.houseRules || [],
    }),
    [property],
  );

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: updatePropertySchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      try {
        const payload: UpdatePropertyDTO = {
          name: value.name.trim(),
          type: value.type,
          status: value.status,
          address: value.address.trim(),
          city: value.city.trim(),
          state: value.state.trim() || undefined,
          zipCode: value.zipCode.trim() || undefined,
          country: value.country.trim() || undefined,
          latitude: value.latitude
            ? Number.parseFloat(value.latitude)
            : undefined,
          longitude: value.longitude
            ? Number.parseFloat(value.longitude)
            : undefined,
          description: value.description.trim() || undefined,
          amenities: value.amenities,
          photos: value.photos,
          requiresRoommateApproval: value.requiresRoommateApproval,
        };

        await propertiesApi.update(propertyId, payload);
        showToast.success("Property updated!", {
          description: "Your changes have been saved successfully.",
        });
        router.push(`/properties/${propertyId}`);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to update property";
        setErrorMessage(msg);
        showToast.error(msg, {
          title: "Could not update property",
        });
      }
    },
  });

  const toggleAmenity = (amenity: string) => {
    const current = form.getFieldValue("amenities");
    if (current.includes(amenity)) {
      form.setFieldValue(
        "amenities",
        current.filter((a) => a !== amenity),
      );
    } else {
      form.setFieldValue("amenities", [...current, amenity]);
    }
  };

  const addCustomAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customAmenity.trim();
    const current = form.getFieldValue("amenities");
    if (trimmed && !current.includes(trimmed)) {
      form.setFieldValue("amenities", [...current, trimmed]);
      setCustomAmenity("");
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    setArchiveError(null);

    try {
      await propertiesApi.archive(propertyId);
      showToast.success("Property archived", {
        description: "The property has been archived safely.",
      });
      setIsArchiveModalOpen(false);
      router.push("/properties");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to archive property";
      setArchiveError(msg);
      showToast.error(msg, {
        title: "Could not archive property",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const currentStatus = form.getFieldValue("status");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/properties" className="hover:underline">
          Properties
        </Link>
        <span>/</span>
        <Link href={`/properties/${propertyId}`} className="hover:underline">
          {form.getFieldValue("name") || property.name || "Details"}
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          Edit
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Edit Property
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Update property specifications, photos, and status.
          </p>
        </div>

        {currentStatus !== "ARCHIVED" && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              setArchiveError(null);
              setIsArchiveModalOpen(true);
            }}
          >
            Archive Property
          </Button>
        )}
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
        className="space-y-8"
      >
        {/* Basic Details */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            1. Property Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <form.Field name="name">
                {(field) => (
                  <Input
                    label="Property Name"
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
                  label="Property Type"
                  options={PROPERTY_TYPES}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value as PropertyType)
                  }
                  required
                />
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="status">
              {(field) => (
                <Select
                  label="Property Status"
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "ARCHIVED", label: "Archived" },
                  ]}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value as PropertyStatus)
                  }
                />
              )}
            </form.Field>

            <form.Field name="requiresRoommateApproval">
              {(field) => (
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="editRoommateApproval"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300"
                  />
                  <label
                    htmlFor="editRoommateApproval"
                    className="text-sm font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    Require Roommate Voting
                  </label>
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Location */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            2. Address & Coordinates
          </h2>

          <form.Field name="address">
            {(field) => (
              <Input
                label="Street Address"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <form.Field name="city">
              {(field) => (
                <Input
                  label="City"
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

            <form.Field name="state">
              {(field) => (
                <Input
                  label="State / Province"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>

            <form.Field name="zipCode">
              {(field) => (
                <Input
                  label="Postal Code"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>

            <form.Field name="country">
              {(field) => (
                <Input
                  label="Country"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <form.Field name="latitude">
              {(field) => (
                <Input
                  label="Latitude"
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

            <form.Field name="longitude">
              {(field) => (
                <Input
                  label="Longitude"
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
        </div>

        {/* Amenities */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            3. Amenities
          </h2>

          <form.Field name="amenities">
            {(field) => (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_AMENITIES.map((amenity) => {
                    const isSelected = field.state.value.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 active:scale-95 ${
                          isSelected
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {amenity}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom amenity tag..."
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addCustomAmenity}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </form.Field>
        </div>

        {/* Photos */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            4. Photos
          </h2>

          <form.Field name="photos">
            {(field) => (
              <PhotoUploadField
                value={field.state.value}
                onChange={(photos) => field.handleChange(photos)}
              />
            )}
          </form.Field>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/properties/${propertyId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Changes
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Archive Property"
        description="Are you sure you want to archive this property? Archiving soft-deletes the property while preserving all tenancy and financial records."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
            <strong>Important:</strong> Archiving will hide this property from
            active marketplace listings. If there are active tenant leases
            attached to rooms in this property, archiving will be blocked until
            those leases terminate or expire.
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

export function EditPropertyForm({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProperty = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data: Property = await propertiesApi.get(propertyId);
      setProperty(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load property data";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-10 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  if (errorMessage || !property) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="apple-card p-8 rounded-3xl border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300 apple-rim-highlight">
          <h2 className="text-base font-semibold tracking-tight">
            Failed to load property
          </h2>
          <p className="text-xs mt-1 mb-4 leading-normal">
            {errorMessage || "Property not found or no longer exists."}
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <Button variant="outline" size="sm" onClick={loadProperty}>
              Retry
            </Button>
            <Link href="/properties">
              <Button variant="primary" size="sm">
                Back to Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PropertyEditFormContent
      key={`${property.id}-${property.updatedAt}`}
      property={property}
      propertyId={propertyId}
    />
  );
}
