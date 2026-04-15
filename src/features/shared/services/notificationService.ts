import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";
import type { Notification } from "@/features/types/notification";

interface NotificationQuery {
  limit?: number;
  page?: number;
  severity?: "critical" | "info" | "success" | "warning";
  type?: string;
}

interface NotificationPageMeta {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export const notificationService = {

  async getNotifications(role: string, query?: NotificationQuery) {

    const res = await api.get("/notifications", {
      params: {
        role,
        ...query,
      },
    });

    return extractApiData<Notification[]>(res.data) ?? [];

  },

  async getNotificationsPage(role: string, query?: NotificationQuery) {

    const res = await api.get("/notifications", {
      params: {
        role,
        ...query,
      },
    });

    return {
      items: extractApiData<Notification[]>(res.data) ?? [],
      meta: (res.data?.meta ?? {
        limit: query?.limit ?? 20,
        page: query?.page ?? 1,
        total: 0,
        total_pages: 1,
      }) as NotificationPageMeta,
    };

  },

  async markRead(id: string) {

    const res = await api.patch(`/notifications/${id}/read`);

    return extractApiData(res.data);

  },

  async markAllRead(role: string) {

    const res = await api.patch("/notifications/read-all", { role });

    return extractApiData(res.data);

  }

};
