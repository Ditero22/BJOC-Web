import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";
import type {
  SystemMaintenanceSettings,
  SystemMaintenanceSettingsInput,
} from "@/features/types/operations";

export const adminService = {

  async getDashboardSummary(filter?: string) {

    const res = await api.get("/admin/dashboard-summary", {
      params: { filter },
    });

    return extractApiData(res.data);

  },

  async getVehicleStatus() {

    const res = await api.get("/admin/vehicle-status");

    return extractApiData(res.data);

  },

  async getRoutes() {

    const res = await api.get("/admin/routes");

    return extractApiData(res.data);

  },

  async getWaitingStops(routeId: string, filter?: string) {

    const res = await api.get("/admin/waiting-stops", {
      params: {
        filter,
        routeId,
      },
    });

    return extractApiData(res.data);

  },

  async getDriverPerformance(filter?: string) {

    const res = await api.get("/admin/driver-performance", {
      params: { filter },
    });

    return extractApiData(res.data);

  },

  async getLatestAlerts() {

    const res = await api.get("/admin/alerts");

    return extractApiData(res.data);

  },

  async getLatestNotifications() {

    const res = await api.get("/admin/notifications");

    return extractApiData(res.data);

  },

  async getAppRatings(filter?: string) {

    const res = await api.get("/admin/app-ratings", {
      params: { filter },
    });

    return extractApiData(res.data);

  },

  async getSuggestions(filter?: string) {

    const res = await api.get("/admin/suggestions", {
      params: { filter },
    });

    return extractApiData(res.data);

  },

  async getLiveMap() {

    const res = await api.get("/admin/live-map");

    return extractApiData(res.data);

  },

  async getMaintenanceSettings() {

    const res = await api.get("/admin/settings/maintenance");

    return extractApiData<SystemMaintenanceSettings>(res.data);

  },

  async updateMaintenanceSettings(payload: SystemMaintenanceSettingsInput) {

    const res = await api.patch("/admin/settings/maintenance", payload);

    return extractApiData<SystemMaintenanceSettings>(res.data);

  },

};
