import api from "@/features/shared/services/api";
import type { AuthLoginPayload, AuthLoginResponse } from "@/features/types/auth";
import { normalizeRole } from "./authRouting";

interface LoginApiResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      status: string;
    };
  };
}

export const loginService = {
  async login(payload: AuthLoginPayload): Promise<AuthLoginResponse> {
    const response = await api.post<LoginApiResponse>("/auth/login", payload);
    const result = response.data.data;

    return {
      accessToken: result.accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: normalizeRole(result.user.role),
        status: result.user.status,
      },
    };
  },
};
