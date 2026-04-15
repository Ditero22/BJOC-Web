import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { phNow } from "@/lib/time";
import {
  calculateRouteFare,
  formatRouteFare,
  resolveRouteEndpoints,
  type RouteStopPoint,
} from "@/features/shared/utils/tripSchedulePreview";
import { stopsService } from "../services/stopsService";
import { tripsService } from "../services/tripsService";

type ActiveTripRow = {
  driver?: string | null;
  id: string;
  route?: string | null;
  scheduled_departure_time?: string | null;
  start_time?: string | null;
  status: string;
  vehicle_id?: string | null;
};

type VehicleShape = {
  id: string;
  plate_number?: string | null;
  driver?: string | null;
  ongoing: boolean;
  scheduled: boolean;
};

type RouteShape = {
  id: string;
  route_name?: string | null;
  start_location?: string | null;
  end_location?: string | null;
};

type Props = {
  activeTrips: ActiveTripRow[];
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  routes: RouteShape[];
  vehicle: VehicleShape | null;
};

export function DispatchTripModal({
  activeTrips,
  open,
  vehicle,
  routes,
  onClose,
  onSuccess,
}: Props) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [departureTime, setDepartureTime] = useState<Date | null>(phNow());
  const [routeStops, setRouteStops] = useState<RouteStopPoint[]>([]);
  const [farePreview, setFarePreview] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedRoute("");
    setDepartureTime(phNow());
    setRouteStops([]);
    setFarePreview(null);
    setIsPreviewLoading(false);
  }, [open, vehicle?.id]);

  useEffect(() => {
    if (!open || !selectedRoute) {
      setRouteStops([]);
      setFarePreview(null);
      setIsPreviewLoading(false);
      return;
    }

    let active = true;

    setIsPreviewLoading(true);

    void stopsService
      .getStopsByRoute(selectedRoute)
      .then((stops) => {
        if (!active) {
          return;
        }

        setRouteStops(stops);
        setFarePreview(calculateRouteFare(stops));
      })
      .catch((error) => {
        console.error("Route preview load error:", error);

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
  }, [open, selectedRoute]);

  const matchingTrips = useMemo(() => {
    if (!vehicle) {
      return [];
    }

    const normalizedDriver = typeof vehicle.driver === "string"
      ? vehicle.driver.trim().toLowerCase()
      : "";

    return activeTrips
      .filter((trip) => {
        const matchesVehicle = trip.vehicle_id === vehicle.id;
        const matchesDriver =
          normalizedDriver.length > 0 &&
          typeof trip.driver === "string" &&
          trip.driver.trim().toLowerCase() === normalizedDriver;

        return matchesVehicle || matchesDriver;
      })
      .sort((left, right) => {
        const leftTime = getTripPreviewTimestamp(left);
        const rightTime = getTripPreviewTimestamp(right);
        return leftTime - rightTime;
      });
  }, [activeTrips, vehicle]);
  const selectedRouteRecord = routes.find((route) => route.id === selectedRoute) ?? null;
  const routePreview = resolveRouteEndpoints(selectedRouteRecord, routeStops);
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

  if (!open || !vehicle) {
    return null;
  }

  const scheduleValidationNote = vehicle.scheduled
    ? "This vehicle already has another scheduled trip. You can still add one if the departure window does not overlap."
    : "Schedule conflicts are checked when you submit the trip.";

  async function scheduleTrip() {
    if (vehicle.ongoing) {
      alert("This vehicle already has an active trip.");
      return;
    }
    if (!vehicle.driver) {
      alert("Vehicle has no assigned driver.");
      return;
    }
    if (!selectedRoute) {
      alert("Please select route.");
      return;
    }
    if (!departureTime) {
      alert("Please select departure time.");
      return;
    }
    if (departureTime < phNow()) {
      alert("Departure cannot be earlier than current time.");
      return;
    }

    const scheduledTime = departureTime.toISOString();
    const tripDate = scheduledTime.split("T")[0];

    try {
      await tripsService.scheduleTrip({
        route_id: selectedRoute,
        scheduled_departure_time: scheduledTime,
        trip_date: tripDate,
        vehicle_id: vehicle.id,
      });

      onSuccess();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
        alert(error.response.data.message);
        return;
      }

      alert("Unable to schedule the trip right now.");
    }
  }

  function addMinutes(minutes: number) {
    setDepartureTime(new Date(phNow().getTime() + minutes * 60000));
  }

  function getRouteLabel(route: RouteShape) {
    return route.route_name || `${route.start_location || "Unknown"} -> ${route.end_location || "Unknown"}`;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">Schedule Trip</h3>
          <p className="mt-1 text-sm text-slate-500">
            {vehicle.plate_number} with {vehicle.driver || "Unassigned"}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Route</span>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              onChange={(event) => setSelectedRoute(event.target.value)}
              value={selectedRoute}
            >
              <option value="">Select Route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {getRouteLabel(route)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PreviewField
              label="Pickup"
              value={selectedRoute ? routePreview.pickup : "Auto based on route"}
            />
            <PreviewField
              label="Drop-off"
              value={selectedRoute ? routePreview.dropOff : "Auto based on route"}
            />
            <PreviewField
              label="Time"
              value={departurePreview}
            />
            <PreviewField
              label="Fare"
              value={fareLabel}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Departure time</span>
            <DatePicker
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
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

          <div>
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

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {scheduleValidationNote}
          </div>

          {matchingTrips.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-700">Existing schedules for this vehicle or driver</p>
              <div className="mt-3 space-y-2">
                {matchingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {trip.route || "Assigned route"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatTripPreviewTime(trip)}
                      </p>
                    </div>
                    <span className={getTripStatusClassName(trip.status)}>
                      {trip.status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                You can still schedule another trip if its time window does not overlap.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            onClick={() => void scheduleTrip()}
            type="button"
          >
            Schedule Trip
          </button>
        </div>
      </div>
    </div>
  );
}

function getTripPreviewTimestamp(trip: ActiveTripRow) {
  const source = trip.status === "scheduled"
    ? trip.scheduled_departure_time
    : trip.start_time ?? trip.scheduled_departure_time;

  if (!source) {
    return Number.MAX_SAFE_INTEGER;
  }

  const parsed = new Date(source).getTime();
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function formatTripPreviewTime(trip: ActiveTripRow) {
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

function getTripStatusClassName(status: string) {
  return `inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
    status === "ongoing"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700"
  }`;
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
