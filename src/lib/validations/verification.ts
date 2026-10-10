import { z } from "zod";

export const submitVerificationSchema = z.object({
  type: z.enum(["IDENTITY", "INCOME", "EMPLOYMENT", "REFERENCE_CHECK"]),
  documentUrl: z.string().min(1, "Document upload is required"),
  notes: z.string().max(500).optional(),
});

export type SubmitVerificationFormData = z.infer<
  typeof submitVerificationSchema
>;
