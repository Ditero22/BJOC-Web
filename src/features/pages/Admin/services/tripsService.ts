import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";

export const tripsService = {

  async getActiveTrips() {

    const res = await api.get("/trips/active");

    return extractApiData<any[]>(res.data) ?? [];

  },

  async getTripHistory() {

    const res = await api.get("/trips/history");

    return extractApiData<any[]>(res.data) ?? [];

  },

  async scheduleTrip(payload: {
    vehicle_id: string;
    route_id: string;
    trip_date: string;
    scheduled_departure_time: string;
  }) {

    const res = await api.post("/trips/schedule", payload);

    return extractApiData(res.data);

  },

  async startTrip(id: string) {

    const res = await api.patch(`/trips/${id}/start`);

    return extractApiData(res.data);

  },

  async endTrip(
    id: string,
    payload: {
      passenger_count: number;
    },
  ) {

    const res = await api.patch(`/trips/${id}/end`, payload);

    return extractApiData(res.data);

  },

  async cancelTrip(id: string) {

    const res = await api.patch(`/trips/${id}/cancel`);

    return extractApiData(res.data);

  },

  async rescheduleTrip(
    id: string,
    payload: { scheduled_departure_time: string }
  ) {

    const res = await api.patch(`/trips/${id}/reschedule`, payload);

    return extractApiData(res.data);

  }

};
