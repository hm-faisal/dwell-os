export type RoomType = "PRIVATE" | "SHARED";

export type FurnishingStatus = "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED";

export type RoomAvailabilityStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "OCCUPIED"
  | "MAINTENANCE"
  | "ARCHIVED";

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  type: RoomType;
  _type?: RoomType;
  furnishing: FurnishingStatus;
  size?: number | null;
  rent: number; // in integer minor units (cents)
  deposit: number; // in integer minor units (cents)
  maxOccupants: number;
  occupiedSlots: number;
  photos: string[];
  status: RoomAvailabilityStatus;
  availableFrom?: string | null;
  minStayMonths: number;
  leaseTerms?: string | null;
  hasPrivateBath?: boolean | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    ownerId?: string;
  };
}

export interface CreateRoomDTO {
  name: string;
  type?: RoomType;
  furnishing?: FurnishingStatus;
  isFurnished?: boolean;
  size?: number;
  dimensions?: string;
  rent: number; // in integer minor units (cents)
  deposit?: number; // in integer minor units (cents)
  maxOccupants?: number;
  photos?: string[];
  availableFrom?: string;
  minStayMonths?: number;
  leaseTerms?: string;
  hasPrivateBath?: boolean;
  amenities?: string[];
}

export interface UpdateRoomDTO {
  name?: string;
  type?: RoomType;
  furnishing?: FurnishingStatus;
  isFurnished?: boolean;
  size?: number;
  dimensions?: string;
  rent?: number;
  deposit?: number;
  maxOccupants?: number;
  occupiedSlots?: number;
  photos?: string[];
  status?: RoomAvailabilityStatus;
  availableFrom?: string;
  minStayMonths?: number;
  leaseTerms?: string;
  hasPrivateBath?: boolean;
  expectedVersion?: number;
}

export interface ListRoomsQuery {
  cursor?: string;
  limit?: number;
  status?: RoomAvailabilityStatus;
}
