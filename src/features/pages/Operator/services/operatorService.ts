import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";
import type { RouteStopPoint } from "@/features/shared/utils/tripSchedulePreview";

export const operatorService = {

  async getVehicles() {

    const res = await api.get("/operators/vehicles");

    return extractApiData(res.data);

  },

  async getSchedulingVehicles() {

    const res = await api.get("/vehicles");
    const vehicles = extractApiData<any[]>(res.data) ?? [];

    return vehicles.map((vehicle) => ({
      capacity: vehicle.capacity,
      driver: vehicle.driver ?? null,
      driver_id: vehicle.driver_id ?? null,
      id: vehicle.id,
      model: vehicle.model ?? null,
      plate_number: vehicle.plate_number,
      status: vehicle.status,
    }));

  },

  async addVehicle(data: {
    plate_number: string;
    model?: string;
    capacity: number;
  }) {

    const res = await api.post("/vehicles", data);

    return extractApiData(res.data);

  },

  async updateVehicle(id: string, data: any) {

    const res = await api.put(`/vehicles/${id}`, data);

    return extractApiData(res.data);

  },

  async deleteVehicle(id: string) {

    const res = await api.delete(`/vehicles/${id}`);

    return extractApiData(res.data);

  },

  async getDrivers() {

    const res = await api.get("/operators/drivers");

    return extractApiData(res.data);

  },

  async getRoutes() {

    const res = await api.get("/routes");

    return extractApiData<any[]>(res.data) ?? [];

  },

  async getRouteStops(routeId: string) {

    const res = await api.get(`/stops/route/${routeId}`);

    return extractApiData<RouteStopPoint[]>(res.data) ?? [];

  },

  async getActiveTrips() {

    const res = await api.get("/trips/active");

    return extractApiData<any[]>(res.data) ?? [];

  },

  async scheduleTrip(payload: {
    route_id: string;
    scheduled_departure_time: string;
    trip_date: string;
    vehicle_id: string;
  }) {

    const res = await api.post("/trips/schedule", payload);

    return extractApiData(res.data);

  },

  async addDriver(data: {
    first_name: string;
    last_name: string;
    contact_number: string;
    license_number: string;
    email: string;
    password: string;
  }) {

    const res = await api.post("/drivers", data);

    return extractApiData(res.data);

  },

  async updateDriver(id: string, data: any) {

    const res = await api.put(`/drivers/${id}`, data);

    return extractApiData(res.data);

  },

  async deleteDriver(id: string) {

    const res = await api.delete(`/drivers/${id}`);

    return extractApiData(res.data);

  },

  async assignDriver(vehicle_id: string, driver_id: string) {

    const res = await api.post("/operators/assign-driver", {
      vehicle_id,
      driver_id,
    });

    return extractApiData(res.data);

  },

  async getFleetSummary() {

    const res = await api.get("/operators/dashboard/fleet-summary");

    return extractApiData(res.data);

  },

  async getJeepneys() {

    const res = await api.get("/operators/dashboard/jeepneys");

    return extractApiData(res.data);

  },

  async getStopPopularity() {

    const res = await api.get("/operators/dashboard/stop-popularity");

    return extractApiData(res.data);

  },

  async getLoadSummary() {

    const res = await api.get("/operators/dashboard/load-summary");

    return extractApiData(res.data);

  },

  async getActiveStops() {

    const res = await api.get("/operators/dashboard/active-stops");

    return extractApiData(res.data);

  },

  async getOverallSummary() {

    const res = await api.get("/operators/dashboard/overall");

    return extractApiData(res.data);

  },

  async getVehicleLocations() {

    const res = await api.get("/operators/vehicle-locations");

    return extractApiData(res.data);

  },

};
