export type MaintenanceCategory =
  | "PLUMBING"
  | "ELECTRICAL"
  | "HVAC"
  | "APPLIANCE"
  | "STRUCTURAL"
  | "OTHER";

export type MaintenanceUrgency = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export type MaintenanceStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export interface MaintenanceRequest {
  id: string;
  roomId: string;
  requesterId: string;
  category: MaintenanceCategory;
  urgency: MaintenanceUrgency;
  description: string;
  photos: string[];
  status: MaintenanceStatus;
  assignedToId?: string | null;
  resolvedAt?: string | null;
  rating?: number | null;
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
  room?: {
    id: string;
    name: string;
    property?: {
      id: string;
      name: string;
    };
  };
  requester?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateMaintenanceRequestDTO {
  category: MaintenanceCategory;
  urgency?: MaintenanceUrgency;
  description: string;
  photos?: string[];
}

export interface UpdateMaintenanceStatusDTO {
  status: MaintenanceStatus;
  assignedToId?: string;
  feedback?: string;
}

export interface RateMaintenanceDTO {
  rating: number; // 1-5
  feedback?: string;
}
