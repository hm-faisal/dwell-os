export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INFO_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN"
  | "EXPIRED";

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  name: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface ApplicationTenantSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface ApplicationRoomSummary {
  id: string;
  name: string;
  rent: number; // in cents
  deposit: number; // in cents
  status: string;
  version: number;
}

export interface Application {
  id: string;
  roomId: string;
  tenantId: string;
  moveInDate: string;
  status: ApplicationStatus;
  holdExpiresAt?: string | null;
  employment?: string | null;
  personalInfo?: string | null;
  references?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: ApplicationTenantSummary | null;
  room?: ApplicationRoomSummary | null;
  documents?: ApplicationDocument[];
}

export interface CreateApplicationDTO {
  roomId: string;
  moveInDate: string;
  employment?: string;
  personalInfo?: string;
  references?: string;
  notes?: string;
  documents?: Array<{
    name: string;
    type: string;
    fileUrl: string;
  }>;
}

export interface ApproveApplicationDTO {
  expectedRoomVersion?: number;
  notes?: string;
}

export interface UpdateApplicationStatusDTO {
  status: ApplicationStatus;
  notes?: string;
}
