import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";

export type Route = {
  id: string;
  route_name: string;
  start_location?: string;
  end_location?: string;
  start_lat?: number;
  start_lng?: number;
};

export const routesService = {

  async getRoutes(): Promise<Route[]> {

    const res = await api.get("/routes");

    return extractApiData<Route[]>(res.data) ?? [];

  },

  async updateRoute(
    id: string,
    data: {
      route_name?: string;
      start_location?: string;
      end_location?: string;
    }
  ): Promise<Route> {

    const res = await api.patch(`/routes/${id}`, data);

    return extractApiData<Route>(res.data);

  },

  async createRoute(data: {
    route_name: string;
    start_location?: string;
    end_location?: string;
  }): Promise<Route> {

    const res = await api.post("/routes", data);

    return extractApiData<Route>(res.data);

  },

  async deleteRoute(id: string): Promise<{ success: boolean }> {

    const res = await api.delete(`/routes/${id}`);

    return extractApiData<{ success: boolean }>(res.data);

  },

  async publishRoute(id: string): Promise<{ success: boolean; published_version: number }> {

    const res = await api.post(`/routes/${id}/publish`);

    return extractApiData<{ success: boolean; published_version: number }>(res.data);

  }

};
