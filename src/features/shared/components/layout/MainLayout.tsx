import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/features/shared/components/layout/Sidebar";
import { usePageTitle } from "@/features/shared/hooks";
import { LoadingProvider } from "@/features/shared/context/LoadingContext";
import Navbar from "@/features/shared/components/layout/Navbar";
import { useAuthSession } from "@/features/pages/auth";
import { AuthSkeleton } from "@/features/pages/auth/pages";

export default function MainLayout() {
  const location = useLocation();
  const { user, isBootstrapping } = useAuthSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let title = "BJOC System";

  if (location.pathname.startsWith("/admin")) {
    title = "Admin";
  } else if (location.pathname.startsWith("/staff")) {
    title = "Staff";
  }

  usePageTitle(title);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (isBootstrapping) {
    return <AuthSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <LoadingProvider>
      <div className="min-h-screen bg-slate-100">
        <div className="flex min-h-screen w-full">
          <Sidebar
            onClose={() => setSidebarOpen(false)}
            open={sidebarOpen}
            role={user.role}
          />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Navbar
              onMenuToggle={() => setSidebarOpen((current) => !current)}
              sidebarOpen={sidebarOpen}
            />

            <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(16,64,39,0.08),_transparent_55%),linear-gradient(to_bottom,_#f8fafc,_#eef3f0)] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
              <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </LoadingProvider>
  );
}
