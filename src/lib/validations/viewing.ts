import { z } from "zod";

export const createViewingRequestSchema = z.object({
  roomId: z.string().min(1, "Room is required"),
  type: z.enum(["IN_PERSON", "VIRTUAL"]).default("IN_PERSON"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  alternateDate: z.string().optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type CreateViewingRequestFormData = z.infer<
  typeof createViewingRequestSchema
>;
