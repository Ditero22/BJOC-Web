import { createContext } from "react";
import type { AuthLoginPayload, StoredUserInfo } from "@/features/types/auth";

export interface AuthContextValue {
  user: StoredUserInfo | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (payload: AuthLoginPayload, remember: boolean) => Promise<StoredUserInfo>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
