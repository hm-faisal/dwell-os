import { z } from "zod";

const PROHIBITED_DEMOGRAPHIC_TERMS = [
  "race",
  "religion",
  "christian",
  "muslim",
  "jewish",
  "white",
  "black",
  "asian",
  "latino",
  "no children",
  "singles only",
  "no kids",
  "straight",
  "gay",
  "heterosexual",
  "disability",
  "handicapped",
];

export const fairHousingCheck = (val?: string): boolean => {
  if (!val) return true;
  const lower = val.toLowerCase();
  return !PROHIBITED_DEMOGRAPHIC_TERMS.some((term) => lower.includes(term));
};

export const searchFiltersSchema = z.object({
  location: z
    .string()
    .trim()
    .max(100, "Location query must be under 100 characters")
    .refine(fairHousingCheck, {
      message: "Search location violates Fair Housing compliance guidelines",
    })
    .optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().nonnegative().optional(),
  roomType: z.enum(["PRIVATE", "SHARED"]).optional(),
  isFurnished: z.boolean().optional(),
  moveInDate: z.string().optional(),
  amenities: z.array(z.string().trim()).optional(),
  listingType: z.enum(["ALL", "ROOMMATE", "VACANT"]).default("ALL"),
});

export const createSavedSearchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please provide a name for this saved search")
    .max(100, "Name must be under 100 characters"),
  location: z
    .string()
    .trim()
    .max(100, "Location query must be under 100 characters")
    .refine(fairHousingCheck, {
      message: "Location violates Fair Housing compliance guidelines",
    })
    .optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().nonnegative().optional(),
  roomType: z.enum(["PRIVATE", "SHARED"]).optional(),
  moveInDate: z.string().optional(),
  amenities: z.array(z.string().trim()).default([]),
});

export type SearchFiltersSchema = z.infer<typeof searchFiltersSchema>;
export type CreateSavedSearchSchema = z.infer<typeof createSavedSearchSchema>;
