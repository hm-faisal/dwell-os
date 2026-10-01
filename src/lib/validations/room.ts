import { z } from "zod";

export const roomTypeEnum = z.enum(["PRIVATE", "SHARED"]);
export const furnishingStatusEnum = z.enum([
  "FURNISHED",
  "SEMI_FURNISHED",
  "UNFURNISHED",
]);
export const roomAvailabilityStatusEnum = z.enum([
  "AVAILABLE",
  "RESERVED",
  "OCCUPIED",
  "MAINTENANCE",
  "ARCHIVED",
]);

export const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required").max(100),
  type: roomTypeEnum,
  furnishing: furnishingStatusEnum,
  size: z.string().refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const num = Number.parseInt(val, 10);
      return !Number.isNaN(num) && num > 0;
    },
    { message: "Size must be a positive integer" },
  ),
  rentDollars: z
    .string()
    .min(1, "Monthly rent is required")
    .refine(
      (val) => {
        const num = Number.parseFloat(val);
        return !Number.isNaN(num) && num > 0;
      },
      { message: "Monthly rent must be greater than 0" },
    ),
  depositDollars: z.string().refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num >= 0;
    },
    { message: "Deposit must be 0 or greater" },
  ),
  maxOccupants: z
    .string()
    .min(1, "Max occupants is required")
    .refine(
      (val) => {
        const num = Number.parseInt(val, 10);
        return !Number.isNaN(num) && num >= 1 && num <= 50;
      },
      { message: "Occupants must be between 1 and 50" },
    ),
  availableFrom: z.string(),
  minStayMonths: z
    .string()
    .min(1, "Minimum stay is required")
    .refine(
      (val) => {
        const num = Number.parseInt(val, 10);
        return !Number.isNaN(num) && num >= 1 && num <= 120;
      },
      { message: "Minimum stay must be between 1 and 120 months" },
    ),
  leaseTerms: z.string(),
  hasPrivateBath: z.boolean(),
  photos: z.array(z.string()),
});

export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export const updateRoomSchema = createRoomSchema.extend({
  status: roomAvailabilityStatusEnum,
  occupiedSlots: z.string().refine(
    (val) => {
      const num = Number.parseInt(val, 10);
      return !Number.isNaN(num) && num >= 0;
    },
    { message: "Occupied slots must be 0 or greater" },
  ),
});

export type UpdateRoomFormValues = z.infer<typeof updateRoomSchema>;
