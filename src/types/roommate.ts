export type SleepSchedule = "EARLY_BIRD" | "NIGHT_OWL" | "FLEXIBLE";
export type WorkSchedule = "REMOTE" | "OFFICE" | "HYBRID" | "SHIFT";
export type CleanlinessLevel = "VERY_CLEAN" | "MODERATE" | "RELAXED";

export interface RoommateProfileUser {
  id: string;
  name: string;
  email: string;
}

export interface RoommateProfile {
  id: string;
  userId: string;
  budgetMin?: number | null; // In cents
  budgetMax?: number | null; // In cents
  lifestyleTags: string[];
  sleepSchedule?: SleepSchedule | null;
  workSchedule?: WorkSchedule | null;
  smoking: boolean;
  pets: boolean;
  cleanliness?: CleanlinessLevel | null;
  bio?: string | null;
  moveInDate?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: RoommateProfileUser | null;
}

export interface UpsertRoommateProfileDTO {
  budgetMin?: number; // In cents
  budgetMax?: number; // In cents
  lifestyleTags?: string[];
  sleepSchedule?: SleepSchedule;
  workSchedule?: WorkSchedule;
  smoking?: boolean;
  pets?: boolean;
  cleanliness?: CleanlinessLevel;
  bio?: string;
  moveInDate?: string;
}

export interface CompatibilityBreakdown {
  budget: number; // up to 30
  cleanliness: number; // up to 25
  sleep: number; // up to 15
  work: number; // up to 15
  habits: number; // up to 15
  [key: string]: number;
}

export interface RoommateMatch {
  id: string;
  user: RoommateProfileUser;
  profile: RoommateProfile;
  score: number;
  breakdown: CompatibilityBreakdown;
  status?: string | null;
  matchStatus?: "PENDING" | "MUTUAL_INTEREST" | "DECLINED" | null;
  mutualInterest: boolean;
}

export interface RoommateMatchesResponse {
  items: RoommateMatch[];
  nextCursor?: string | null;
  limit?: number;
}

export interface ExpressInterestDTO {
  interested?: boolean;
  message?: string;
}

export interface RoommateApproval {
  id: string;
  roomId: string;
  applicationId?: string | null;
  approverId: string;
  status: "APPROVED" | "REJECTED";
  comments?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoommateApprovalDTO {
  applicationId?: string;
  applicantId?: string;
  status?: "APPROVED" | "REJECTED";
  comments?: string;
}
