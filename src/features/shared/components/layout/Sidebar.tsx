import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Car,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Route,
  Truck,
  Users,
  X,
  Navigation,
  SlidersHorizontal,
} from "lucide-react";
import type { Role } from "@/features/types/auth";
import { useAuthSession } from "@/features/pages/auth";

interface SidebarProps {
  onClose: () => void;
  open: boolean;
  role: Role;
}

type NavItem = {
  icon: ReactNode;
  label: string;
  path: string;
};

function buildNavItems(role: Role): NavItem[] {
  if (role === "admin") {
    return [
      { label: "Dashboard Overview", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Route & Stop Management", path: "/admin/routes-stops", icon: <Route size={18} /> },
      { label: "Driver & Vehicle Oversight", path: "/admin/drivers-vehicles", icon: <Truck size={18} /> },
      { label: "Trips / Operation", path: "/admin/trips", icon: <Navigation size={18} /> },
      { label: "Reports & History", path: "/admin/reports-history", icon: <BarChart3 size={18} /> },
      { label: "User Management", path: "/admin/users", icon: <Users size={18} /> },
      { label: "System Logs", path: "/admin/logs", icon: <FileText size={18} /> },
      { label: "System Settings", path: "/admin/settings", icon: <SlidersHorizontal size={18} /> },
    ];
  }

  return [
    { label: "Dashboard", path: "/staff/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Trip Scheduling", path: "/staff/trips", icon: <Navigation size={18} /> },
    { label: "Manage Drivers & Vehicles", path: "/staff/drivers-vehicles", icon: <Car size={18} /> },
    { label: "Manage Routes", path: "/staff/routes", icon: <Map size={18} /> },
    { label: "Reports & Analytics", path: "/staff/reports", icon: <BarChart3 size={18} /> },
    { label: "Notifications Management", path: "/staff/notifications", icon: <Bell size={18} /> },
  ];
}

export default function Sidebar({ onClose, open, role }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuthSession();
  const navItems = buildNavItems(role);
  const title = role === "admin" ? "BJOC Admin" : "BJOC Staff";
  const subtitle = role === "admin" ? "Operations control hub" : "Staff control hub";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    [
      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all",
      isActive
        ? "bg-white text-emerald-950 shadow-sm"
        : "text-emerald-50/90 hover:bg-white/10 hover:text-white",
    ].join(" ");

  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-1rem))] flex-col border-r border-emerald-900/60 bg-[linear-gradient(180deg,_#0e3a24_0%,_#0f4b2f_48%,_#0a2b1b_100%)] px-4 pb-4 pt-5 text-white shadow-2xl transition-transform duration-300 lg:static lg:w-[290px] lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-[105%]"
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-3 border-b border-white/10 pb-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
              BJOC Portal
            </p>
            <h2 className="mt-2 text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-emerald-100/70">{subtitle}</p>
          </div>

          <button
            aria-label="Close navigation"
            className="rounded-full border border-white/15 p-2 text-emerald-100 transition hover:bg-white/10 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {navItems.map((item) => (
            <NavLink key={item.path} onClick={onClose} to={item.path}>
              {({ isActive }) => (
                <div className={linkStyle({ isActive })}>
                  <span
                    className={`rounded-xl p-2 transition ${
                      isActive
                        ? "bg-emerald-950/10 text-emerald-800"
                        : "bg-white/10 text-emerald-100"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 truncate font-medium">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/10 hover:text-white"
            onClick={handleLogout}
            type="button"
          >
            <span className="rounded-xl bg-white/10 p-2">
              <LogOut size={18} />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
