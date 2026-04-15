import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthSkeleton } from "@/features/pages/auth/pages";
import { getDefaultPathForRole, useAuthSession } from "@/features/pages/auth";
import type { Role } from "@/features/types/auth";

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, isBootstrapping } = useAuthSession();

  if (isBootstrapping) {
    return <AuthSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
