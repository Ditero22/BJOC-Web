import { useEffect, useState } from "react";
import { useAuthSession } from "@/features/pages/auth";
import { notificationService } from "@/features/shared/services/notificationService";
import { groupNotifications } from "@/lib/groupNotifications";
import type { Notification } from "@/features/types/notification";

const PAGE_SIZE = 20;

export function NotificationHistoryPage() {
  const { user } = useAuthSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      if (!user) {
        return;
      }

      const result = await notificationService.getNotificationsPage(user.role, {
        limit: PAGE_SIZE,
        page: currentPage,
      });

      setNotifications(Array.isArray(result.items) ? result.items : []);
      setTotalPages(Math.max(1, result.meta.total_pages ?? 1));
    }

    void load();
  }, [currentPage, user]);

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

  const grouped = groupNotifications(notifications);
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Notification History</h1>
        {hasUnread && (
          <button
            onClick={() => void handleMarkAllRead()}
            className="rounded-md border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {Object.entries(grouped).length === 0 ? (
        <div className="rounded-lg border bg-white p-4 text-sm text-gray-500">
          No notifications found.
        </div>
      ) : (
        Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="mb-6">
            <div className="mb-2 text-sm font-semibold text-gray-500">{label}</div>

            <div className="rounded-lg border bg-white">
              {items.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b p-4 last:border-none ${!notification.is_read ? "border-l-4 border-l-blue-400" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{notification.title}</p>
                    <div className="flex items-center gap-3">
                      {!notification.is_read && (
                        <button
                          onClick={() => void handleMarkRead(notification.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">{notification.message}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        >
          Previous
        </button>

        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
