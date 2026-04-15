import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";

export type TripHistoryParams = {
  startDate?: string;
  endDate?: string;
  search?: string;
};

export const reportsService = {

  async getTrips(params?: TripHistoryParams) {

    const query = new URLSearchParams();

    if (params?.startDate) {
      query.append("startDate", params.startDate);
    }

    if (params?.endDate) {
      query.append("endDate", params.endDate);
    }

    if (params?.search) {
      query.append("search", params.search);
    }

    const res = await api.get(`/admin/reports/trips?${query.toString()}`);

    return extractApiData(res.data);

  },

  async getPassengerVolume(startDate?: string, endDate?: string) {

    const query = new URLSearchParams();

    if (startDate) {
      query.append("startDate", startDate);
    }

    if (endDate) {
      query.append("endDate", endDate);
    }

    const res = await api.get(`/admin/reports/passenger-volume?${query.toString()}`);

    return extractApiData(res.data);

  },

  async getPeakHours(startDate?: string, endDate?: string) {

    const query = new URLSearchParams();

    if (startDate) {
      query.append("startDate", startDate);
    }

    if (endDate) {
      query.append("endDate", endDate);
    }

    const res = await api.get(`/admin/reports/peak-hours?${query.toString()}`);

    return extractApiData(res.data);

  },

  async getPassengerTrend(startDate?: string, endDate?: string) {

    const query = new URLSearchParams();

    if (startDate) {
      query.append("startDate", startDate);
    }

    if (endDate) {
      query.append("endDate", endDate);
    }

    const res = await api.get(`/admin/reports/daily-trend?${query.toString()}`);

    return extractApiData(res.data);

  },

  async getDriverReport(startDate?: string, endDate?: string, search?: string) {

    const query = new URLSearchParams();

    if (startDate) {
      query.append("startDate", startDate);
    }

    if (endDate) {
      query.append("endDate", endDate);
    }

    if (search) {
      query.append("search", search);
    }

    const res = await api.get(`/admin/reports/drivers?${query.toString()}`);

    return extractApiData(res.data);

  }

};
