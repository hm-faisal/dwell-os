import { z } from "zod";

export const createApplicationSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  moveInDate: z.string().min(1, "Move-in date is required"),
  employment: z.string().optional(),
  personalInfo: z.string().optional(),
  references: z.string().optional(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export const approveApplicationSchema = z.object({
  expectedRoomVersion: z.number().int().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateApplicationFormData = z.infer<typeof createApplicationSchema>;
export type ApproveApplicationFormData = z.infer<
  typeof approveApplicationSchema
>;
