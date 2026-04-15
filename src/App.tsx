import { Suspense, lazy, type ReactNode } from "react";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/features/pages/auth";
import ProtectedRoute from "@/features/shared/ProtectedRoute";

const LoginPage = lazy(() => import("@/features/pages/auth").then((module) => ({ default: module.LoginPage })));
const MainLayout = lazy(() => import("@/features/shared/components/layout/MainLayout"));
const OperatorDashboard = lazy(() => import("@/features/pages/Operator").then((module) => ({ default: module.OperatorDashboard })));
const OperatorManageRoutes2 = lazy(() => import("@/features/pages/Operator").then((module) => ({ default: module.OperatorManageRoutes2 })));
const OperatorDriversVehicles = lazy(() => import("@/features/pages/Operator").then((module) => ({ default: module.OperatorDriversVehicles })));
const OperatorReportsPage = lazy(() => import("@/features/pages/Operator").then((module) => ({ default: module.OperatorReportsPage })));
const OperatorTrips = lazy(() => import("@/features/pages/Operator").then((module) => ({ default: module.OperatorTrips })));
const AdminDashboard = lazy(() => import("@/features/pages/Admin").then((module) => ({ default: module.AdminDashboard })));
const AdminUserManagement = lazy(() => import("@/features/pages/Admin").then((module) => ({ default: module.AdminUserManagement })));
const AdminActivityLogsPage = lazy(() => import("@/features/pages/Admin").then((module) => ({ default: module.AdminActivityLogsPage })));
const AdminDriverVehicleOversight = lazy(() => import("@/features/pages/Admin").then((module) => ({ default: module.AdminDriverVehicleOversight })));
const AdminRouteStopManagement = lazy(() => import("@/features/pages/Admin").then((module) => ({ default: module.AdminRouteStopManagement })));
const AdminTrips = lazy(() => import("@/features/pages/Admin").then((module) => ({ default: module.AdminTrips })));
const AdminReportsHistory = lazy(() => import("@/features/pages/Admin").then((module) => ({ default: module.AdminReportsHistory })));
const AdminSystemSettings = lazy(() => import("@/features/pages/Admin").then((module) => ({ default: module.AdminSystemSettings })));
const AlertHistoryPage = lazy(() => import("@/features/pages/Notification").then((module) => ({ default: module.AlertHistoryPage })));
const NotificationHistoryPage = lazy(() => import("@/features/pages/Notification").then((module) => ({ default: module.NotificationHistoryPage })));

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/70">
          BJOC
        </p>
        <p className="mt-2 text-sm font-medium text-slate-600">Loading workspace...</p>
      </div>
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return (
    <Suspense fallback={<RouteLoader />}>
      {element}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: withSuspense(<LoginPage />),
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/operator/*",
    element: <Navigate to="/staff/dashboard" replace />,
  },
  {
    element: <ProtectedRoute allowedRoles={["staff"]} />,
    children: [
      {
        path: "/staff",
        element: withSuspense(<MainLayout />),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: withSuspense(<OperatorDashboard />) },
          { path: "trips", element: withSuspense(<OperatorTrips />) },
          { path: "drivers-vehicles", element: withSuspense(<OperatorDriversVehicles />) },
          { path: "routes", element: withSuspense(<OperatorManageRoutes2 />) },
          { path: "reports", element: withSuspense(<OperatorReportsPage />) },
          { path: "notifications", element: withSuspense(<NotificationHistoryPage />) },
          { path: "alert", element: withSuspense(<AlertHistoryPage />) },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin",
        element: withSuspense(<MainLayout />),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: withSuspense(<AdminDashboard />) },
          { path: "routes-stops", element: withSuspense(<AdminRouteStopManagement />) },
          { path: "drivers-vehicles", element: withSuspense(<AdminDriverVehicleOversight />) },
          { path: "trips", element: withSuspense(<AdminTrips />) },
          { path: "reports-history", element: withSuspense(<AdminReportsHistory />) },
          { path: "users", element: withSuspense(<AdminUserManagement />) },
          { path: "logs", element: withSuspense(<AdminActivityLogsPage />) },
          { path: "settings", element: withSuspense(<AdminSystemSettings />) },
          { path: "notifications", element: withSuspense(<NotificationHistoryPage />) },
          { path: "alert", element: withSuspense(<AlertHistoryPage />) },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
