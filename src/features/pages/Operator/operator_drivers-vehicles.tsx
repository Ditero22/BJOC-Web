import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bus, Search, UserSquare2 } from "lucide-react";

import { operatorService } from "./services/operatorService";

type Vehicle = {
  driver_name?: string;
  id: string;
  load: number;
  plate_number: string;
  route?: string;
  status: "Driving" | "Standby" | "Offline";
  updated_at: string;
};

export default OperatorDriversVehicles;

export function OperatorDriversVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [routeFilter, setRouteFilter] = useState("All");

  async function loadVehicles() {
    const data = await operatorService.getVehicles();
    setVehicles(data ?? []);
  }

  useEffect(() => {
    void loadVehicles();
  }, []);

  const routeOptions = useMemo(() => {
    return Array.from(
      new Set(vehicles.map((vehicle) => vehicle.route).filter((route): route is string => Boolean(route))),
    );
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      return (
        (statusFilter === "All" || vehicle.status === statusFilter) &&
        (routeFilter === "All" || vehicle.route === routeFilter) &&
        (vehicle.plate_number.toLowerCase().includes(search.toLowerCase()) ||
          vehicle.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
          vehicle.id.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [routeFilter, search, statusFilter, vehicles]);

  const summary = useMemo(() => {
    return {
      driving: vehicles.filter((vehicle) => vehicle.status === "Driving").length,
      offline: vehicles.filter((vehicle) => vehicle.status === "Offline").length,
      standby: vehicles.filter((vehicle) => vehicle.status === "Standby").length,
      total: vehicles.length,
      withDriver: vehicles.filter((vehicle) => Boolean(vehicle.driver_name)).length,
    };
  }, [vehicles]);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700/60">
              Staff Fleet Directory
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Vehicles & Drivers
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Review vehicle status, route assignments, driver coverage, and recent updates across
              the fleet on any screen size.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatChip icon={<Bus size={16} />} label="Vehicles" value={summary.total} />
            <StatChip icon={<UserSquare2 size={16} />} label="Assigned" value={summary.withDriver} />
            <StatChip icon={<Bus size={16} />} label="Driving" value={summary.driving} />
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.7fr))]">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vehicle, plate, or driver"
              value={search}
            />
          </label>

          <select
            className="rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option>All</option>
            <option>Driving</option>
            <option>Standby</option>
            <option>Offline</option>
          </select>

          <select
            className="rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
            onChange={(event) => setRouteFilter(event.target.value)}
            value={routeFilter}
          >
            <option>All</option>
            {routeOptions.map((route) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Standby" value={summary.standby} />
          <MiniStat label="Offline" value={summary.offline} />
          <MiniStat label="Routes" value={routeOptions.length} />
          <MiniStat label="Filtered" value={filteredVehicles.length} />
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-slate-900">Fleet Assignment Board</h2>
          <p className="text-sm text-slate-500">
            Current vehicle-driver pairings and operating status.
          </p>
        </div>

        <div className="md:hidden">
          {filteredVehicles.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No vehicles matched the current filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => (
                <article key={vehicle.id} className="space-y-4 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{vehicle.plate_number}</h3>
                      <p className="mt-1 text-sm text-slate-500">{vehicle.id}</p>
                    </div>
                    <VehicleStatus status={vehicle.status} />
                  </div>

                  <dl className="grid grid-cols-2 gap-3">
                    <MetricCard label="Driver" value={vehicle.driver_name ?? "Unassigned"} />
                    <MetricCard label="Route" value={vehicle.route ?? "-"} />
                    <MetricCard label="Current Load" value={`${vehicle.load}%`} />
                    <MetricCard label="Last Updated" value={new Date(vehicle.updated_at).toLocaleString()} />
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[840px] w-full text-sm">
            <thead className="bg-sky-950 text-left text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Vehicle ID</th>
                <th className="px-4 py-3 font-medium">Plate Number</th>
                <th className="px-4 py-3 font-medium">Driver Name</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Current Load</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-medium text-slate-900">{vehicle.id}</td>
                  <td className="px-4 py-4 text-slate-700">{vehicle.plate_number}</td>
                  <td className="px-4 py-4 text-slate-600">{vehicle.driver_name ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-600">{vehicle.route ?? "-"}</td>
                  <td className="px-4 py-4">
                    <VehicleStatus status={vehicle.status} />
                  </td>
                  <td className="px-4 py-4 text-slate-600">{vehicle.load}%</td>
                  <td className="px-4 py-4 text-slate-600">
                    {new Date(vehicle.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={7}>
                    No vehicles matched the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

type StatChipProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

function StatChip({ icon, label, value }: StatChipProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">{icon}</div>
      </div>
    </div>
  );
}

type MiniStatProps = {
  label: string;
  value: number;
};

function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

type VehicleStatusProps = {
  status: Vehicle["status"];
};

function VehicleStatus({ status }: VehicleStatusProps) {
  const className =
    status === "Driving"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Standby"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-200 text-slate-600";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}
