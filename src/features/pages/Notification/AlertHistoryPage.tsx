import { useEffect, useState } from "react";
import { useAuthSession } from "@/features/pages/auth";
import { notificationService } from "@/features/shared/services/notificationService";
import type { Notification } from "@/features/types/notification";

type AlertTab = "all_alerts" | "emergency";

const PAGE_SIZE = 20;

export function AlertHistoryPage() {
  const { user } = useAuthSession();
  const [activeTab, setActiveTab] = useState<AlertTab>("all_alerts");
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      if (!user) {
        return;
      }

      const query = activeTab === "emergency"
        ? { limit: PAGE_SIZE, page: currentPage, type: "emergency" }
        : { limit: PAGE_SIZE, page: currentPage };

      const result = await notificationService.getNotificationsPage(user.role, query);

      const filteredItems = activeTab === "emergency"
        ? result.items
        : result.items.filter(
            (notification) =>
              notification.severity === "warning" ||
              notification.severity === "critical",
          );

      setAlerts(filteredItems);
      setTotalPages(Math.max(1, result.meta.total_pages ?? 1));
    }

    void load();
  }, [activeTab, currentPage, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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

  const hasUnread = alerts.some((a) => !a.is_read);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Alert History</h1>
          {hasUnread && (
            <button
              onClick={() => void handleMarkAllRead()}
              className="rounded-md border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${activeTab === "all_alerts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            onClick={() => setActiveTab("all_alerts")}
          >
            Alerts
          </button>
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${activeTab === "emergency" ? "bg-white text-red-600 shadow-sm" : "text-slate-600"}`}
            onClick={() => setActiveTab("emergency")}
          >
            Emergency
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        {alerts.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No alerts found for this view.</div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-b p-4 last:border-none ${!alert.is_read ? "border-l-4 border-l-red-400" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-red-600">{alert.title}</p>
                <div className="flex items-center gap-3">
                  {!alert.is_read && (
                    <button
                      onClick={() => void handleMarkRead(alert.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="mt-1 text-sm text-gray-500">{alert.message}</p>
            </div>
          ))
        )}
      </div>

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
