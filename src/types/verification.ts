export type VerificationType =
  | "IDENTITY"
  | "INCOME"
  | "EMPLOYMENT"
  | "REFERENCE_CHECK";

export type VerificationStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export interface Verification {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  documentUrl?: string | null;
  data?: string | null;
  notes?: string | null;
  reviewerId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SubmitVerificationDTO {
  type: VerificationType;
  documentUrl: string;
  notes?: string;
  data?: Record<string, unknown>;
}

export interface UpdateVerificationStatusDTO {
  status: VerificationStatus;
  notes?: string;
}
