import { useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarClock, CarFront, Route, UserRound } from "lucide-react";

import { phNow, phTime } from "@/lib/time";
import {
  calculateRouteFare,
  formatRouteFare,
  resolveRouteEndpoints,
  type RouteStopPoint,
} from "@/features/shared/utils/tripSchedulePreview";
import { operatorService } from "./services/operatorService";

type StaffRoute = {
  end_location?: string | null;
  id: string;
  route_name?: string | null;
  start_location?: string | null;
};

type StaffVehicle = {
  capacity?: number | null;
  driver?: string | null;
  driver_id?: string | null;
  id: string;
  model?: string | null;
  ongoing?: boolean;
  plate_number: string;
  scheduled?: boolean;
  status?: string | null;
};

type StaffDriver = {
  first_name: string;
  id: string;
  last_name: string;
  status?: string | null;
  vehicle_id?: string | null;
};

type StaffTrip = {
  driver: string;
  id: string;
  route: string;
  scheduled_departure_time?: string | null;
  start_time?: string | null;
  status: string;
  vehicle: string;
  vehicle_id?: string | null;
};

function getStaffTripPreviewTimestamp(trip: StaffTrip) {
  const source = trip.status === "scheduled"
    ? trip.scheduled_departure_time
    : trip.start_time ?? trip.scheduled_departure_time;

  if (!source) {
    return Number.MAX_SAFE_INTEGER;
  }

  const parsed = new Date(source).getTime();
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function formatStaffTripPreviewTime(trip: StaffTrip) {
  const source = trip.status === "scheduled"
    ? trip.scheduled_departure_time
    : trip.start_time ?? trip.scheduled_departure_time;

  if (!source) {
    return "Time unavailable";
  }

  return new Date(source).toLocaleString("en-PH", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

export default OperatorTrips;

export function OperatorTrips() {
  const [routes, setRoutes] = useState<StaffRoute[]>([]);
  const [vehicles, setVehicles] = useState<StaffVehicle[]>([]);
  const [drivers, setDrivers] = useState<StaffDriver[]>([]);
  const [activeTrips, setActiveTrips] = useState<StaffTrip[]>([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [departureTime, setDepartureTime] = useState<Date | null>(phNow());
  const [routeStops, setRouteStops] = useState<RouteStopPoint[]>([]);
  const [farePreview, setFarePreview] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    setIsLoading(true);

    try {
      const [routesData, vehiclesData, driversData, activeTripsData] = await Promise.all([
        operatorService.getRoutes(),
        operatorService.getSchedulingVehicles(),
        operatorService.getDrivers(),
        operatorService.getActiveTrips(),
      ]);

      const enrichedVehicles = (vehiclesData ?? []).map((vehicle) => {
        const scheduledTrip = (activeTripsData ?? []).find(
          (trip: StaffTrip) => trip.vehicle_id === vehicle.id && trip.status === "scheduled",
        );
        const ongoingTrip = (activeTripsData ?? []).find(
          (trip: StaffTrip) => trip.vehicle_id === vehicle.id && trip.status === "ongoing",
        );

        return {
          ...vehicle,
          ongoing: Boolean(ongoingTrip),
          scheduled: Boolean(scheduledTrip),
        };
      });

      setRoutes(routesData ?? []);
      setVehicles(enrichedVehicles);
      setDrivers(driversData ?? []);
      setActiveTrips(activeTripsData ?? []);
    } catch (error) {
      console.error("Staff trip scheduling load error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!selectedRoute) {
      setRouteStops([]);
      setFarePreview(null);
      setIsPreviewLoading(false);
      return;
    }

    let active = true;

    setIsPreviewLoading(true);

    void operatorService
      .getRouteStops(selectedRoute)
      .then((stops) => {
        if (!active) {
          return;
        }

        setRouteStops(stops);
        setFarePreview(calculateRouteFare(stops));
      })
      .catch((error) => {
        console.error("Staff route preview load error:", error);

        if (!active) {
          return;
        }

        setRouteStops([]);
        setFarePreview(null);
      })
      .finally(() => {
        if (active) {
          setIsPreviewLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedRoute]);

  useEffect(() => {
    const vehicle = vehicles.find((item) => item.id === selectedVehicle);

    if (!vehicle) {
      setSelectedDriver("");
      return;
    }

    setSelectedDriver(vehicle.driver_id ?? "");
  }, [selectedVehicle, vehicles]);

  const selectedRouteRecord = routes.find((route) => route.id === selectedRoute) ?? null;
  const selectedVehicleRecord = vehicles.find((vehicle) => vehicle.id === selectedVehicle) ?? null;
  const selectedDriverRecord = drivers.find((driver) => driver.id === selectedDriver) ?? null;
  const routePreview = resolveRouteEndpoints(selectedRouteRecord, routeStops);
  const readyVehicles = vehicles.filter((vehicle) => !vehicle.ongoing).length;
  const availableDrivers = drivers.filter((driver) => driver.status !== "offline").length;
  const departurePreview = departureTime
    ? departureTime.toLocaleString("en-PH", {
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        month: "short",
      })
    : "Select departure time";
  const fareLabel = selectedRoute
    ? isPreviewLoading
      ? "Calculating..."
      : formatRouteFare(farePreview)
    : "Select route first";
  const assignmentMessage = useMemo(() => {
    if (!selectedVehicleRecord || !selectedDriverRecord) {
      return "";
    }

    const driverName = `${selectedDriverRecord.first_name} ${selectedDriverRecord.last_name}`;

    if (selectedVehicleRecord.driver_id === selectedDriverRecord.id) {
      return `${driverName} is already assigned to ${selectedVehicleRecord.plate_number}.`;
    }

    if (selectedVehicleRecord.driver_id && selectedVehicleRecord.driver_id !== selectedDriverRecord.id) {
      return `${selectedVehicleRecord.plate_number} is already assigned to another driver. Unassign it first before scheduling.`;
    }

    if (selectedDriverRecord.vehicle_id && selectedDriverRecord.vehicle_id !== selectedVehicleRecord.id) {
      return `${driverName} is already assigned to another vehicle. Clear that assignment first before scheduling.`;
    }

    return `${driverName} will be assigned to ${selectedVehicleRecord.plate_number} for this schedule.`;
  }, [selectedDriverRecord, selectedVehicleRecord]);

  const driverOptions = useMemo(
    () =>
      [...drivers].sort((left, right) =>
        `${left.first_name} ${left.last_name}`.localeCompare(`${right.first_name} ${right.last_name}`),
      ),
    [drivers],
  );
  const schedulePreviewTrips = useMemo(() => {
    const normalizedDriverName = selectedDriverRecord
      ? `${selectedDriverRecord.first_name} ${selectedDriverRecord.last_name}`.trim().toLowerCase()
      : "";

    return activeTrips
      .filter((trip) => {
        const matchesVehicle = selectedVehicleRecord
          ? trip.vehicle_id === selectedVehicleRecord.id
          : false;
        const matchesDriver =
          normalizedDriverName.length > 0 &&
          trip.driver.trim().toLowerCase() === normalizedDriverName;

        return matchesVehicle || matchesDriver;
      })
      .sort((left, right) => getStaffTripPreviewTimestamp(left) - getStaffTripPreviewTimestamp(right));
  }, [activeTrips, selectedDriverRecord, selectedVehicleRecord]);

  function addMinutes(minutes: number) {
    setDepartureTime(new Date(phNow().getTime() + minutes * 60000));
  }

  async function handleScheduleTrip() {
    if (!selectedRoute) {
      alert("Please select a route.");
      return;
    }

    if (!selectedVehicleRecord) {
      alert("Please select a vehicle.");
      return;
    }

    if (!selectedDriverRecord) {
      alert("Please select a driver.");
      return;
    }

    if (!departureTime) {
      alert("Please select a departure time.");
      return;
    }

    if (selectedVehicleRecord.ongoing) {
      alert("The selected vehicle is currently on an active trip.");
      return;
    }

    if (selectedVehicleRecord.driver_id && selectedVehicleRecord.driver_id !== selectedDriverRecord.id) {
      alert("This vehicle is already assigned to another driver. Unassign it first before scheduling.");
      return;
    }

    if (selectedDriverRecord.vehicle_id && selectedDriverRecord.vehicle_id !== selectedVehicleRecord.id) {
      alert("This driver is already assigned to another vehicle. Clear that assignment first before scheduling.");
      return;
    }

    if (departureTime < phNow()) {
      alert("Departure cannot be earlier than the current time.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedVehicleRecord.driver_id !== selectedDriverRecord.id) {
        await operatorService.assignDriver(selectedVehicleRecord.id, selectedDriverRecord.id);
      }

      const scheduledTime = departureTime.toISOString();

      await operatorService.scheduleTrip({
        route_id: selectedRoute,
        scheduled_departure_time: scheduledTime,
        trip_date: scheduledTime.split("T")[0],
        vehicle_id: selectedVehicleRecord.id,
      });

      alert("Trip scheduled successfully.");
      setSelectedRoute("");
      setSelectedVehicle("");
      setSelectedDriver("");
      setDepartureTime(phNow());
      await loadData();
    } catch (error) {
      console.error("Staff schedule trip error:", error);
      if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
        alert(error.response.data.message);
        return;
      }

      alert("Unable to schedule the trip. Please review the driver, vehicle, and route selection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700/60">
              Staff Trip Scheduling
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Schedule Driver, Vehicle, and Route
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Create upcoming trips from one responsive screen with route-based pickup, drop-off,
              time, and fare preview built in.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TopStat icon={<Route size={18} />} label="Routes" value={routes.length} />
            <TopStat icon={<CarFront size={18} />} label="Ready Vehicles" value={readyVehicles} />
            <TopStat icon={<UserRound size={18} />} label="Drivers" value={availableDrivers} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">Create Trip Schedule</h2>
            <p className="text-sm text-slate-500">
              Pick a route, choose the driver and vehicle pair, then set the departure time.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Route</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
                onChange={(event) => setSelectedRoute(event.target.value)}
                value={selectedRoute}
              >
                <option value="">Select route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.route_name || `${route.start_location || "Unknown"} -> ${route.end_location || "Unknown"}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Vehicle</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
                onChange={(event) => setSelectedVehicle(event.target.value)}
                value={selectedVehicle}
              >
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number}
                    {vehicle.ongoing ? " - On trip" : vehicle.scheduled ? " - Scheduled" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-600">Driver</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
                onChange={(event) => setSelectedDriver(event.target.value)}
                value={selectedDriver}
              >
                <option value="">Select driver</option>
                {driverOptions.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.first_name} {driver.last_name}
                    {driver.vehicle_id ? " - Assigned" : " - Available"}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-600">Departure time</span>
              <DatePicker
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
                dateFormat="h:mm aa"
                maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                minTime={phNow()}
                onChange={(date: Date | null) => setDepartureTime(date)}
                selected={departureTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={5}
              />
            </label>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-600">Quick set</p>
            <div className="flex flex-wrap gap-2">
              {[0, 5, 10, 20, 30].map((minutes) => (
                <button
                  key={minutes}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  onClick={() => addMinutes(minutes)}
                  type="button"
                >
                  {minutes === 0 ? "Now" : `+${minutes}`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            {assignmentMessage || "Choose a vehicle and driver to preview the assignment logic."}
          </div>

          {selectedVehicleRecord?.scheduled && !selectedVehicleRecord.ongoing && (
            <div className="mt-3 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This vehicle already has another scheduled trip. You can still add one if the
              departure window does not overlap.
            </div>
          )}

          {schedulePreviewTrips.length > 0 && (
            <div className="mt-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-700">Upcoming schedules for this vehicle or driver</p>
              <div className="mt-3 space-y-2">
                {schedulePreviewTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{trip.route || "Assigned route"}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatStaffTripPreviewTime(trip)}</p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                        trip.status === "ongoing"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                The backend still performs the final overlap validation when you submit.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                setSelectedRoute("");
                setSelectedVehicle("");
                setSelectedDriver("");
                setDepartureTime(phNow());
              }}
              type="button"
            >
              Reset
            </button>
            <button
              className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={() => void handleScheduleTrip()}
              type="button"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Trip"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Route Auto Preview</h2>
                <p className="text-sm text-slate-500">
                  Pickup, drop-off, time, and fare fill from the selected route and departure.
                </p>
              </div>
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <CalendarClock size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PreviewField
                label="Pickup"
                value={selectedRoute ? routePreview.pickup : "Auto based on route"}
              />
              <PreviewField
                label="Drop-off"
                value={selectedRoute ? routePreview.dropOff : "Auto based on route"}
              />
              <PreviewField label="Time" value={departurePreview} />
              <PreviewField label="Fare" value={fareLabel} />
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">Selected Pair</h2>
              <p className="text-sm text-slate-500">Quick summary before the trip is scheduled.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <PreviewField
                label="Vehicle"
                value={selectedVehicleRecord?.plate_number ?? "Select vehicle"}
              />
              <PreviewField
                label="Driver"
                value={
                  selectedDriverRecord
                    ? `${selectedDriverRecord.first_name} ${selectedDriverRecord.last_name}`
                    : "Select driver"
                }
              />
              <PreviewField
                label="Capacity"
                value={selectedVehicleRecord?.capacity ? `${selectedVehicleRecord.capacity} seats` : "Not available"}
              />
              <PreviewField
                label="Status"
                value={
                  selectedVehicleRecord?.ongoing
                    ? "On trip"
                    : selectedVehicleRecord?.scheduled
                    ? "Already scheduled"
                    : selectedVehicleRecord?.status ?? "Ready to assign"
                }
              />
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Scheduled & Active Trips</h2>
              <p className="text-sm text-slate-500">
                Keep the current operations board visible while scheduling the next trip.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {activeTrips.length} trip{activeTrips.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">Loading trips...</div>
          ) : activeTrips.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No scheduled or active trips.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeTrips.map((trip) => (
                <article key={trip.id} className="space-y-4 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{trip.route}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {trip.vehicle} with {trip.driver}
                      </p>
                    </div>
                    <StatusPill status={trip.status} />
                  </div>

                  <dl className="grid grid-cols-2 gap-3">
                    <PreviewField label="Vehicle" value={trip.vehicle} />
                    <PreviewField label="Driver" value={trip.driver} />
                    <PreviewField
                      label="Time"
                      value={trip.status === "scheduled" ? phTime(trip.scheduled_departure_time ?? null) : phTime(trip.start_time ?? null)}
                    />
                    <PreviewField label="Status" value={trip.status} />
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-sky-950 text-left text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-400" colSpan={5}>
                    Loading trips...
                  </td>
                </tr>
              )}

              {!isLoading &&
                activeTrips.map((trip) => (
                  <tr key={trip.id} className="border-b border-slate-100">
                    <td className="px-4 py-4 font-medium text-slate-900">{trip.route}</td>
                    <td className="px-4 py-4 text-slate-700">{trip.vehicle}</td>
                    <td className="px-4 py-4 text-slate-700">{trip.driver}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {trip.status === "scheduled"
                        ? phTime(trip.scheduled_departure_time ?? null)
                        : phTime(trip.start_time ?? null)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill status={trip.status} />
                    </td>
                  </tr>
                ))}

              {!isLoading && activeTrips.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-400" colSpan={5}>
                    No scheduled or active trips.
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

type TopStatProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

function TopStat({ icon, label, value }: TopStatProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="shrink-0 rounded-2xl bg-sky-100 p-3 text-sky-700">{icon}</div>
      </div>
    </div>
  );
}

type PreviewFieldProps = {
  label: string;
  value: string;
};

function PreviewField({ label, value }: PreviewFieldProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

type StatusPillProps = {
  status: string;
};

function StatusPill({ status }: StatusPillProps) {
  const className =
    status === "ongoing"
      ? "bg-emerald-100 text-emerald-700"
      : status === "scheduled"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-200 text-slate-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}
