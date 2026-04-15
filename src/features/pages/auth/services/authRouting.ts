import type { Role } from "@/features/types/auth";

export function normalizeRole(role: string): Role {
  if (role === "admin") {
    return "admin";
  }

  if (role === "staff" || role === "operator") {
    return "staff";
  }

  throw new Error(`Unsupported frontend role: ${role}`);
}

export function getDefaultPathForRole(role: Role) {
  return role === "admin" ? "/admin/dashboard" : "/staff/dashboard";
}
