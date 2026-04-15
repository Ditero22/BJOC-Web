export type DashboardFilter =
  | "today"
  | "week"
  | "month";

export type MapVehicle = {
  vehicle_id: string;
  latitude: number;
  longitude: number;
  plate_number?: string | null;
  driver?: string | null;
  driver_name?: string | null;
  status?: string | null;
};

export type AdminDashboardSummary = {
  trips: number;
  passengers: number;
  waitingStops: number;
  activeVehicles: number;
};

export type AdminVehicleStatus = MapVehicle & {
  status: string;
};

export type DriverPerformanceItem = {
  driver?: string | null;
  driver_id?: string | null;
  trips?: number;
  rating?: number;
};

export type SuggestionItem = {
  id?: string;
  message: string;
};

export type AppRatingSummary = {
  average: number;
  total: number;
};

export type OperatorFleetSummary = {
  total: number;
  active: number;
  standby: number;
  offline: number;
};

export type OperatorJeepneyRow = {
  id?: string;
  plate?: string | null;
  driver?: string | null;
  route?: string | null;
  load?: number | null;
  eta?: string | null;
  status?: string | null;
  is_online?: boolean | null;
};

export type OperatorStopStat = {
  stop: string;
  percentage: number;
};

export type OperatorLoadStat = {
  date: string;
  load: number;
};

export type OperatorActiveStop = {
  stop: string;
  waiting: number;
};

export type OperatorOverallSummary = {
  trips_today: number;
  passengers_today: number;
  avg_load: number;
  top_route: string;
};

export type StopCoords = {
  latitude: number;
  longitude: number;
};

export type SystemMaintenanceSettings = {
  driver_tracking_distance_meters: number;
  driver_tracking_interval_seconds: number;
  off_route_alert_cooldown_seconds: number;
  off_route_threshold_meters: number;
  updated_at: string;
  updated_by_name?: string | null;
  updated_by_user_id?: string | null;
};

export type SystemMaintenanceSettingsInput = {
  driver_tracking_distance_meters: number;
  driver_tracking_interval_seconds: number;
  off_route_alert_cooldown_seconds: number;
  off_route_threshold_meters: number;
};
