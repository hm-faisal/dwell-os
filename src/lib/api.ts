import type { AdminUser, AuditLog, Dispute } from "../types/admin";
import type {
  Application,
  ApproveApplicationDTO,
  CreateApplicationDTO,
  UpdateApplicationStatusDTO,
} from "../types/application";
import type {
  AuthResponse,
  AuthTokens,
  LoginDTO,
  RegisterDTO,
  User,
} from "../types/auth";
import type { OwnerDashboardOverview, RentInvoice } from "../types/dashboard";
import type {
  DocumentAuditLog,
  Lease,
  RentalDocument,
  SignDocumentDTO,
} from "../types/lease";
import type {
  CreateMaintenanceRequestDTO,
  MaintenanceRequest,
  RateMaintenanceDTO,
  UpdateMaintenanceStatusDTO,
} from "../types/maintenance";
import type {
  CreatePropertyDTO,
  ListPropertiesQuery,
  Property,
  UpdatePropertyDTO,
} from "../types/property";
import type {
  CreateRoomDTO,
  ListRoomsQuery,
  Room,
  UpdateRoomDTO,
} from "../types/room";
import type {
  ExpressInterestDTO,
  RoommateApproval,
  RoommateApprovalDTO,
  RoommateMatch,
  RoommateMatchesResponse,
  RoommateProfile,
  UpsertRoommateProfileDTO,
} from "../types/roommate";
import type {
  CreateSavedSearchDTO,
  SavedSearch,
  SearchFilters,
  SearchPropertiesResponse,
  SearchResultProperty,
} from "../types/search";
import type {
  BillShare,
  CreateUtilityBillDTO,
  UtilityBill,
} from "../types/utility";
import type {
  SubmitVerificationDTO,
  Verification,
} from "../types/verification";
import type {
  CreateViewingRequestDTO,
  UpdateViewingRequestDTO,
  ViewingRequest,
} from "../types/viewing";
import { showToast } from "./toast";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = "Validation failed",
    details?: Record<string, unknown>,
  ) {
    super(400, "VALIDATION_ERROR", message, details);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message = "Authentication required",
    details?: Record<string, unknown>,
  ) {
    super(401, "UNAUTHORIZED", message, details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message = "Permission denied",
    details?: Record<string, unknown>,
  ) {
    super(403, "FORBIDDEN", message, details);
    this.name = "ForbiddenError";
  }
}

export class EmailVerificationRequiredError extends ApiError {
  constructor(
    message = "Email verification is required to perform this action",
    details?: Record<string, unknown>,
  ) {
    super(403, "EMAIL_VERIFICATION_REQUIRED", message, details);
    this.name = "EmailVerificationRequiredError";
  }
}

export class NotFoundError extends ApiError {
  constructor(
    message = "Resource not found",
    details?: Record<string, unknown>,
  ) {
    super(404, "NOT_FOUND", message, details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(
    message = "Resource conflict or concurrent modification",
    details?: Record<string, unknown>,
  ) {
    super(409, "CONFLICT", message, details);
    this.name = "ConflictError";
  }
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: unknown;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("dwellos_token")
  );
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("refreshToken") ||
    localStorage.getItem("dwellos_refresh_token")
  );
}

