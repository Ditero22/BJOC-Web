import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";

export const vehicleService = {

  async getVehicles() {

    const res = await api.get("/vehicles");
    const vehicles = extractApiData<any[]>(res.data) ?? [];

    return vehicles.map((vehicle) => ({
      id: vehicle.id,
      plate_number: vehicle.plate_number,
      model: vehicle.model,
      capacity: vehicle.capacity,
      driver_id: vehicle.driver_id ?? null,
      driver: vehicle.driver ?? null,
      status: vehicle.status,
    }));

  },

  async createVehicle(data: {
    plate_number: string;
    model: string;
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

  async getVehicleLocations() {

    const res = await api.get("/vehicles/vehicle-locations");

    return extractApiData<any[]>(res.data) ?? [];

  }

};
