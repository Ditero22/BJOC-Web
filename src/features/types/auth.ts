export type Role = "admin" | "staff";

export interface StoredUserInfo {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface AuthMeResponse {
  id: string;
  email: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  role: Role;
  status: string;
}
