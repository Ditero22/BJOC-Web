import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuthSession() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthSession must be used inside AuthProvider");
  }

  return context;
}
