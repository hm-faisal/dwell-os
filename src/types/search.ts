import type { Property } from "./property";
import type { Room, RoomType } from "./room";

export type ListingTypeFilter = "ALL" | "ROOMMATE" | "VACANT";

export interface SearchFilters {
  location?: string;
  priceMin?: number; // In dollars for UI, converted to cents for backend
  priceMax?: number; // In dollars for UI, converted to cents for backend
  roomType?: RoomType;
  isFurnished?: boolean;
  moveInDate?: string;
  amenities?: string[];
  listingType?: ListingTypeFilter;
  cursor?: string;
  limit?: number;
}

export interface SearchResultProperty extends Property {
  availableRooms: Room[];
}

export interface SearchPropertiesResponse {
  items: SearchResultProperty[];
  nextCursor?: string | null;
  hasMore: boolean;
  limit?: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name?: string | null;
  location?: string | null;
  priceMin?: number | null; // stored in cents
  priceMax?: number | null; // stored in cents
  roomType?: RoomType | null;
  moveInDate?: string | null;
  amenities: string[];
  createdAt: string;
}

export interface CreateSavedSearchDTO {
  name?: string;
  location?: string;
  priceMin?: number; // in cents
  priceMax?: number; // in cents
  roomType?: RoomType;
  moveInDate?: string;
  amenities: string[];
}