export function setStoredRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("refreshToken", token);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem("dwellos_user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("dwellos_user", JSON.stringify(user));
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("dwellos_token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("dwellos_refresh_token");
  localStorage.removeItem("dwellos_user");
}

export const clearStoredToken = clearStoredTokens;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  for (const callback of refreshSubscribers) {
    callback(token);
  }
  refreshSubscribers = [];
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { _isRetry?: boolean } = {},
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    if (typeof window !== "undefined") {
      showToast.error(
        "Network connection error. Please check your internet connection.",
      );
    }
    throw netErr;
  }

  const contentType = response.headers.get("content-type") || "";
  let responseData: unknown = null;

  if (contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  // Intercept 401 Unauthorized for automatic token refresh
  if (
    response.status === 401 &&
    !options._isRetry &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/register") &&
    !endpoint.includes("/auth/refresh")
  ) {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = (await refreshRes.json()) as {
              data?: { accessToken: string; refreshToken: string };
              accessToken?: string;
              refreshToken?: string;
            };
            const newAccessToken =
              refreshData.data?.accessToken || refreshData.accessToken;
            const newRefreshToken =
              refreshData.data?.refreshToken || refreshData.refreshToken;

            if (newAccessToken) {
              setStoredToken(newAccessToken);
              if (newRefreshToken) {
                setStoredRefreshToken(newRefreshToken);
              }
              isRefreshing = false;
              onRefreshed(newAccessToken);
              return apiRequest<T>(endpoint, {
                ...options,
                _isRetry: true,
                headers: {
                  ...Object.fromEntries(headers.entries()),
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });
            }
          }
        } catch {
          // Refresh request failed
        }

        isRefreshing = false;
        clearStoredTokens();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")
        ) {
          window.location.href = "/login";
        }
      } else {
        // Wait for active refresh to finish
        return new Promise<T>((resolve) => {
          refreshSubscribers.push((newToken: string) => {
            resolve(
              apiRequest<T>(endpoint, {
                ...options,
                _isRetry: true,
                headers: {
                  ...Object.fromEntries(headers.entries()),
                  Authorization: `Bearer ${newToken}`,
                },
              }),
            );
          });
        });
      }
    }
  }

  if (!response.ok) {
    const errorBody =
      typeof responseData === "object" && responseData !== null
        ? ((responseData as Record<string, unknown>).error as Record<
            string,
            unknown
          >) || (responseData as Record<string, unknown>)
        : {};
    const message =
      (errorBody.message as string | undefined) ||
      (typeof responseData === "object" && responseData !== null
        ? ((responseData as Record<string, unknown>).message as
            | string
            | undefined)
        : undefined) ||
      `Request failed with status ${response.status}`;
    const code = (errorBody.code as string | undefined) || "API_ERROR";
    const details = errorBody.details as Record<string, unknown> | undefined;

    switch (response.status) {
      case 400:
        throw new ValidationError(message, details);
      case 401:
        throw new UnauthorizedError(message, details);
      case 403:
        if (code === "EMAIL_VERIFICATION_REQUIRED") {
          showToast.verificationRequired({ message });
          throw new EmailVerificationRequiredError(message, details);
        }
        throw new ForbiddenError(message, details);
      case 404:
        throw new NotFoundError(message, details);
      case 409:
        throw new ConflictError(message, details);
      default:
        throw new ApiError(response.status, code, message, details);
    }
  }

  // If response format has unified `{ success, data }`, unwrap `data`
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData &&
    "success" in responseData
  ) {
    return (responseData as Record<string, unknown>).data as T;
  }

  return responseData as T;
}

export const authApi = {
  login: async (dto: LoginDTO): Promise<AuthResponse> => {
    const res = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    const accessToken = res.accessToken || res.tokens?.accessToken;
    const refreshToken = res.refreshToken || res.tokens?.refreshToken;
    if (accessToken) setStoredToken(accessToken);
    if (refreshToken) setStoredRefreshToken(refreshToken);
    if (res.user) setStoredUser(res.user);
    return res;
  },

  register: async (dto: RegisterDTO): Promise<AuthResponse> => {
    const res = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    const accessToken = res.accessToken || res.tokens?.accessToken;
    const refreshToken = res.refreshToken || res.tokens?.refreshToken;
    if (accessToken) setStoredToken(accessToken);
    if (refreshToken) setStoredRefreshToken(refreshToken);
    if (res.user) setStoredUser(res.user);
    return res;
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    return apiRequest<AuthTokens>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      const refreshToken = getStoredRefreshToken();
      await apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearStoredTokens();
    }
    return { success: true };
  },

  getMe: async (): Promise<User> => {
    const user = await apiRequest<User>("/auth/me");
    setStoredUser(user);
    return user;
  },

  verifyEmail: async (
    token: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      "/auth/verify-email",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      },
    );
  },

  resendVerification: async (
    email: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      "/auth/resend-verification",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
  },

  getGoogleAuthUrl: (): string => {
    return `${API_BASE_URL}/auth/oauth/google`;
  },

  initiateGoogleLogin: (): void => {
    if (typeof window !== "undefined") {
      window.location.href = `${API_BASE_URL}/auth/oauth/google`;
    }
  },
};

function normalizeRoom(r: unknown): Room {
  if (!r || typeof r !== "object") return r as Room;
  const raw = r as Record<string, unknown>;
  const resolvedType = (raw.type || raw._type || "PRIVATE") as Room["type"];
  return {
    ...raw,
    type: resolvedType,
    _type: resolvedType,
  } as Room;
}

