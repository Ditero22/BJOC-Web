import type { StoredUserInfo } from "@/features/types/auth";

const ACCESS_TOKEN_KEY = "bjoc_access_token";
const USER_INFO_KEY = "bjoc_user_info";

function getStorage(remember: boolean) {
  return remember ? localStorage : sessionStorage;
}

function readFromStorage(key: string) {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

export function setAuthSession(token: string, user: StoredUserInfo, remember: boolean) {
  clearAuthSession();

  const storage = getStorage(remember);
  storage.setItem(ACCESS_TOKEN_KEY, token);
  storage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  return readFromStorage(ACCESS_TOKEN_KEY);
}

export function getStoredUserInfo(): StoredUserInfo | null {
  const rawValue = readFromStorage(USER_INFO_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredUserInfo;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_INFO_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}
