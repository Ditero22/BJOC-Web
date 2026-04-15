import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarClock, Route, TimerReset } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnrichedVehicle {
  id: string;
  plate_number?: string | null;
  driver?: string | null;
  available: boolean;
  ongoing: boolean;
  scheduled: boolean;
  trips_today: number;
}

interface ActiveTrip {
  id: string;
  vehicle_id?: string | null;
  status: string;
  driver?: string | null;
  route?: string | null;
  scheduled_departure_time?: string | null;
  start_time?: string | null;
}

interface RouteRecord {
  id: string;
  route_name?: string | null;
  start_location?: string | null;
  end_location?: string | null;
}

import { useLoading } from "@/features/shared/context/LoadingContext";
import { routesService } from "./services/routesService";
import { tripsService } from "./services/tripsService";
import { vehicleService } from "./services/vehicleService";
import { ActiveTripsTable } from "./modal/ActiveTripsTable";
import { ConfirmTripModal } from "./modal/ConfirmTripModal";
import { DispatchTripModal } from "./modal/DispatchTripModal";
import { FleetVehicleCard } from "./modal/FleetVehicleCard";
import { RescheduleTripModal } from "./modal/RescheduleTripModal";
import { TripHistoryCard } from "./modal/TripHistoryCard";

export function AdminTrips() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [vehicles, setVehicles] = useState<EnrichedVehicle[]>([]);
  const [activeTrips, setActiveTrips] = useState<ActiveTrip[]>([]);
  const [history, setHistory] = useState<ActiveTrip[]>([]);
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<EnrichedVehicle | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<ActiveTrip | null>(null);
  const [confirmScheduleOpen, setConfirmScheduleOpen] = useState(false);
  const [pendingVehicle, setPendingVehicle] = useState<EnrichedVehicle | null>(null);
  const [confirmAction, setConfirmAction] = useState<"cancel" | "end" | "reschedule" | null>(null);

  const loadingRef = useRef(false);

  async function load(withLoading = false) {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;

    if (withLoading) {
      showLoading();
    }

    try {
      const [vehiclesData, activeTripsData, historyData, routesData] = await Promise.all([
        vehicleService.getVehicles(),
        tripsService.getActiveTrips(),
        tripsService.getTripHistory(),
        routesService.getRoutes(),
      ]);

      setRoutes(routesData ?? []);
      setActiveTrips(activeTripsData ?? []);
      setHistory(historyData ?? []);

      const enrichedVehicles = (vehiclesData ?? []).map((vehicle) => {
        const scheduledTrip = (activeTripsData ?? []).find(
          (trip) => trip.vehicle_id === vehicle.id && trip.status === "scheduled",
        );

        const ongoingTrip = (activeTripsData ?? []).find(
          (trip) => trip.vehicle_id === vehicle.id && trip.status === "ongoing",
        );

        const tripsToday = (historyData ?? []).filter((trip) => trip.vehicle_id === vehicle.id).length;

        return {
          ...vehicle,
          available: !scheduledTrip && !ongoingTrip,
          ongoing: Boolean(ongoingTrip),
          scheduled: Boolean(scheduledTrip),
          trips_today: tripsToday,
        };
      });

      setVehicles(enrichedVehicles);
    } catch (error) {
      console.error("Trips load error:", error);
    } finally {
      if (withLoading) {
        hideLoading();
      }

      loadingRef.current = false;
    }
  }

  useEffect(() => {
    void load(true);

    const interval = window.setInterval(() => {
      void load(false);
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  function openDispatch(vehicle: EnrichedVehicle) {
    if (vehicle.ongoing) {
      alert("Vehicle is currently on a trip.");
      return;
    }

    if (vehicle.scheduled) {
      setPendingVehicle(vehicle);
      setConfirmScheduleOpen(true);
      return;
    }

    setSelectedVehicle(vehicle);
    setDispatchOpen(true);
  }

  function cancelTrip(trip: ActiveTrip) {
    setSelectedTrip(trip);
    setConfirmAction("cancel");
    setConfirmOpen(true);
  }

  function endTrip(trip: ActiveTrip) {
    setSelectedTrip(trip);
    setConfirmAction("end");
    setConfirmOpen(true);
  }

  function rescheduleTrip(trip: ActiveTrip) {
    setSelectedTrip(trip);
    setRescheduleOpen(true);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/60">
              Trip Operations
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Scheduling & Live Trip Control
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Coordinate fleet assignments, monitor active trips, and keep recent history visible on
              any screen size.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TripsStat
              icon={<CalendarClock size={18} />}
              label="Scheduled / Active"
              value={activeTrips.length}
            />
            <TripsStat icon={<Route size={18} />} label="Vehicles" value={vehicles.length} />
            <TripsStat icon={<TimerReset size={18} />} label="Trip history" value={history.length} />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Trip History</h2>
            <p className="text-sm text-slate-500">Quick access to the latest completed or closed trips.</p>
          </div>

          <button
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
            onClick={() => navigate("/admin/reports-history")}
            type="button"
          >
            View All
          </button>
        </div>

        <div className="flex snap-x gap-3 overflow-x-auto pb-2">
          {history.length === 0 && <p className="text-sm text-slate-400">No trip history yet.</p>}

          {history.slice(0, 10).map((trip) => (
            <div key={trip.id} className="min-w-[280px] snap-start sm:min-w-[320px]">
              <TripHistoryCard trip={trip} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)]">
        <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Trip Scheduling</h2>
              <p className="text-sm text-slate-500">Assign available vehicles to upcoming trips.</p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {vehicles.length} vehicles
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {vehicles.length === 0 && <p className="text-sm text-slate-400">No vehicles available.</p>}

            {vehicles.map((vehicle) => (
              <FleetVehicleCard key={vehicle.id} onDispatch={openDispatch} vehicle={vehicle} />
            ))}
          </div>
        </section>

        <ActiveTripsTable
          onCancel={cancelTrip}
          onEnd={endTrip}
          onReschedule={rescheduleTrip}
          trips={activeTrips}
        />
      </div>

      <DispatchTripModal
        activeTrips={activeTrips}
        onClose={() => setDispatchOpen(false)}
        onSuccess={() => void load(false)}
        open={dispatchOpen}
        routes={routes}
        vehicle={selectedVehicle}
      />

      <RescheduleTripModal
        onClose={() => setRescheduleOpen(false)}
        onSuccess={() => void load(false)}
        open={rescheduleOpen}
        trip={selectedTrip}
      />

      <ConfirmTripModal
        action={confirmAction}
        onClose={() => setConfirmOpen(false)}
        onSuccess={() => void load(false)}
        open={confirmOpen}
        trip={selectedTrip}
      />

      {confirmScheduleOpen && pendingVehicle && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-4 rounded-[24px] bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Vehicle Already Scheduled</h3>
            <p className="text-sm leading-6 text-slate-600">
              This vehicle already has a scheduled trip. You can still create another one, and the
              exact time will be validated when you submit.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => {
                  setConfirmScheduleOpen(false);
                  setPendingVehicle(null);
                }}
                type="button"
              >
                Cancel
              </button>

              <button
                className="rounded-2xl bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
                onClick={() => {
                  setConfirmScheduleOpen(false);
                  setSelectedVehicle(pendingVehicle);
                  setDispatchOpen(true);
                  setPendingVehicle(null);
                }}
                type="button"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type TripsStatProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

function TripsStat({ icon, label, value }: TripsStatProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">{icon}</div>
      </div>
    </div>
  );
}
