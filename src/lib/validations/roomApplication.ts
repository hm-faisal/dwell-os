import { z } from "zod";

/**
 * Strict Zod validation schemas for Tenant Room Application Flow
 * Strictly enforces integer cents, ISO date strings, and idempotency keys.
 */

export const applicationPersonalInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100),
  email: z.string().email("Valid email address is required"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Valid E.164 phone number is required"),
  currentAddress: z
    .string()
    .min(5, "Current residential address is required")
    .max(200),
  dateOfBirth: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Valid date of birth is required",
  }),
});

export const applicationEmploymentSchema = z.object({
  employerName: z
    .string()
    .min(2, "Employer or company name is required")
    .max(100),
  jobTitle: z.string().min(2, "Job title / role is required").max(100),
  employmentStatus: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "SELF_EMPLOYED",
    "STUDENT",
    "RETIRED",
    "OTHER",
  ]),
  monthlyIncomeCents: z
    .number()
    .int("Income must be an integer minor unit in cents")
    .positive("Monthly income must be greater than zero"),
  supervisorContact: z.string().max(100).optional(),
});

export const applicationReferenceSchema = z.object({
  name: z.string().min(2, "Reference name is required").max(100),
  relationship: z.string().min(2, "Relationship is required").max(50),
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Valid phone number is required"),
});

export const applicationDocumentUploadSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  type: z.enum([
    "GOVERNMENT_ID",
    "PAYSTUB",
    "BANK_STATEMENT",
    "TAX_RETURN",
    "OFFER_LETTER",
    "OTHER",
  ]),
  fileUrl: z.string().url("Valid document file URL is required"),
});

export const roomApplicationSubmissionSchema = z.object({
  roomId: z.string().uuid("Valid Room UUID is required"),
  requestedMoveInDate: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Valid move-in date is required",
    }),
  intendedStayMonths: z
    .number()
    .int()
    .min(1, "Minimum stay is 1 month")
    .max(36, "Maximum stay is 36 months")
    .default(12),
  personalInfo: applicationPersonalInfoSchema,
  employment: applicationEmploymentSchema,
  references: z
    .array(applicationReferenceSchema)
    .min(1, "At least 1 reference is required"),
  documents: z
    .array(applicationDocumentUploadSchema)
    .min(1, "At least 1 verification document is required"),
  emergencyContact: z.object({
    name: z.string().min(2, "Emergency contact name is required"),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Valid emergency phone is required"),
    relationship: z
      .string()
      .min(2, "Emergency contact relationship is required"),
  }),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
  idempotencyKey: z.string().uuid("Unique idempotency key is required"),
});

export type ApplicationPersonalInfo = z.infer<
  typeof applicationPersonalInfoSchema
>;
export type ApplicationEmployment = z.infer<typeof applicationEmploymentSchema>;
export type ApplicationReference = z.infer<typeof applicationReferenceSchema>;
export type ApplicationDocumentUpload = z.infer<
  typeof applicationDocumentUploadSchema
>;
export type RoomApplicationSubmissionPayload = z.infer<
  typeof roomApplicationSubmissionSchema
>;
