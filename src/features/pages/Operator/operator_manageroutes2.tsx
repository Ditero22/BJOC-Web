import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Crosshair, MapPin, PencilLine, Route, Save, Trash2 } from "lucide-react";

import SharedMap from "@/features/shared/components/layout/SharedMap";
import {
  addStop,
  deleteStop,
  getRoutes,
  getStops,
  updateStop,
  type OperatorRoute,
} from "./services/operatorApi";

type Stop = {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
};

export default OperatorManageRoutes2;

export function OperatorManageRoutes2() {
  const [routes, setRoutes] = useState<OperatorRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [stopName, setStopName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const defaultCenter = {
    latitude: 14.4246,
    longitude: 120.9431,
  };

  useEffect(() => {
    void loadRoutes();
  }, []);

  useEffect(() => {
    if (!selectedRouteId) {
      setStops([]);
      return;
    }

    void loadStops(selectedRouteId);
  }, [selectedRouteId]);

  async function loadRoutes() {
    try {
      setRouteLoading(true);

      const data = await getRoutes();
      const nextRoutes = data ?? [];

      setRoutes(nextRoutes);

      if (nextRoutes.length > 0) {
        setSelectedRouteId(nextRoutes[0].id);
      }
    } catch (error) {
      console.error("ROUTE LOAD ERROR:", error);
    } finally {
      setRouteLoading(false);
    }
  }

  async function loadStops(routeId: string) {
    try {
      setTableLoading(true);

      const data = await getStops(routeId);

      setStops(
        (data ?? []).map((stop) => ({
          id: stop.id,
          latitude: stop.latitude,
          longitude: stop.longitude,
          name: stop.stop_name,
        })),
      );
    } catch (error) {
      console.error("STOP LOAD ERROR:", error);
    } finally {
      setTableLoading(false);
    }
  }

  async function handleSaveStop() {
    if (!selectedRouteId) {
      alert("Please select a route first.");
      return;
    }
    if (!stopName || !latitude || !longitude) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await updateStop(editingId, {
          latitude: Number(latitude),
          longitude: Number(longitude),
          stop_name: stopName,
        });
      } else {
        await addStop({
          latitude: Number(latitude),
          longitude: Number(longitude),
          route_id: selectedRouteId,
          stop_name: stopName,
        });
      }

      setEditingId(null);
      await loadStops(selectedRouteId);
      resetForm();
    } catch (error: any) {
      console.error("STOP SAVE ERROR:", error);
      alert(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(stop: Stop) {
    setEditingId(stop.id);
    setStopName(stop.name);
    setLatitude(String(stop.latitude));
    setLongitude(String(stop.longitude));
  }

  async function handleDelete(id: string) {
    if (!selectedRouteId) {
      return;
    }

    try {
      setLoading(true);
      await deleteStop(id);
      await loadStops(selectedRouteId);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setStopName("");
    setLatitude("");
    setLongitude("");
  }

  function clearEditState() {
    setEditingId(null);
    resetForm();
  }

  function handleConfirmCoords() {
    if (!pendingCoords) {
      return;
    }

    setLatitude(String(pendingCoords.latitude));
    setLongitude(String(pendingCoords.longitude));
    setPendingCoords(null);
    setIsMapOpen(false);
  }

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  );

  const routeLabel = selectedRoute
    ? selectedRoute.route_name || `${selectedRoute.start_location || "Unknown"} -> ${selectedRoute.end_location || "Unknown"}`
    : "No route selected";

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700/60">
              Staff Route Tools
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Route Stop Management
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Maintain route stop locations, adjust coordinates, and review route coverage with a
              responsive field-friendly layout.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InfoPill icon={<Route size={16} />} label="Routes" value={routes.length} />
            <InfoPill icon={<MapPin size={16} />} label="Stops" value={stops.length} />
            <InfoPill icon={<PencilLine size={16} />} label="Mode" value={editingId ? "Editing" : "Adding"} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.3fr)]">
        <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              {editingId ? "Edit Stop" : "Add Stop"}
            </h2>
            <p className="text-sm text-slate-500">
              Select a route and manage its stops with precise coordinates.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Route</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                disabled={routeLoading || routes.length === 0}
                onChange={(event) => setSelectedRouteId(event.target.value)}
                value={selectedRouteId}
              >
                {routes.length === 0 && (
                  <option value="">{routeLoading ? "Loading routes..." : "No routes available"}</option>
                )}

                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.route_name || `${route.start_location || "Unknown"} -> ${route.end_location || "Unknown"}`}
                  </option>
                ))}
              </select>
            </label>

            <Field
              onChange={setStopName}
              placeholder="Stop name"
              label="Stop Name"
              value={stopName}
            />
            <Field
              label="Latitude"
              onChange={setLatitude}
              placeholder="Latitude"
              type="number"
              value={latitude}
            />
            <Field
              label="Longitude"
              onChange={setLongitude}
              placeholder="Longitude"
              type="number"
              value={longitude}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white transition ${
                  loading || !selectedRouteId ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={loading || !selectedRouteId}
                onClick={() => void handleSaveStop()}
                type="button"
              >
                <Save size={16} />
                {loading ? "Processing..." : editingId ? "Update Stop" : "Save Stop"}
              </button>

              <button
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                onClick={() => setIsMapOpen(true)}
                type="button"
              >
                <Crosshair size={16} />
                Full View Map
              </button>
            </div>

            {editingId && (
              <button
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={clearEditState}
                type="button"
              >
                Cancel Editing
              </button>
            )}
          </div>
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Route Map Preview</h2>
              <p className="text-sm text-slate-500">{routeLabel}</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {stops.length} mapped stop{stops.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="h-[320px] overflow-hidden rounded-[22px] border border-slate-200 sm:h-[420px]">
            <SharedMap initialCenter={defaultCenter} initialZoom={11} stops={stops} />
          </div>
        </section>
      </div>

      <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-slate-900">Stops List</h2>
          <p className="text-sm text-slate-500">
            Review coordinates and make quick edits for the selected route.
          </p>
        </div>

        {tableLoading && <div className="px-4 py-10 text-center text-sm text-slate-400">Loading stops...</div>}

        {!tableLoading && stops.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-400">
            No stops found for this route yet.
          </div>
        )}

        {!tableLoading && stops.length > 0 && (
          <div className="divide-y divide-slate-100">
            {stops.map((stop) => (
              <article
                key={stop.id}
                className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">{stop.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {stop.latitude}, {stop.longitude}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-200"
                    onClick={() => handleEdit(stop)}
                    type="button"
                  >
                    <PencilLine size={14} />
                    Edit
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
                    onClick={() => void handleDelete(stop.id)}
                    type="button"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="relative flex h-[min(92vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Full Map View</h2>
                <p className="text-sm text-slate-500">Right-click on the map to choose coordinates.</p>
              </div>
              <button
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
                onClick={() => setIsMapOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1">
              <SharedMap
                initialCenter={defaultCenter}
                initialZoom={11}
                onRightClick={(coords) => setPendingCoords(coords)}
                stops={stops}
              />
            </div>
          </div>
        </div>
      )}

      {pendingCoords && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
            <h2 className="text-xl font-semibold text-slate-900">Confirm Coordinates</h2>
            <p className="mt-1 text-sm text-slate-500">
              Use these coordinates for the current stop form.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-500">Latitude:</span> {pendingCoords.latitude}
              </p>
              <p className="mt-2">
                <span className="font-medium text-slate-500">Longitude:</span> {pendingCoords.longitude}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setPendingCoords(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                onClick={handleConfirmCoords}
                type="button"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type InfoPillProps = {
  icon: ReactNode;
  label: string;
  value: number | string;
};

function InfoPill({ icon, label, value }: InfoPillProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 truncate text-lg font-semibold text-slate-900">{value}</p>
        </div>
        <div className="shrink-0 rounded-2xl bg-blue-100 p-3 text-blue-700">{icon}</div>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
};

function Field({ label, onChange, placeholder, type = "text", value }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}
