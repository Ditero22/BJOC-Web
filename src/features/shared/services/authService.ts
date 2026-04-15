import api from "@/features/shared/services/api";

type LoginPayload = {
  email: string;
  password: string;
};

export const authService = {
  async login(payload: LoginPayload) {
    const res = await api.post("/auth/login", payload);
    return res.data;
  },
};
