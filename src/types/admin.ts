export interface Dispute {
  id: string;
  raisedById: string;
  category: "RENT" | "DEPOSIT" | "BILL" | "ROOMMATE" | "OTHER";
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  description: string;
  resolution?: string | null;
  resolvedById?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  raisedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  beforeState?: string | null;
  afterState?: string | null;
  metadata?: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "TENANT" | "OWNER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  isEmailVerified: boolean;
  createdAt: string;
}
