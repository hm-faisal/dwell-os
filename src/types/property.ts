import type { Room } from "./room";

export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "STUDIO"
  | "CONDO"
  | "TOWNHOUSE"
  | "PG"
  | "HOSTEL"
  | "OTHER";

export type PropertyStatus = "ACTIVE" | "ARCHIVED";

export interface PropertyManagerUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface PropertyManager {
  id: string;
  userId: string;
  propertyId: string;
  permissions: string[];
  createdAt?: string;
  user?: PropertyManagerUser;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  amenities: string[];
  photos: string[];
  houseRules?: string[];
  requiresRoommateApproval: boolean;
  status: PropertyStatus;
  ownerId: string;
  stripeAccountId?: string | null;
  createdAt: string;
  updatedAt: string;
  _type?: PropertyType;
  rooms?: Room[];
  propertyManagers?: PropertyManager[];
  managers?: PropertyManager[];
  _count?: {
    rooms?: number;
  };
}

export interface CreatePropertyDTO {
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  amenities?: string[];
  photos?: string[];
  houseRules?: string[];
  requiresRoommateApproval?: boolean;
}

export interface UpdatePropertyDTO {
  name?: string;
  type?: PropertyType;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  amenities?: string[];
  photos?: string[];
  houseRules?: string[];
  status?: PropertyStatus;
  requiresRoommateApproval?: boolean;
  stripeAccountId?: string;
}

export interface ListPropertiesQuery {
  cursor?: string;
  limit?: number;
  city?: string;
  ownerOnly?: boolean | string;
}
