import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";
import type { RouteStopPoint } from "@/features/shared/utils/tripSchedulePreview";

export const stopsService = {

  async getStopsByRoute(routeId: string) {

    const res = await api.get(`/stops/route/${routeId}`);

    return extractApiData<RouteStopPoint[]>(res.data) ?? [];

  },

  async createStop(data: {
    route_id: string;
    stop_name: string;
    latitude: number;
    longitude: number;
    stop_order?: number;
  }) {

    const res = await api.post("/stops", data);

    return extractApiData(res.data);

  },

  async updateStop(id: string, data: any) {

    const res = await api.patch(`/stops/${id}`, data);

    return extractApiData(res.data);

  },

  async deleteStop(id: string) {

    const res = await api.delete(`/stops/${id}`);

    return extractApiData(res.data);

  },

  async toggleStopStatus(id: string, is_active: boolean) {

    const res = await api.patch(`/stops/${id}/status`, { is_active });

    return extractApiData(res.data);

  },

  async updateStopOrder(
    routeId: string,
    stops: { id: string; stop_order: number }[]
  ) {

    const res = await api.put(`/stops/route/${routeId}/order`, stops);

    return extractApiData(res.data);

  }

};
