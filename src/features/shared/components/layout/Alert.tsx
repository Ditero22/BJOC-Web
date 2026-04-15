import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/features/pages/auth";
import { notificationService } from "@/features/shared/services/notificationService";

interface AlertItem {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  severity?: string;
}

export default function Alert({ disabled = false }: { disabled?: boolean }) {
  const { user } = useAuthSession();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [open, setOpen] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  const alertCount = alerts.filter((alert) => !alert.is_read).length;

  useEffect(() => {
    async function loadAlerts() {
      if (!user) {
        return;
      }

      try {
        const data = await notificationService.getNotifications(user.role);
        const filtered = Array.isArray(data)
          ? data.filter((notification) => notification.severity === "warning" || notification.severity === "critical")
          : [];

        setAlerts(filtered);
      } catch (error) {
        console.error(error);
      }
    }

    void loadAlerts();
  }, [user]);

  async function handleMarkRead(id: string) {
    try {
      await notificationService.markRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleMarkAllRead() {
    if (!user) {
      return;
    }

    try {
      await notificationService.markAllRead(user.role);
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleAlert() {
    if (disabled) {
      return;
    }

    setOpen((current) => !current);
  }

  return (
    <div ref={alertRef} className={disabled ? "opacity-40 pointer-events-none" : ""}>
      <button
        onClick={toggleAlert}
        className="relative rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-800"
      >
        <AlertTriangle className="size-5 text-red-500" />

        {alertCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {alertCount > 99 ? "99+" : alertCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg border z-50 transition-opacity duration-150">
          <div className="p-3 border-b font-semibold text-red-600">Alerts</div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 && <div className="p-4 text-sm text-gray-500">No alerts</div>}

            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => void handleMarkRead(alert.id)}
                className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!alert.is_read ? "bg-red-50" : ""}`}
              >
                <div className="flex items-center gap-1.5">
                  {!alert.is_read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  )}
                  <p className="text-sm font-medium text-red-600">{alert.title}</p>
                </div>
                <p className="text-xs text-gray-500">{alert.message}</p>
              </div>
            ))}
          </div>

          <div className="p-3 border-t flex items-center justify-between gap-2">
            <button
              onClick={() => void handleMarkAllRead()}
              className="text-sm text-gray-500 hover:underline"
            >
              Mark all as read
            </button>
            <button
              onClick={() => {
                setOpen(false);
                if (user) {
                  navigate(`/${user.role}/alert`);
                }
              }}
              className="text-sm text-red-600 hover:underline"
            >
              View Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
