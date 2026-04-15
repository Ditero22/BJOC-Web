import { useEffect, useEffectEvent, useMemo, useState, type ReactNode } from "react";
import { MapPin, Route, Star, Truck, Users } from "lucide-react";

import { useLoading } from "@/features/shared/context/LoadingContext";
import SharedMap from "@/features/shared/components/layout/SharedMap";
import { PassengerWaitingTrend } from "./modal/PassengerWaitingTrend";
import { adminService } from "./services/adminService";
import type {
  AdminDashboardSummary,
  AdminVehicleStatus,
  AppRatingSummary,
  DashboardFilter,
  DriverPerformanceItem,
  MapVehicle,
  SuggestionItem,
} from "@/features/types/operations";

const EMPTY_SUMMARY: AdminDashboardSummary = {
  trips: 0,
  passengers: 0,
  waitingStops: 0,
  activeVehicles: 0,
};

const EMPTY_RATING: AppRatingSummary = {
  average: 0,
  total: 0,
};

export function AdminDashboard() {
  const { showLoading, hideLoading } = useLoading();

  const [summary, setSummary] = useState<AdminDashboardSummary>(EMPTY_SUMMARY);
  const [vehicleStatus, setVehicleStatus] = useState<AdminVehicleStatus[]>([]);
  const [driverPerformance, setDriverPerformance] = useState<DriverPerformanceItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [appRating, setAppRating] = useState<AppRatingSummary>(EMPTY_RATING);
  const [filter, setFilter] = useState<DashboardFilter>("today");

  const refreshLiveData = useEffectEvent(async () => {
    try {
      const summaryData = await adminService.getDashboardSummary(filter);
      const vehicleData = await adminService.getVehicleStatus();
      const driverData = await adminService.getDriverPerformance(filter);
      const suggestionData = await adminService.getSuggestions(filter);
      const ratingData = await adminService.getAppRatings(filter);

      setSummary(summaryData ?? EMPTY_SUMMARY);
      setVehicleStatus(vehicleData ?? []);
      setDriverPerformance(driverData ?? []);
      setSuggestions(suggestionData ?? []);
      setAppRating(ratingData ?? EMPTY_RATING);
    } catch (error) {
      console.error("Live refresh error", error);
    }
  });

  const loadInitialData = useEffectEvent(async () => {
    showLoading();

    try {
      await refreshLiveData();
    } catch (error) {
      console.error("Dashboard load error", error);
    } finally {
      hideLoading();
    }
  });

  useEffect(() => {
    void loadInitialData();

    const interval = window.setInterval(() => {
      void refreshLiveData();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [filter]);

  const mapVehicles = useMemo<MapVehicle[]>(() => {
    return vehicleStatus
      .filter((vehicle) => vehicle.status === "on_trip" || vehicle.status === "pending")
      .map((vehicle) => ({
        vehicle_id: vehicle.vehicle_id ?? "",
        latitude: vehicle.latitude ?? 14.440677,
        longitude: vehicle.longitude ?? 120.960164,
        plate_number: vehicle.plate_number ?? "Unknown",
        driver_name: vehicle.driver_name ?? "No Driver",
        status: vehicle.status,
      }));
  }, [vehicleStatus]);

  const starSummary = useMemo(() => {
    const stars = Math.max(0, Math.min(5, Math.round(appRating.average || 0)));

    return {
      empty: "\u2606".repeat(5 - stars),
      filled: "\u2605".repeat(stars),
    };
  }, [appRating.average]);

  const fleetSummary = useMemo(() => {
    return {
      onTrip: vehicleStatus.filter((vehicle) => vehicle.status === "on_trip").length,
      pending: vehicleStatus.filter((vehicle) => vehicle.status === "pending").length,
      standby: vehicleStatus.filter((vehicle) => vehicle.status === "standby").length,
    };
  }, [vehicleStatus]);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/60">
              Admin Command Center
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Fleet Operations Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Track live jeepney movement, passenger demand, and service quality from one responsive
              operational view.
            </p>
          </div>

          <label className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 sm:w-auto">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Reporting Window
            </span>
            <select
              className="mt-2 w-full bg-transparent text-sm font-medium text-slate-700 outline-none sm:min-w-[180px]"
              onChange={(event) => setFilter(event.target.value as DashboardFilter)}
              value={filter}
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </label>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            accentClass="bg-emerald-100 text-emerald-700"
            icon={<Route size={18} />}
            label="Trips"
            note="Trips in selected window"
            value={summary.trips}
          />
          <SummaryCard
            accentClass="bg-sky-100 text-sky-700"
            icon={<Users size={18} />}
            label="Passengers"
            note="Total riders served"
            value={summary.passengers}
          />
          <SummaryCard
            accentClass="bg-amber-100 text-amber-700"
            icon={<MapPin size={18} />}
            label="Waiting Stops"
            note="Stops with passenger queues"
            value={summary.waitingStops}
          />
          <SummaryCard
            accentClass="bg-violet-100 text-violet-700"
            icon={<Truck size={18} />}
            label="Active Vehicles"
            note="Fleet currently in motion"
            value={summary.activeVehicles}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Live Vehicle Location</h2>
              <p className="text-sm text-slate-500">
                Real-time view of active or soon-to-dispatch vehicles.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {mapVehicles.length} tracked vehicle{mapVehicles.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="h-[320px] overflow-hidden rounded-[22px] border border-slate-200 sm:h-[420px]">
            <SharedMap
              bearing={100}
              initialCenter={{
                latitude: mapVehicles[0]?.latitude ?? 14.440677,
                longitude: mapVehicles[0]?.longitude ?? 120.960164,
              }}
              initialZoom={11.5}
              stops={[]}
              vehicles={mapVehicles}
            />
          </div>

          {mapVehicles.length === 0 && (
            <p className="mt-3 text-center text-sm text-slate-400">
              No active vehicles are available for live tracking right now.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Service Rating
                </p>
                <h2 className="mt-2 text-base font-semibold text-slate-900">Passenger Feedback</h2>
              </div>

              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Star size={18} />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-3xl font-semibold text-slate-900">{appRating.average.toFixed(1)}</p>
              <p className="mt-1 text-sm text-slate-500">{appRating.total} total reviews</p>
              <div className="mt-3 text-xl tracking-[0.18em] text-amber-500">
                {starSummary.filled}
                {starSummary.empty}
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Fleet Pulse
                </p>
                <h2 className="mt-2 text-base font-semibold text-slate-900">Vehicle Status Mix</h2>
              </div>

              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Truck size={18} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <MiniMetric label="On trip" value={fleetSummary.onTrip} />
              <MiniMetric label="Scheduled" value={fleetSummary.pending} />
              <MiniMetric label="Standby" value={fleetSummary.standby} />
            </div>
          </section>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <PassengerWaitingTrend />

        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Active Vehicles</h2>
              <p className="text-sm text-slate-500">
                Driver assignments and availability at a glance.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {vehicleStatus.length} in fleet
            </span>
          </div>

          {vehicleStatus.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
              No vehicles found for this dashboard snapshot.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {vehicleStatus.map((vehicle) => (
                <VehicleCard key={vehicle.vehicle_id ?? vehicle.plate_number} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Driver Performance</h2>
            <p className="text-sm text-slate-500">
              Top-level performance trends for the selected period.
            </p>
          </div>

          <div className="space-y-3">
            {driverPerformance.length > 0 ? (
              driverPerformance.map((driver, index) => (
                <DriverRating
                  key={`${driver.driver_id ?? driver.driver ?? "driver"}-${index}`}
                  driver={driver}
                />
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                No driver performance data is available.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Latest Suggestions</h2>
            <p className="text-sm text-slate-500">
              Passenger-submitted ideas and complaints from the current window.
            </p>
          </div>

          {suggestions.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
              No passenger suggestions for this filter.
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <article
                  key={`${suggestion.id ?? "suggestion"}-${index}`}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700"
                >
                  {suggestion.message}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type SummaryCardProps = {
  accentClass: string;
  icon: ReactNode;
  label: string;
  note: string;
  value: number;
};

function SummaryCard({ accentClass, icon, label, note, value }: SummaryCardProps) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{note}</p>
        </div>

        <div className={`rounded-2xl p-3 ${accentClass}`}>{icon}</div>
      </div>
    </div>
  );
}

type MiniMetricProps = {
  label: string;
  value: number;
};

function MiniMetric({ label, value }: MiniMetricProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-lg font-semibold text-slate-900">{value}</span>
    </div>
  );
}

type VehicleCardProps = {
  vehicle: AdminVehicleStatus;
};

function VehicleCard({ vehicle }: VehicleCardProps) {
  const badgeClass =
    vehicle.status === "on_trip"
      ? "bg-emerald-100 text-emerald-700"
      : vehicle.status === "pending"
      ? "bg-sky-100 text-sky-700"
      : vehicle.status === "standby"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-200 text-slate-600";

  return (
    <article className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {vehicle.plate_number ?? "Vehicle"}
          </h3>
          <p className="mt-1 truncate text-sm text-slate-500">
            Driver: {vehicle.driver_name ?? "No Driver"}
          </p>
        </div>

        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${badgeClass}`}>
          {vehicle.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <VehicleMeta label="Latitude" value={formatCoordinate(vehicle.latitude)} />
        <VehicleMeta label="Longitude" value={formatCoordinate(vehicle.longitude)} />
      </dl>
    </article>
  );
}

type VehicleMetaProps = {
  label: string;
  value: string;
};

function VehicleMeta({ label, value }: VehicleMetaProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function formatCoordinate(value?: number | null) {
  return typeof value === "number" ? value.toFixed(5) : "-";
}

type DriverRatingProps = {
  driver: DriverPerformanceItem;
};

function DriverRating({ driver }: DriverRatingProps) {
  const rating = Math.max(0, Math.min(5, driver.rating ?? 0));
  const progress = `${(rating / 5) * 100}%`;

  return (
    <article className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {driver.driver || driver.driver_id || "Unknown Driver"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{driver.trips ?? 0} trips handled</p>
        </div>

        <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
          {(driver.rating ?? 0).toFixed(1)} / 5
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Driver rating</span>
          <span>{"\u2605".repeat(Math.round(rating))}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-emerald-600" style={{ width: progress }} />
        </div>
      </div>
    </article>
  );
}
