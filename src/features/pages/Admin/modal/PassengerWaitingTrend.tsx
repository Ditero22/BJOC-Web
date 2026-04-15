import { useEffect, useState } from "react";
import { Bus } from "lucide-react";

import { adminService } from "../services/adminService";

type Route = {
  id: string;
  start_location: string;
  end_location: string;
};

type TrendResponse = {
  stops: string[];
  hours: string[];
  matrix: Record<string, Record<string, number>>;
};

export function PassengerWaitingTrend() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [stops, setStops] = useState<string[]>([]);
  const [hours, setHours] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(true);

  useEffect(() => {
    void loadRoutes();
  }, []);

  useEffect(() => {
    if (!selectedRoute) {
      return;
    }

    void loadTrend(selectedRoute);
  }, [selectedRoute]);

  async function loadRoutes() {
    try {
      setRouteLoading(true);

      const data = await adminService.getRoutes();

      if (!data || data.length === 0) {
        setRoutes([]);
        return;
      }

      setRoutes(data);
      setSelectedRoute(data[0].id);
    } catch (error) {
      console.error("Route load error:", error);
    } finally {
      setRouteLoading(false);
    }
  }

  async function loadTrend(routeId: string) {
    try {
      setLoading(true);

      const data: TrendResponse = await adminService.getWaitingStops(routeId, "today");

      setStops(data?.stops ?? []);
      setHours(data?.hours ?? []);
      setMatrix(data?.matrix ?? {});
    } catch (error) {
      console.error("Passenger trend load error:", error);
      setStops([]);
      setHours([]);
      setMatrix({});
    } finally {
      setLoading(false);
    }
  }

  function getColor(value: number) {
    if (value === 0) {
      return "border border-slate-200 bg-slate-100 text-slate-500";
    }
    if (value < 3) {
      return "bg-sky-200 text-sky-800";
    }
    if (value < 6) {
      return "bg-sky-500 text-white";
    }

    return "bg-sky-800 text-white";
  }

  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Passenger Waiting Trend</h2>
          <p className="text-sm text-slate-500">
            Heatmap snapshot of stop congestion across the day.
          </p>
        </div>

        {routeLoading ? (
          <span className="text-sm text-slate-400">Loading routes...</span>
        ) : routes.length === 0 ? (
          <span className="text-sm text-slate-400">No routes available.</span>
        ) : (
          <select
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 sm:w-auto"
            onChange={(event) => setSelectedRoute(event.target.value)}
            value={selectedRoute}
          >
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {(route.start_location || "Unknown") + " -> " + (route.end_location || "Unknown")}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <div className="py-6 text-center text-sm text-slate-400">
          Loading passenger waiting data...
        </div>
      )}

      {!loading && stops.length === 0 && (
        <div className="py-6 text-center text-sm text-slate-400">No passenger waiting data</div>
      )}

      {!loading && stops.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-xs">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="p-2 text-left">Time</th>
                {stops.map((stop) => (
                  <th key={stop} className="p-2 text-center">
                    <div className="group relative flex justify-center">
                      <Bus size={16} className="cursor-pointer text-sky-600" />
                      <div className="absolute top-full z-50 mt-1 hidden whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow group-hover:block">
                        {stop}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {hours.map((hour) => (
                <tr key={hour} className="border-b border-slate-100">
                  <td className="p-2 font-medium text-slate-500">{hour}</td>
                  {stops.map((stop) => {
                    const value = matrix?.[hour]?.[stop] ?? 0;

                    return (
                      <td key={stop} className="p-2 text-center">
                        <span
                          className={`inline-block min-w-[24px] rounded px-2 py-[2px] text-[10px] font-medium ${getColor(value)}`}
                        >
                          {value}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
