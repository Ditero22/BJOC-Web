import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";

export type OperatorRoute = {
  id: string;
  route_name: string;
  start_location?: string;
  end_location?: string;
};

export type OperatorStop = {
  id: string;
  route_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
};

export const getRoutes = async () => {

  const res = await api.get("/routes");

  return extractApiData<OperatorRoute[]>(res.data) ?? [];

};

export const getStops = async (routeId: string) => {

  const res = await api.get(`/stops/route/${routeId}`);

  return extractApiData<OperatorStop[]>(res.data) ?? [];

};

export const addStop = async (stop: {
  route_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
}) => {

  const res = await api.post("/stops", stop);

  return extractApiData(res.data);

};

export const updateStop = async (
  id: string,
  stop: {
    stop_name: string;
    latitude: number;
    longitude: number;
  }
) => {

  const res = await api.patch(`/stops/${id}`, stop);

  return extractApiData(res.data);

};

export const deleteStop = async (id: string) => {

  const res = await api.delete(`/stops/${id}`);

  return extractApiData(res.data);

};
