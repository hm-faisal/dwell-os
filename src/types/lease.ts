export type LeaseStatus = "ACTIVE" | "ENDED" | "TERMINATED" | "DRAFT";
export type DocumentStatus =
  | "DRAFT"
  | "PENDING_SIGNATURE"
  | "PARTIALLY_SIGNED"
  | "EXECUTED"
  | "EXPIRED";
export type DocumentType =
  | "LEASE_AGREEMENT"
  | "ADDENDUM"
  | "INSPECTION_REPORT"
  | "OTHER";

export interface DocumentSignature {
  id: string;
  documentId: string;
  signerId: string;
  status: "PENDING" | "SIGNED" | "DECLINED";
  signatureUrl?: string | null;
  signedAt?: string | null;
  ipAddress?: string | null;
  signer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DocumentAuditLog {
  id: string;
  documentId: string;
  actorId: string;
  action: string;
  ipAddress?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RentalDocument {
  id: string;
  leaseId: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  documentSignatures?: DocumentSignature[];
  documentAuditLogs?: DocumentAuditLog[];
}

export interface LeaseTenant {
  id: string;
  leaseId: string;
  tenantId: string;
  isPrimary: boolean;
  joinedAt: string;
  leftAt?: string | null;
  tenant?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Lease {
  id: string;
  propertyId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  rent: number; // in cents
  deposit: number; // in cents
  billingCycle: "MONTHLY" | "WEEKLY" | "BIWEEKLY";
  billingDayOfMonth: number;
  status: LeaseStatus;
  createdAt: string;
  updatedAt: string;
  leaseTenants?: LeaseTenant[];
  rentalDocuments?: RentalDocument[];
  property?: {
    id: string;
    name: string;
    address: string;
  };
  room?: {
    id: string;
    name: string;
  };
}

export interface SignDocumentDTO {
  signatureUrl?: string;
  signatureBase64?: string;
  consentTimestamp?: string;
}