function normalizeProperty(p: unknown): Property {
  if (!p || typeof p !== "object") return p as Property;
  const raw = p as Record<string, unknown>;
  const rawRooms = Array.isArray(raw.rooms) ? raw.rooms : [];
  const rawManagers = Array.isArray(raw.propertyManagers)
    ? raw.propertyManagers
    : Array.isArray(raw.managers)
      ? raw.managers
      : [];
  const resolvedType = (raw.type ||
    raw._type ||
    "APARTMENT") as Property["type"];
  return {
    ...raw,
    type: resolvedType,
    _type: resolvedType,
    rooms: rawRooms.map(normalizeRoom),
    propertyManagers: rawManagers,
    managers: rawManagers,
  } as Property;
}

function normalizeSearchResultProperty(p: unknown): SearchResultProperty {
  const prop = normalizeProperty(p);
  const raw = p as Record<string, unknown>;
  const rawAvail = Array.isArray(raw.availableRooms) ? raw.availableRooms : [];
  return {
    ...prop,
    availableRooms: rawAvail.map(normalizeRoom),
  } as SearchResultProperty;
}

export const propertiesApi = {
  list: async (query?: ListPropertiesQuery): Promise<Property[]> => {
    const params = new URLSearchParams();
    if (query?.cursor) params.set("cursor", query.cursor);
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.city) params.set("city", query.city);
    if (query?.ownerOnly !== undefined) {
      params.set("ownerOnly", String(query.ownerOnly));
    }
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest<Property[] | { items: Property[] }>(
      `/properties${queryStr}`,
    );
    const list = Array.isArray(res)
      ? res
      : res &&
          typeof res === "object" &&
          "items" in res &&
          Array.isArray(res.items)
        ? res.items
        : [];
    return list.map(normalizeProperty);
  },

  get: async (id: string): Promise<Property> => {
    const res = await apiRequest<Property>(`/properties/${id}`);
    return normalizeProperty(res);
  },

  create: async (data: CreatePropertyDTO): Promise<Property> => {
    const res = await apiRequest<Property>("/properties", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeProperty(res);
  },

  update: async (id: string, data: UpdatePropertyDTO): Promise<Property> => {
    const res = await apiRequest<Property>(`/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return normalizeProperty(res);
  },

  archive: (id: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      `/properties/${id}`,
      {
        method: "DELETE",
      },
    );
  },

  addManager: (
    propertyId: string,
    userId: string,
    permissions: string[] = [
      "MANAGE_ROOMS",
      "MANAGE_APPLICATIONS",
      "MANAGE_MAINTENANCE",
    ],
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/properties/${propertyId}/managers`, {
      method: "POST",
      body: JSON.stringify({ userId, permissions }),
    });
  },

  removeManager: (
    propertyId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/properties/${propertyId}/managers`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
  },
};

export const roomsApi = {
  list: async (propertyId: string, query?: ListRoomsQuery): Promise<Room[]> => {
    const params = new URLSearchParams();
    if (query?.cursor) params.set("cursor", query.cursor);
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.status) params.set("status", query.status);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest<Room[] | { items: Room[] }>(
      `/properties/${propertyId}/rooms${queryStr}`,
    );
    const list = Array.isArray(res)
      ? res
      : res &&
          typeof res === "object" &&
          "items" in res &&
          Array.isArray(res.items)
        ? res.items
        : [];
    return list.map(normalizeRoom);
  },

  get: async (id: string): Promise<Room> => {
    const res = await apiRequest<Room>(`/rooms/${id}`);
    return normalizeRoom(res);
  },

  create: async (propertyId: string, data: CreateRoomDTO): Promise<Room> => {
    const res = await apiRequest<Room>(`/properties/${propertyId}/rooms`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeRoom(res);
  },

  update: async (id: string, data: UpdateRoomDTO): Promise<Room> => {
    const res = await apiRequest<Room>(`/rooms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return normalizeRoom(res);
  },

  archive: (id: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/rooms/${id}`, {
      method: "DELETE",
    });
  },
};

export const uploadsApi = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiRequest<{ url: string; publicId?: string }>(
      "/uploads",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res || !res.url) {
      throw new ApiError(
        500,
        "UPLOAD_FAILED",
        "Failed to retrieve uploaded image URL",
      );
    }

    return { url: res.url };
  },
};

export const searchApi = {
  searchProperties: async (
    filters?: SearchFilters,
  ): Promise<SearchPropertiesResponse> => {
    const params = new URLSearchParams();
    if (filters?.location) params.set("location", filters.location);
    if (filters?.priceMin !== undefined) {
      params.set("priceMin", String(Math.round(filters.priceMin * 100)));
    }
    if (filters?.priceMax !== undefined) {
      params.set("priceMax", String(Math.round(filters.priceMax * 100)));
    }
    if (filters?.roomType) params.set("roomType", filters.roomType);
    if (filters?.isFurnished !== undefined) {
      params.set("isFurnished", String(filters.isFurnished));
    }
    if (filters?.moveInDate) {
      const dateStr = filters.moveInDate.includes("T")
        ? filters.moveInDate
        : new Date(filters.moveInDate).toISOString();
      params.set("moveInDate", dateStr);
    }
    if (filters?.amenities && filters.amenities.length > 0) {
      params.set("amenities", filters.amenities.join(","));
    }
    if (filters?.cursor) params.set("cursor", filters.cursor);
    if (filters?.limit) params.set("limit", String(filters.limit));

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest<
      | SearchPropertiesResponse
      | {
          items: SearchResultProperty[];
          nextCursor?: string | null;
          limit?: number;
        }
    >(`/search/properties${queryStr}`);

    const rawItems = Array.isArray(res)
      ? res
      : res &&
          typeof res === "object" &&
          "items" in res &&
          Array.isArray(res.items)
        ? res.items
        : [];
    const items = rawItems.map(normalizeSearchResultProperty);
    const nextCursor =
      res && typeof res === "object" && "nextCursor" in res
        ? (res.nextCursor as string | null | undefined)
        : null;

    return {
      items,
      nextCursor: nextCursor || null,
      hasMore: Boolean(nextCursor),
      limit:
        res &&
        typeof res === "object" &&
        "limit" in res &&
        typeof res.limit === "number"
          ? res.limit
          : filters?.limit || 20,
    };
  },

  createSavedSearch: async (
    data: CreateSavedSearchDTO,
  ): Promise<SavedSearch> => {
    return apiRequest<SavedSearch>("/search/saved", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getSavedSearches: async (): Promise<SavedSearch[]> => {
    const res = await apiRequest<SavedSearch[] | { items: SavedSearch[] }>(
      "/search/saved",
    );
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  deleteSavedSearch: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      `/search/saved/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};

export const roommateMatchingApi = {
  getMyProfile: async (): Promise<RoommateProfile | null> => {
    try {
      return await apiRequest<RoommateProfile>("/roommate-profile");
    } catch (err) {
      if (err instanceof NotFoundError) {
        return null;
      }
      throw err;
    }
  },

  getProfile: async (userId: string): Promise<RoommateProfile> => {
    return apiRequest<RoommateProfile>(`/roommate-profile/${userId}`);
  },

  upsertProfile: async (
    data: UpsertRoommateProfileDTO,
  ): Promise<RoommateProfile> => {
    return apiRequest<RoommateProfile>("/roommate-profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMatches: async (query?: {
    minScore?: number;
    cursor?: string;
    limit?: number;
  }): Promise<RoommateMatchesResponse> => {
    const params = new URLSearchParams();
    if (query?.minScore !== undefined) {
      params.set("minScore", String(query.minScore));
    }
    if (query?.cursor) params.set("cursor", query.cursor);
    if (query?.limit) params.set("limit", String(query.limit));

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest<
      | RoommateMatchesResponse
      | { items: RoommateMatch[]; nextCursor?: string | null; limit?: number }
    >(`/matches${queryStr}`);

    const items = Array.isArray(res)
      ? res
      : res &&
          typeof res === "object" &&
          "items" in res &&
          Array.isArray(res.items)
        ? res.items
        : [];
    const nextCursor =
      res && typeof res === "object" && "nextCursor" in res
        ? (res.nextCursor as string | null | undefined)
        : null;

    return {
      items,
      nextCursor: nextCursor || null,
      limit:
        res &&
        typeof res === "object" &&
        "limit" in res &&
        typeof res.limit === "number"
          ? res.limit
          : query?.limit || 20,
    };
  },

  expressInterest: async (
    targetUserId: string,
    data?: ExpressInterestDTO,
  ): Promise<RoommateMatch> => {
    return apiRequest<RoommateMatch>(`/matches/${targetUserId}/interest`, {
      method: "POST",
      body: JSON.stringify(data || { interested: true }),
    });
  },

  approveRoommate: async (
    roomId: string,
    data: RoommateApprovalDTO,
  ): Promise<RoommateApproval> => {
    return apiRequest<RoommateApproval>(`/rooms/${roomId}/roommate-approval`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const applicationsApi = {
  list: async (query?: {
    roomId?: string;
    status?: string;
  }): Promise<Application[]> => {
    const params = new URLSearchParams();
    if (query?.roomId) params.set("roomId", query.roomId);
    if (query?.status) params.set("status", query.status);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest<Application[] | { items: Application[] }>(
      `/applications${qs}`,
    );
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  get: async (id: string): Promise<Application> => {
    return apiRequest<Application>(`/applications/${id}`);
  },

  create: async (data: CreateApplicationDTO): Promise<Application> => {
    return apiRequest<Application>("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (
    id: string,
    data: UpdateApplicationStatusDTO,
  ): Promise<Application> => {
    return apiRequest<Application>(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  approve: async (
    id: string,
    data?: ApproveApplicationDTO,
  ): Promise<{
    success: boolean;
    application: Application;
    leaseId?: string;
  }> => {
    return apiRequest<{
      success: boolean;
      application: Application;
      leaseId?: string;
    }>(`/applications/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    });
  },
};

export const viewingsApi = {
  list: async (query?: {
    roomId?: string;
    status?: string;
  }): Promise<ViewingRequest[]> => {
    const params = new URLSearchParams();
    if (query?.roomId) params.set("roomId", query.roomId);
    if (query?.status) params.set("status", query.status);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest<
      ViewingRequest[] | { items: ViewingRequest[] }
    >(`/viewing-requests${qs}`);
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  get: async (id: string): Promise<ViewingRequest> => {
    return apiRequest<ViewingRequest>(`/viewing-requests/${id}`);
  },

  create: async (data: CreateViewingRequestDTO): Promise<ViewingRequest> => {
    return apiRequest<ViewingRequest>("/viewing-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (
    id: string,
    data: UpdateViewingRequestDTO,
  ): Promise<ViewingRequest> => {
    return apiRequest<ViewingRequest>(`/viewing-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

export const leasesApi = {
  list: async (propertyId?: string): Promise<Lease[]> => {
    const qs = propertyId ? `?propertyId=${propertyId}` : "";
    const res = await apiRequest<Lease[] | { items: Lease[] }>(`/leases${qs}`);
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  get: async (id: string): Promise<Lease> => {
    return apiRequest<Lease>(`/leases/${id}`);
  },

  signDocument: async (
    documentId: string,
    data: SignDocumentDTO,
  ): Promise<RentalDocument> => {
    return apiRequest<RentalDocument>(`/documents/${documentId}/sign`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getDocumentAuditLog: async (
    documentId: string,
  ): Promise<DocumentAuditLog[]> => {
    const res = await apiRequest<
      DocumentAuditLog[] | { items: DocumentAuditLog[] }
    >(`/documents/${documentId}/audit-log`);
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },
};

export const rentApi = {
  listInvoices: async (leaseId?: string): Promise<RentInvoice[]> => {
    const endpoint = leaseId ? `/leases/${leaseId}/invoices` : "/invoices";
    const res = await apiRequest<RentInvoice[] | { items: RentInvoice[] }>(
      endpoint,
    );
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  getInvoice: async (id: string): Promise<RentInvoice> => {
    return apiRequest<RentInvoice>(`/invoices/${id}`);
  },

  payRent: async (
    invoiceId: string,
    paymentMethodId?: string,
  ): Promise<{
    success: boolean;
    checkoutUrl?: string;
    paymentIntentId?: string;
  }> => {
    return apiRequest<{
      success: boolean;
      checkoutUrl?: string;
      paymentIntentId?: string;
    }>("/payments/rent", {
      method: "POST",
      body: JSON.stringify({ invoiceId, paymentMethodId }),
    });
  },
};

export const utilityBillsApi = {
  listPropertyBills: async (propertyId: string): Promise<UtilityBill[]> => {
    const res = await apiRequest<UtilityBill[] | { items: UtilityBill[] }>(
      `/properties/${propertyId}/bills`,
    );
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  getBill: async (id: string): Promise<UtilityBill> => {
    return apiRequest<UtilityBill>(`/bills/${id}`);
  },

  getBillShares: async (billId: string): Promise<BillShare[]> => {
    const res = await apiRequest<BillShare[] | { items: BillShare[] }>(
      `/bills/${billId}/shares`,
    );
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  createBill: async (
    propertyId: string,
    data: CreateUtilityBillDTO,
  ): Promise<UtilityBill> => {
    return apiRequest<UtilityBill>(`/properties/${propertyId}/bills`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  payShare: async (shareId: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>("/payments/bill", {
      method: "POST",
      body: JSON.stringify({ billShareId: shareId }),
    });
  },
};

export const maintenanceApi = {
  list: async (roomId?: string): Promise<MaintenanceRequest[]> => {
    const qs = roomId ? `?roomId=${roomId}` : "";
    const res = await apiRequest<
      MaintenanceRequest[] | { items: MaintenanceRequest[] }
    >(`/maintenance${qs}`);
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  get: async (id: string): Promise<MaintenanceRequest> => {
    return apiRequest<MaintenanceRequest>(`/maintenance/${id}`);
  },

  create: async (
    roomId: string,
    data: CreateMaintenanceRequestDTO,
  ): Promise<MaintenanceRequest> => {
    return apiRequest<MaintenanceRequest>(`/rooms/${roomId}/maintenance`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (
    id: string,
    data: UpdateMaintenanceStatusDTO,
  ): Promise<MaintenanceRequest> => {
    return apiRequest<MaintenanceRequest>(`/maintenance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  rate: async (
    id: string,
    data: RateMaintenanceDTO,
  ): Promise<MaintenanceRequest> => {
    return apiRequest<MaintenanceRequest>(`/maintenance/${id}/rate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const verificationsApi = {
  list: async (userId?: string): Promise<Verification[]> => {
    const endpoint = userId
      ? `/verifications/user/${userId}`
      : "/verifications";
    const res = await apiRequest<Verification[] | { items: Verification[] }>(
      endpoint,
    );
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  get: async (id: string): Promise<Verification> => {
    return apiRequest<Verification>(`/verifications/${id}`);
  },

  submit: async (data: SubmitVerificationDTO): Promise<Verification> => {
    return apiRequest<Verification>("/verifications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (
    id: string,
    status: string,
    notes?: string,
  ): Promise<Verification> => {
    return apiRequest<Verification>(`/verifications/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  },
};

export const dashboardApi = {
  getOverview: async (): Promise<OwnerDashboardOverview> => {
    return apiRequest<OwnerDashboardOverview>("/dashboard/overview");
  },

  getPropertyStats: async (
    propertyId: string,
  ): Promise<Record<string, unknown>> => {
    return apiRequest<Record<string, unknown>>(
      `/dashboard/properties/${propertyId}`,
    );
  },
};

export const adminApi = {
  listUsers: async (query?: {
    role?: string;
    status?: string;
    search?: string;
  }): Promise<AdminUser[]> => {
    const params = new URLSearchParams();
    if (query?.role) params.set("role", query.role);
    if (query?.status) params.set("status", query.status);
    if (query?.search) params.set("search", query.search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest<AdminUser[] | { items: AdminUser[] }>(
      `/admin/users${qs}`,
    );
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  updateUser: async (
    id: string,
    data: { role?: string; status?: string },
  ): Promise<AdminUser> => {
    return apiRequest<AdminUser>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  listDisputes: async (query?: { status?: string }): Promise<Dispute[]> => {
    const qs = query?.status ? `?status=${query.status}` : "";
    const res = await apiRequest<Dispute[] | { items: Dispute[] }>(
      `/admin/disputes${qs}`,
    );
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },

  resolveDispute: async (
    id: string,
    data: { resolution: string; status?: string },
  ): Promise<Dispute> => {
    return apiRequest<Dispute>(`/admin/disputes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  listAuditLogs: async (query?: {
    entityType?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (query?.entityType) params.set("entityType", query.entityType);
    if (query?.action) params.set("action", query.action);
    if (query?.limit) params.set("limit", String(query.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest<AuditLog[] | { items: AuditLog[] }>(
      `/admin/audit-logs${qs}`,
    );
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "items" in res &&
      Array.isArray(res.items)
    ) {
      return res.items;
    }
    return [];
  },
};
