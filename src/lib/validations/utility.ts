import { z } from "zod";

export const createUtilityBillSchema = z.object({
  category: z.enum([
    "ELECTRICITY",
    "WATER",
    "GAS",
    "INTERNET",
    "TRASH",
    "OTHER",
  ]),
  amount: z.number().int().positive("Amount must be greater than 0 cents"),
  billingPeriodStart: z.string().min(1, "Start date is required"),
  billingPeriodEnd: z.string().min(1, "End date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  splitMethod: z.enum(["EQUAL", "PERCENTAGE", "USAGE_BASED"]).default("EQUAL"),
  proofUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CreateUtilityBillFormData = z.infer<typeof createUtilityBillSchema>;
