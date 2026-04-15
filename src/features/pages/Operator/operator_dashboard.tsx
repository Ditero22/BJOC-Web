import { useEffect, useEffectEvent, useMemo, useState, type ReactNode } from "react";
import { Bus, Gauge, MapPinned, Route, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SharedMap from "@/features/shared/components/layout/SharedMap";
import { operatorService } from "./services/operatorService";
import type {
  MapVehicle,
  OperatorActiveStop,
  OperatorFleetSummary,
  OperatorJeepneyRow,
  OperatorLoadStat,
  OperatorOverallSummary,
  OperatorStopStat,
} from "@/features/types/operations";

const COLORS = ["#14532d", "#0f766e", "#2563eb", "#f59e0b"];

const EMPTY_FLEET: OperatorFleetSummary = {
  active: 0,
  offline: 0,
  standby: 0,
  total: 0,
};

const EMPTY_OVERALL: OperatorOverallSummary = {
  avg_load: 0,
  passengers_today: 0,
  top_route: "-",
  trips_today: 0,
};

export function OperatorDashboard() {
  const [vehicles, setVehicles] = useState<OperatorJeepneyRow[]>([]);
  const [vehicleLocations, setVehicleLocations] = useState<MapVehicle[]>([]);
  const [fleetSummary, setFleetSummary] = useState<OperatorFleetSummary>(EMPTY_FLEET);
  const [stopStats, setStopStats] = useState<OperatorStopStat[]>([]);
  const [loadSummary, setLoadSummary] = useState<OperatorLoadStat[]>([]);
  const [activeStops, setActiveStops] = useState<OperatorActiveStop[]>([]);
  const [overall, setOverall] = useState<OperatorOverallSummary>(EMPTY_OVERALL);

  const defaultCenter = {
    latitude: 14.438853366233266,
    longitude: 120.9607039176618,
  };

  const loadVehicleLocations = useEffectEvent(async () => {
    try {
      const locations = await operatorService.getVehicleLocations();
      setVehicleLocations(locations ?? []);
    } catch (error) {
      console.error("Vehicle location load error:", error);
    }
  });

  const loadData = useEffectEvent(async () => {
    try {
      const fleet = await operatorService.getFleetSummary();
      const jeepneys = await operatorService.getJeepneys();
      const stops = await operatorService.getStopPopularity();
      const loads = await operatorService.getLoadSummary();
      const active = await operatorService.getActiveStops();
      const overallSummary = await operatorService.getOverallSummary();

      setFleetSummary(fleet ?? EMPTY_FLEET);
      setVehicles(jeepneys ?? []);
      setStopStats(stops ?? []);
      setLoadSummary(loads ?? []);
      setActiveStops(active ?? []);
      setOverall(overallSummary ?? EMPTY_OVERALL);

      await loadVehicleLocations();
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  });

  useEffect(() => {
    void loadData();

    const interval = window.setInterval(() => {
      void loadVehicleLocations();
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const fleetCards = useMemo(
    () => [
      {
        accentClass: "bg-emerald-100 text-emerald-700",
        icon: <Route size={18} />,
        label: "Trips Today",
        note: "Completed and active trips",
        value: overall.trips_today,
      },
      {
        accentClass: "bg-sky-100 text-sky-700",
        icon: <Users size={18} />,
        label: "Passengers Today",
        note: "Riders served today",
        value: overall.passengers_today,
      },
      {
        accentClass: "bg-amber-100 text-amber-700",
        icon: <Gauge size={18} />,
        label: "Average Load",
        note: "Fleet occupancy rate",
        value: `${overall.avg_load}%`,
      },
      {
        accentClass: "bg-violet-100 text-violet-700",
        icon: <MapPinned size={18} />,
        label: "Top Route",
        note: "Most active route today",
        value: overall.top_route,
      },
    ],
    [overall],
  );

  const statusStats = useMemo(
    () => [
      { label: "Total Vehicles", value: fleetSummary.total },
      { label: "Active", value: fleetSummary.active },
      { label: "Standby", value: fleetSummary.standby },
      { label: "Offline", value: fleetSummary.offline },
    ],
    [fleetSummary],
  );

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/60">
              Staff Control Center
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Fleet Monitoring Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Monitor active routes, vehicle availability, load trends, and stop demand from one
              responsive staff workspace.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">{vehicleLocations.length}</span> live
            tracked vehicle{vehicleLocations.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {fleetCards.map((card) => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Fleet Overview Map</h2>
              <p className="text-sm text-slate-500">
                Real-time vehicle positions across the service area.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {fleetSummary.active} active now
            </span>
          </div>

          <div className="h-[320px] overflow-hidden rounded-[22px] border border-slate-200 sm:h-[420px]">
            <SharedMap
              bearing={100}
              initialCenter={defaultCenter}
              initialZoom={11.5}
              vehicles={vehicleLocations}
            />
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Fleet Readiness
              </p>
              <h2 className="mt-2 text-base font-semibold text-slate-900">Vehicle Status Mix</h2>
            </div>

            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <Bus size={18} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {statusStats.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-lg font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-slate-900">Live Jeepney Board</h2>
          <p className="text-sm text-slate-500">
            Current driver assignments, route progress, and latest ETA snapshots.
          </p>
        </div>

        <div className="md:hidden">
          {vehicles.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No jeepney data available.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {vehicles.map((vehicle, index) => (
                <article
                  key={`${vehicle.id ?? vehicle.plate ?? "vehicle"}-${index}`}
                  className="space-y-4 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{vehicle.plate ?? "-"}</h3>
                      <p className="mt-1 text-sm text-slate-500">{vehicle.driver ?? "No driver assigned"}</p>
                    </div>
                    <StatusPill isOnline={vehicle.is_online} label={vehicle.status ?? "Unknown"} />
                  </div>

                  <dl className="grid grid-cols-2 gap-3">
                    <Metric label="Route" value={vehicle.route ?? "-"} />
                    <Metric label="Load" value={`${vehicle.load ?? 0}%`} />
                    <Metric label="ETA" value={vehicle.eta ?? "-"} />
                    <Metric label="State" value={vehicle.status ?? "-"} />
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-emerald-950 text-left text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Plate</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Load</th>
                <th className="px-4 py-3 font-medium">ETA</th>
                <th className="px-4 py-3 font-medium">State</th>
              </tr>
            </thead>

            <tbody>
              {vehicles.map((vehicle, index) => (
                <tr
                  key={`${vehicle.id ?? vehicle.plate ?? "vehicle"}-${index}`}
                  className="border-b border-slate-100"
                >
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${
                        vehicle.is_online ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900">{vehicle.plate ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-600">{vehicle.driver ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-600">{vehicle.route ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-600">{vehicle.load ?? 0}%</td>
                  <td className="px-4 py-4 text-slate-600">{vehicle.eta ?? "-"}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {vehicle.status ?? "-"}
                    </span>
                  </td>
                </tr>
              ))}

              {vehicles.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={7}>
                    No jeepney data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Passenger Selected Stops</h2>
            <p className="text-sm text-slate-500">
              Where demand is concentrating right now.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1fr)]">
            <div className="mx-auto h-[240px] w-full max-w-[260px]">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    data={stopStats}
                    dataKey="percentage"
                    innerRadius={60}
                    nameKey="stop"
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {stopStats.map((stop, index) => (
                      <Cell key={`${stop.stop}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {stopStats.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                  No stop popularity data available.
                </div>
              ) : (
                stopStats.map((stop, index) => (
                  <div key={`${stop.stop}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-700">{stop.stop}</span>
                      <span className="text-sm font-semibold text-slate-900">{stop.percentage}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                          width: `${Math.max(0, Math.min(100, stop.percentage))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Load Summary</h2>
            <p className="text-sm text-slate-500">
              Daily and monthly load snapshots for staff operations.
            </p>
          </div>

          <div className="h-[260px] sm:h-[300px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={loadSummary}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar barSize={22} dataKey="load" fill="#14532d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Active Stops</h2>
            <p className="text-sm text-slate-500">
              Current waiting passenger counts by stop.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {activeStops.length} stop{activeStops.length !== 1 ? "s" : ""}
          </span>
        </div>

        {activeStops.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
            No active stop data available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeStops.map((stop, index) => (
              <div
                key={`${stop.stop}-${index}`}
                className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-4"
              >
                <span className="text-sm text-slate-700">{stop.stop}</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm">
                  {stop.waiting}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type SummaryCardProps = {
  accentClass: string;
  icon: ReactNode;
  label: string;
  note: string;
  value: number | string;
};

function SummaryCard({ accentClass, icon, label, note, value }: SummaryCardProps) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value ?? "-"}</p>
          <p className="mt-2 text-xs text-slate-400">{note}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accentClass}`}>{icon}</div>
      </div>
    </div>
  );
}

type StatusPillProps = {
  isOnline?: boolean | null;
  label: string;
};

function StatusPill({ isOnline, label }: StatusPillProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
      }`}
    >
      {label}
    </span>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}
