import { z } from "zod";

export const propertyTypeEnum = z.enum([
  "APARTMENT",
  "HOUSE",
  "PG",
  "HOSTEL",
  "STUDIO",
  "CONDO",
  "TOWNHOUSE",
  "OTHER",
]);

export const propertyStatusEnum = z.enum(["ACTIVE", "ARCHIVED"]);

export const createPropertySchema = z.object({
  name: z.string().min(1, "Property name is required").max(120),
  type: propertyTypeEnum,
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  latitude: z.string().refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num >= -90 && num <= 90;
    },
    { message: "Latitude must be a valid number between -90 and 90" },
  ),
  longitude: z.string().refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num >= -180 && num <= 180;
    },
    { message: "Longitude must be a valid number between -180 and 180" },
  ),
  description: z.string(),
  requiresRoommateApproval: z.boolean(),
  amenities: z.array(z.string()),
  photos: z.array(z.string()),
  houseRules: z.array(z.string()),
});

export type CreatePropertyFormValues = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = createPropertySchema.extend({
  status: propertyStatusEnum,
});

export type UpdatePropertyFormValues = z.infer<typeof updatePropertySchema>;

export const addManagerSchema = z.object({
  managerUserId: z.string().min(1, "Manager User ID is required"),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission must be selected"),
});

export type AddManagerFormValues = z.infer<typeof addManagerSchema>;
