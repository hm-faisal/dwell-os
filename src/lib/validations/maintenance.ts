import { z } from "zod";

export const createMaintenanceSchema = z.object({
  category: z.enum([
    "PLUMBING",
    "ELECTRICAL",
    "HVAC",
    "APPLIANCE",
    "STRUCTURAL",
    "OTHER",
  ]),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]).default("MEDIUM"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  photos: z.array(z.string()).default([]),
});

export const rateMaintenanceSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional(),
});

export type CreateMaintenanceFormData = z.infer<typeof createMaintenanceSchema>;
export type RateMaintenanceFormData = z.infer<typeof rateMaintenanceSchema>;
