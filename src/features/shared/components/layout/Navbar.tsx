import { useMemo } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthSession } from "@/features/pages/auth";
import NotificationBell from "./NotificationBell";
import Alert from "./Alert";

interface NavbarProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

function getPageLabel(pathname: string) {
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard Overview";
  if (pathname.startsWith("/admin/routes-stops")) return "Route & Stop Management";
  if (pathname.startsWith("/admin/drivers-vehicles")) return "Driver & Vehicle Oversight";
  if (pathname.startsWith("/admin/trips")) return "Trips & Operations";
  if (pathname.startsWith("/admin/reports-history")) return "Reports & History";
  if (pathname.startsWith("/admin/users")) return "User Management";
  if (pathname.startsWith("/admin/logs")) return "System Logs";
  if (pathname.startsWith("/admin/settings")) return "System Settings";
  if (pathname.startsWith("/staff")) return "Staff Workspace";
  return "BJOC Control Center";
}

function getInitials(fullName?: string | null) {
  if (!fullName) {
    return "U";
  }

  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const { user } = useAuthSession();
  const location = useLocation();
  const isNotificationPage = location.pathname.endsWith("/notifications");
  const isAlertPage = location.pathname.endsWith("/alert");
  const pageLabel = useMemo(() => getPageLabel(location.pathname), [location.pathname]);
  const initials = getInitials(user?.fullName);

  return (
    <nav className="sticky top-0 z-30 border-b border-emerald-950/10 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1440px] items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-800 lg:hidden"
            onClick={onMenuToggle}
            type="button"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/70">
              Admin Workspace
            </p>
            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
              {pageLabel}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Alert disabled={isAlertPage} />
          <NotificationBell disabled={isNotificationPage} />

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-950 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="max-w-[180px] truncate text-sm font-medium text-slate-900">
                {user?.fullName ?? "User"}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {user?.role ?? "user"}
              </p>
            </div>
          </div>

          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-950 text-sm font-semibold text-white shadow-sm sm:hidden">
            {initials}
          </div>
        </div>
      </div>
    </nav>
  );
}
