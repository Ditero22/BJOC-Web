import { Bell } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/features/shared/services";
import { groupNotifications } from "@/features/shared/lib/groupNotifications";
import { useAuthSession } from "@/features/pages/auth";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell({ disabled = false }: { disabled?: boolean }) {
  const { user } = useAuthSession();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const grouped = groupNotifications(notifications);
  const unread = notifications.filter((notification) => !notification.is_read).length;

  useEffect(() => {
    async function loadNotifications() {
      if (!user) {
        return;
      }

      try {
        const data = await notificationService.getNotifications(user.role);
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      }
    }

    void loadNotifications();
  }, [user]);

  async function handleMarkRead(id: string) {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
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
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleBell() {
    if (disabled) {
      return;
    }

    setOpen((current) => !current);
  }

  return (
    <div ref={bellRef} className={disabled ? "opacity-40 pointer-events-none" : ""}>
      <button
        onClick={toggleBell}
        className="relative rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-800"
      >
        <Bell className="size-5 text-gray-700" />

        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg border z-50 transition-opacity duration-150">
          <div className="p-3 border-b font-semibold">Notifications</div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && <div className="p-4 text-sm text-gray-500">No notifications</div>}

            {Object.entries(grouped).map(([label, items]) => (
              <div key={label}>
                <div className="px-3 py-1 text-xs font-semibold text-gray-400">{label}</div>

                {items.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => void handleMarkRead(notification.id)}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.is_read ? "bg-blue-50" : ""}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {!notification.is_read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                      <p className="text-sm font-medium">{notification.title}</p>
                    </div>
                    <p className="text-xs text-gray-500">{notification.message}</p>
                  </div>
                ))}
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
                  navigate(`/${user.role}/notifications`);
                }
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
