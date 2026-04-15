import { useEffect, useMemo, useState } from "react";
import { Map, MapPin, MoreVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import SharedMap from "@/features/shared/components/layout/SharedMap";
import StopsTable, { type Stop as RouteStop } from "@/features/shared/components/layout/StopsTable";
import { useLoading } from "@/features/shared/context/LoadingContext";
import type { MapVehicle, StopCoords } from "@/features/types/operations";
import { routesService } from "./services/routesService";
import { stopsService } from "./services/stopsService";
import { vehicleService } from "./services/vehicleService";

type Route = {
  end_location?: string;
  id: string;
  route_name: string;
  start_location?: string;
};

export function AdminRouteStopManagement() {
  const { showLoading, hideLoading } = useLoading();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeMenuOpen, setRouteMenuOpen] = useState<string | null>(null);

  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [showCreateStop, setShowCreateStop] = useState(false);
  const [showSelectMap, setShowSelectMap] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<StopCoords | null>(null);

  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [vehicleLocations, setVehicleLocations] = useState<MapVehicle[]>([]);

  const [routeForm, setRouteForm] = useState({
    end_location: "",
    route_name: "",
    start_location: "",
  });
  const [stopForm, setStopForm] = useState({
    latitude: "",
    longitude: "",
    stop_name: "",
  });

  const defaultCenter = { latitude: 14.438853366233266, longitude: 120.9607039176618 };

  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);

  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmButton, setConfirmButton] = useState("Confirm");
  const [confirmColor, setConfirmColor] = useState("bg-blue-600");

  const orderedStops = [...stops];
  const mapStops = useMemo(() => {
    return orderedStops
      .filter(
        (stop): stop is RouteStop & { latitude: number; longitude: number } =>
          typeof stop.latitude === "number" && typeof stop.longitude === "number",
      )
      .map((stop) => ({
        id: stop.id,
        latitude: stop.latitude,
        longitude: stop.longitude,
        name: stop.name ?? undefined,
      }));
  }, [orderedStops]);

  async function loadRoutes() {
    const data = await routesService.getRoutes();
    setRoutes(data ?? []);
  }

  async function loadStops(routeId: string) {
    const data = await stopsService.getStopsByRoute(routeId);

    const formatted = data.map((stop) => ({
      id: stop.id,
      is_active: stop.is_active,
      latitude: stop.latitude,
      longitude: stop.longitude,
      name: stop.stop_name,
    }));

    setStops(formatted);
  }

  async function loadVehicleLocations() {
    try {
      const locations = await vehicleService.getVehicleLocations();
      setVehicleLocations(locations ?? []);
    } catch (error) {
      console.error("Vehicle location load error:", error);
    }
  }

  function openRoute(route: Route) {
    setSelectedRoute(route);
    void loadStops(route.id);
  }

  async function createRoute() {
    if (editingRouteId) {
      await routesService.updateRoute(editingRouteId, routeForm);
    } else {
      await routesService.createRoute(routeForm);
    }

    setRouteForm({
      end_location: "",
      route_name: "",
      start_location: "",
    });
    setEditingRouteId(null);
    setShowCreateRoute(false);
    await loadRoutes();
  }

  async function createStop() {
    if (!selectedRoute) {
      return;
    }

    if (editingStopId) {
      await stopsService.updateStop(editingStopId, {
        latitude: Number(stopForm.latitude),
        longitude: Number(stopForm.longitude),
        stop_name: stopForm.stop_name,
      });
    } else {
      await stopsService.createStop({
        latitude: Number(stopForm.latitude),
        longitude: Number(stopForm.longitude),
        route_id: selectedRoute.id,
        stop_name: stopForm.stop_name,
      });
    }

    setStopForm({ latitude: "", longitude: "", stop_name: "" });
    setEditingStopId(null);
    setShowCreateStop(false);
    await loadStops(selectedRoute.id);
  }

  async function reorderStops(newStops: RouteStop[]) {
    if (!selectedRoute) {
      return;
    }

    const previousStops = stops;
    setStops(newStops);

    const updates = newStops.map((stop, index) => ({
      id: stop.id,
      stop_order: index + 1,
    }));

    try {
      await stopsService.updateStopOrder(selectedRoute.id, updates);
    } catch {
      setStops(previousStops);
      alert("Failed to save stop order. Please try again.");
    }
  }

  async function publishRoute() {
    if (!selectedRoute) {
      return;
    }

    setConfirmTitle("Publish Route");
    setConfirmMessage("This will make the latest route changes visible to drivers and passengers.");
    setConfirmButton("Publish");
    setConfirmColor("bg-orange-600");

    setConfirmAction(() => async () => {
      setIsPublishing(true);
      await routesService.publishRoute(selectedRoute.id);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await loadStops(selectedRoute.id);
      await loadRoutes();

      setIsPublishing(false);
      setShowPublishSuccess(true);
    });

    setShowActionConfirm(true);
  }

  function deleteStop(id: string) {
    setConfirmTitle("Delete Stop");
    setConfirmMessage("Are you sure you want to delete this stop?");
    setConfirmButton("Delete");
    setConfirmColor("bg-red-600");

    setConfirmAction(() => async () => {
      await stopsService.deleteStop(id);
      if (selectedRoute) {
        await loadStops(selectedRoute.id);
      }
    });

    setShowActionConfirm(true);
  }

  function toggleStop(id: string, isActive: boolean) {
    setConfirmTitle(isActive ? "Activate Stop" : "Deactivate Stop");
    setConfirmMessage(
      isActive
        ? "This stop will become visible to passengers and drivers."
        : "This stop will be hidden from passengers and drivers.",
    );
    setConfirmButton(isActive ? "Activate" : "Deactivate");
    setConfirmColor(isActive ? "bg-green-600" : "bg-red-600");

    setConfirmAction(() => async () => {
      await stopsService.toggleStopStatus(id, isActive);
      if (selectedRoute) {
        await loadStops(selectedRoute.id);
      }
    });

    setShowActionConfirm(true);
  }

  function deleteRoute(id: string) {
    setConfirmTitle("Delete Route");
    setConfirmMessage("Are you sure you want to delete this route? All stops will also be removed.");
    setConfirmButton("Delete");
    setConfirmColor("bg-red-600");

    setConfirmAction(() => async () => {
      try {
        await routesService.deleteRoute(id);
        await loadRoutes();

        if (selectedRoute?.id === id) {
          setSelectedRoute(null);
          setStops([]);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete route.";
        alert(errorMessage);
      }
    });

    setShowActionConfirm(true);
  }

  function editRoute(route: Route) {
    setEditingRouteId(route.id);
    setRouteForm({
      end_location: route.end_location || "",
      route_name: route.route_name,
      start_location: route.start_location || "",
    });
    setShowCreateRoute(true);
  }

  function openEditStop(stop: RouteStop) {
    setEditingStopId(stop.id);
    setStopForm({
      latitude: String(stop.latitude ?? ""),
      longitude: String(stop.longitude ?? ""),
      stop_name: stop.name ?? "",
    });
    setShowCreateStop(true);
  }

  function handleMapRightClick(coords: StopCoords) {
    setPendingCoords(coords);
    setShowConfirm(true);
  }

  function confirmCoords() {
    if (!pendingCoords) {
      return;
    }

    setStopForm({
      ...stopForm,
      latitude: String(pendingCoords.latitude),
      longitude: String(pendingCoords.longitude),
    });
    setShowConfirm(false);
    setShowSelectMap(false);
  }

  useEffect(() => {
    void loadVehicleLocations();

    const interval = window.setInterval(() => {
      void loadVehicleLocations();
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    void loadRoutes();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (!target.closest(".route-menu")) {
        setRouteMenuOpen(null);
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/60">
              Route Builder
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Route & Stop Management
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Create routes, arrange stops, and preview the live network in a layout that stays usable
              on both mobile and desktop.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatPill label="Routes" value={routes.length} />
            <StatPill label="Stops" value={stops.length} />
            <StatPill label="Tracked vehicles" value={vehicleLocations.length} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.6fr)]">
        <section className="flex min-h-[320px] flex-col rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Routes</h2>
              <p className="text-sm text-slate-500">Choose a route to manage stops and map views.</p>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
              onClick={() => setShowCreateRoute(true)}
              type="button"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Route</span>
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
            {routes.map((route) => (
              <div
                key={route.id}
                className={`cursor-pointer rounded-[22px] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedRoute?.id === route.id
                    ? "border-orange-500 bg-orange-50/50"
                    : "border-slate-200 bg-white"
                }`}
                onClick={() => openRoute(route)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">{route.route_name}</h2>
                    <div className="mt-1 text-sm text-slate-500">
                      {route.start_location} {"->"} {route.end_location}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-xl border border-transparent p-2 text-orange-600 transition hover:border-orange-100 hover:bg-orange-50 hover:text-orange-800"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedRoute(route);
                        void loadStops(route.id);
                        setShowRouteMap(true);
                      }}
                      type="button"
                    >
                      <Map size={18} />
                    </button>

                    <div className="relative route-menu">
                      <button
                        className="rounded-xl border border-transparent p-2 text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                        onClick={(event) => {
                          event.stopPropagation();
                          setRouteMenuOpen(routeMenuOpen === route.id ? null : route.id);
                        }}
                        type="button"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {routeMenuOpen === route.id && (
                        <div className="absolute right-0 z-10 mt-2 w-40 rounded-2xl border border-slate-200 bg-white p-1 shadow-lg">
                          <button
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              editRoute(route);
                              setRouteMenuOpen(null);
                            }}
                            type="button"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteRoute(route.id);
                              setRouteMenuOpen(null);
                            }}
                            type="button"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex min-h-[320px] flex-col">
          {selectedRoute ? (
            <div className="flex flex-1 flex-col space-y-4">
              <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Active Route
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {selectedRoute.route_name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Manage stop order, publish updates, or open the route map.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                      onClick={() => setShowCreateStop(true)}
                      type="button"
                    >
                      <Plus size={16} />
                      Add Stop
                    </button>

                    <button
                      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition ${
                        isPublishing
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-orange-600 hover:bg-orange-700"
                      }`}
                      disabled={isPublishing}
                      onClick={() => void publishRoute()}
                      type="button"
                    >
                      {isPublishing ? "Publishing..." : "Publish Route"}
                    </button>
                  </div>
                </div>
              </section>

              <StopsTable
                onDelete={deleteStop}
                onEdit={openEditStop}
                onReorder={reorderStops}
                onToggle={toggleStop}
                stops={stops}
              />
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
              Select a route to display and manage its stops here.
            </div>
          )}
        </div>
      </div>

      {showCreateStop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-[26px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingStopId ? "Edit Stop" : "Create Stop"}
              </h2>
              <button
                className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                onClick={() => setShowCreateStop(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <input
              className="w-full rounded-2xl border border-slate-200 p-3"
              onChange={(event) => setStopForm({ ...stopForm, stop_name: event.target.value })}
              placeholder="Stop Name"
              value={stopForm.stop_name}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 p-3"
              onChange={(event) => setStopForm({ ...stopForm, latitude: event.target.value })}
              placeholder="Latitude"
              value={stopForm.latitude}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 p-3"
              onChange={(event) => setStopForm({ ...stopForm, longitude: event.target.value })}
              placeholder="Longitude"
              value={stopForm.longitude}
            />

            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => setShowSelectMap(true)}
              type="button"
            >
              <MapPin size={16} />
              Select From Map
            </button>

            <button
              className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              onClick={() => {
                setConfirmTitle(editingStopId ? "Save Changes" : "Create Stop");
                setConfirmMessage(
                  editingStopId
                    ? "Are you sure you want to update this stop?"
                    : "Are you sure you want to create this stop?",
                );
                setConfirmButton("Confirm");
                setConfirmColor("bg-blue-600");
                setConfirmAction(() => createStop);
                setShowActionConfirm(true);
              }}
              type="button"
            >
              {editingStopId ? "Save Changes" : "Save Stop"}
            </button>
          </div>
        </div>
      )}

      {showCreateRoute && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-[26px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingRouteId ? "Edit Route" : "Create Route"}
              </h2>
              <button
                className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                onClick={() => setShowCreateRoute(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <input
              className="w-full rounded-2xl border border-slate-200 p-3"
              onChange={(event) => setRouteForm({ ...routeForm, route_name: event.target.value })}
              placeholder="Route Name"
              value={routeForm.route_name}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 p-3"
              onChange={(event) => setRouteForm({ ...routeForm, start_location: event.target.value })}
              placeholder="Start Terminal"
              value={routeForm.start_location}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 p-3"
              onChange={(event) => setRouteForm({ ...routeForm, end_location: event.target.value })}
              placeholder="End Terminal"
              value={routeForm.end_location}
            />

            <button
              className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              onClick={() => {
                setConfirmTitle("Confirm");
                setConfirmMessage("Are you sure you want to save this route?");
                setConfirmButton("Save");
                setConfirmColor("bg-blue-600");
                setConfirmAction(() => createRoute);
                setShowActionConfirm(true);
              }}
              type="button"
            >
              Save Route
            </button>
          </div>
        </div>
      )}

      {showRouteMap && selectedRoute && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="flex h-[min(88vh,760px)] w-full max-w-6xl flex-col space-y-3 rounded-[28px] bg-white p-4 shadow-xl sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">{selectedRoute.route_name} Stops</h2>
              <button
                className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                onClick={() => setShowRouteMap(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-[22px] border border-slate-100">
              <SharedMap
                bearing={100}
                initialCenter={defaultCenter}
                initialZoom={11.5}
                stops={selectedRoute ? mapStops : []}
                vehicles={vehicleLocations}
              />
            </div>
          </div>
        </div>
      )}

      {showSelectMap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="flex h-[min(88vh,700px)] w-full max-w-4xl flex-col space-y-3 rounded-[28px] bg-white p-4 shadow-xl sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">Select Coordinate</h2>
              <button
                className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                onClick={() => setShowSelectMap(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-[22px] border border-slate-100">
              <SharedMap
                initialCenter={defaultCenter}
                onRightClick={(coords) => handleMapRightClick(coords)}
                stops={[]}
              />
            </div>
          </div>
        </div>
      )}

      {showConfirm && pendingCoords && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-md space-y-4 rounded-[24px] bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900">Confirm Coordinate</h2>
            <p className="text-sm text-slate-600">Use this coordinate for the stop?</p>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Lat: {pendingCoords.latitude} | Lng: {pendingCoords.longitude}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setShowConfirm(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                onClick={confirmCoords}
                type="button"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showPublishSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-4 rounded-[24px] bg-white p-6 text-center shadow-xl">
            <h2 className="text-lg font-semibold text-green-600">Publish Complete</h2>
            <p className="text-sm text-slate-600">
              The updated route is now visible to drivers and passengers.
            </p>
            <button
              className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              onClick={() => setShowPublishSuccess(false)}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showActionConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowActionConfirm(false)}>
          <div className="w-full max-w-md space-y-4 rounded-[24px] bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900">{confirmTitle}</h2>
            <p className="text-sm text-slate-600">{confirmMessage}</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setShowActionConfirm(false)}
                type="button"
              >
                Cancel
              </button>

              <button
                className={`rounded-2xl px-4 py-2 text-sm font-medium text-white ${confirmColor}`}
                onClick={async () => {
                  if (!confirmAction) {
                    return;
                  }

                  try {
                    showLoading();
                    await confirmAction();
                  } finally {
                    hideLoading();
                    setShowActionConfirm(false);
                  }
                }}
                type="button"
              >
                {confirmButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type StatPillProps = {
  label: string;
  value: number;
};

function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
