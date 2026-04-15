import { useEffect, useState, type ReactNode } from "react";
import {
  authSessionService,
  clearAuthSession,
  getAccessToken,
  getStoredUserInfo,
  loginService,
  setAuthSession,
  toStoredUserInfo,
} from "../services";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(getStoredUserInfo());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const token = getAccessToken();

      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const currentUser = await authSessionService.getCurrentUser();
        const storedUser = toStoredUserInfo(currentUser);

        setAuthSession(token, storedUser, Boolean(localStorage.getItem("bjoc_access_token")));

        if (isMounted) {
          setUser(storedUser);
        }
      } catch {
        clearAuthSession();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(payload: { email: string; password: string }, remember: boolean) {
    const response = await loginService.login(payload);
    const storedUser = toStoredUserInfo(response.user);

    setAuthSession(response.accessToken, storedUser, remember);
    setUser(storedUser);

    return storedUser;
  }

  function logout() {
    clearAuthSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isBootstrapping,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
