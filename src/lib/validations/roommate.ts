import { z } from "zod";

export const sleepScheduleEnum = z.enum([
  "EARLY_BIRD",
  "NIGHT_OWL",
  "FLEXIBLE",
]);
export const workScheduleEnum = z.enum(["REMOTE", "OFFICE", "HYBRID", "SHIFT"]);
export const cleanlinessEnum = z.enum(["VERY_CLEAN", "MODERATE", "RELAXED"]);

export const upsertProfileSchema = z.object({
  budgetMin: z
    .number()
    .int("Minimum budget must be an integer")
    .nonnegative("Minimum budget cannot be negative")
    .optional(),
  budgetMax: z
    .number()
    .int("Maximum budget must be an integer")
    .nonnegative("Maximum budget cannot be negative")
    .optional(),
  lifestyleTags: z
    .array(z.string().trim().min(1).max(50))
    .max(30, "Maximum of 30 lifestyle tags allowed")
    .default([]),
  sleepSchedule: sleepScheduleEnum.optional(),
  workSchedule: workScheduleEnum.optional(),
  smoking: z.boolean().default(false),
  pets: z.boolean().default(false),
  cleanliness: cleanlinessEnum.optional(),
  bio: z
    .string()
    .trim()
    .max(1000, "Bio cannot exceed 1,000 characters")
    .optional(),
  moveInDate: z.string().trim().optional(),
});

export const expressInterestSchema = z.object({
  interested: z.boolean().default(true),
  message: z
    .string()
    .trim()
    .max(1000, "Message cannot exceed 1,000 characters")
    .optional(),
});

export const roommateApprovalSchema = z.object({
  applicationId: z.string().trim().min(1).optional(),
  applicantId: z.string().trim().min(1).optional(),
  status: z.enum(["APPROVED", "REJECTED"]).default("APPROVED"),
  comments: z
    .string()
    .trim()
    .max(1000, "Comments cannot exceed 1,000 characters")
    .optional(),
});

export type UpsertProfileSchema = z.infer<typeof upsertProfileSchema>;
export type ExpressInterestSchema = z.infer<typeof expressInterestSchema>;
export type RoommateApprovalSchema = z.infer<typeof roommateApprovalSchema>;
