export type UserRole = "TENANT" | "OWNER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  emailVerifiedAt?: string | null;
  stripeCustomerId?: string | null;
  stripeAccountId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: "TENANT" | "OWNER";
}

export interface LoginDTO {
  email: string;
  password: string;
}
