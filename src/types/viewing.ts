export type ViewingType = "IN_PERSON" | "VIRTUAL";

export type ViewingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "ALTERNATE_PROPOSED"
  | "DECLINED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface ViewingRequest {
  id: string;
  roomId: string;
  tenantId: string;
  type: ViewingType;
  status: ViewingStatus;
  preferredDate: string;
  alternateDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  room?: {
    id: string;
    name: string;
    rent: number;
    property?: {
      id: string;
      name: string;
      address: string;
      city: string;
    };
  };
  tenant?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateViewingRequestDTO {
  roomId: string;
  type?: ViewingType;
  preferredDate: string;
  alternateDate?: string;
  notes?: string;
}

export interface UpdateViewingRequestDTO {
  status?: ViewingStatus;
  preferredDate?: string;
  alternateDate?: string;
  notes?: string;
}
