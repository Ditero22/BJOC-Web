import api from "@/features/shared/services/api";
import type { AuthMeResponse, AuthUser, StoredUserInfo } from "@/features/types/auth";
import { normalizeRole } from "./authRouting";

function toAuthUser(payload: AuthMeResponse): AuthUser {
  return {
    id: payload.id,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: normalizeRole(payload.role),
    status: payload.status,
  };
}

export function toStoredUserInfo(user: AuthUser): StoredUserInfo {
  return {
    id: user.id,
    email: user.email,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    role: user.role,
    status: user.status,
  };
}

export const authSessionService = {
  async getCurrentUser() {
    const response = await api.get<{ success: boolean; data: AuthMeResponse }>("/auth/me");
    return toAuthUser(response.data.data);
  },
};
