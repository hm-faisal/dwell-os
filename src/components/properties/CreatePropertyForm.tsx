"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { Select } from "@/components/ui/Select";
import { propertiesApi } from "@/lib/api";
import { getFieldError } from "@/lib/form";
import { showToast } from "@/lib/toast";
import { createPropertySchema } from "@/lib/validations/property";
import type { CreatePropertyDTO, PropertyType } from "@/types/property";

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

export function CreatePropertyForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic input auxiliary states
  const [customAmenity, setCustomAmenity] = useState("");
  const [ruleInput, setRuleInput] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      type: "APARTMENT" as PropertyType,
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      latitude: "",
      longitude: "",
      description: "",
      requiresRoommateApproval: false,
      amenities: ["High-Speed WiFi", "24/7 Security"],
      photos: [] as string[],
      houseRules: [] as string[],
    },
    validators: {
      onSubmit: createPropertySchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        const payload: CreatePropertyDTO = {
          name: value.name.trim(),
          type: value.type,
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
          houseRules:
            value.houseRules.length > 0 ? value.houseRules : undefined,
          requiresRoommateApproval: value.requiresRoommateApproval,
        };

        const result = await propertiesApi.create(payload);
        showToast.success("Property created!", {
          description: `${result.name || "New property"} has been added to your portfolio.`,
        });
        router.push(`/properties/${result.id}`);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to create property";
        setErrorMessage(msg);
        showToast.error(msg, {
          title: "Could not create property",
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

  const addRule = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ruleInput.trim();
    const current = form.getFieldValue("houseRules");
    if (trimmed && !current.includes(trimmed)) {
      form.setFieldValue("houseRules", [...current, trimmed]);
      setRuleInput("");
    }
  };

  const removeRule = (index: number) => {
    const current = form.getFieldValue("houseRules");
    form.setFieldValue(
      "houseRules",
      current.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/properties" className="hover:underline">
          Properties
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          Create Property
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create New Property
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Add an apartment, house, PG, hostel, or residential unit to your
            DwellOS system.
          </p>
        </div>
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
        {/* Basic Information */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            1. Property Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="name">
              {(field) => (
                <Input
                  label="Property Name"
                  placeholder="e.g. Dwell Heights North"
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

          <form.Field name="description">
            {(field) => (
              <div className="space-y-1.5">
                <label
                  htmlFor="property-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Description
                </label>
                <textarea
                  id="property-description"
                  rows={3}
                  placeholder="Provide an overview of the property, neighborhood features, and tenant perks..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="requiresRoommateApproval">
            {(field) => (
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="roommateApproval"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300"
                />
                <label
                  htmlFor="roommateApproval"
                  className="text-sm font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  Require existing roommates to vote on new tenant applications
                </label>
              </div>
            )}
          </form.Field>
        </div>

        {/* Address and Geolocation */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            2. Address & Geolocation
          </h2>

          <form.Field name="address">
            {(field) => (
              <Input
                label="Street Address"
                placeholder="e.g. 742 Evergreen Terrace"
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
                  placeholder="e.g. Springfield"
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
                  placeholder="e.g. OR"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>

            <form.Field name="zipCode">
              {(field) => (
                <Input
                  label="Postal / Zip Code"
                  placeholder="e.g. 97477"
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
                  placeholder="e.g. United States"
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
                  label="Latitude (optional)"
                  type="number"
                  step="any"
                  placeholder="e.g. 44.0521"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  helperText="Decimal latitude between -90 and 90"
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
                  label="Longitude (optional)"
                  type="number"
                  step="any"
                  placeholder="e.g. -123.0868"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  helperText="Decimal longitude between -180 and 180"
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

        {/* Amenities Selection */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            3. Amenities & Facilities
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
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

        {/* Photos & Media */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            4. Photos & Media
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

        {/* House Rules */}
        <div className="apple-card p-6 sm:p-7 apple-rim-highlight rounded-3xl border border-black/6 dark:border-white/10 space-y-4">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50 border-b border-black/5 dark:border-white/5 pb-3">
            5. House Rules
          </h2>

          <form.Field name="houseRules">
            {(field) => (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Quiet hours after 10 PM, No smoking indoors"
                    value={ruleInput}
                    onChange={(e) => setRuleInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addRule}
                  >
                    Add Rule
                  </Button>
                </div>

                {field.state.value.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {field.state.value.map((rule, idx) => (
                      <li
                        // biome-ignore lint/suspicious/noArrayIndexKey: rule index
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-700 dark:text-zinc-300"
                      >
                        <span>• {rule}</span>
                        <button
                          type="button"
                          onClick={() => removeRule(idx)}
                          className="text-zinc-400 hover:text-rose-500 font-bold px-1"
                          aria-label="Remove rule"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/properties">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create Property
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
