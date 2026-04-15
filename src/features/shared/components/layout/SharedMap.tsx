import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Feature, LineString } from "geojson";
import { LoaderPinwheelIcon, RotateCcw } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapVehicle } from "@/features/types/operations";

type Stop = {
  id?: string;
  latitude: number | null;
  longitude: number | null;
  name?: string;
};

type SharedMapProps = {
  stops?: Stop[];
  vehicles?: MapVehicle[];
  initialCenter: {
    latitude: number;
    longitude: number;
  };
  initialZoom?: number;
  bearing?: number;
  onRightClick?: (coords: { latitude: number; longitude: number }) => void;
};

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasValidCoordinatePair<T extends { latitude: unknown; longitude: unknown }>(
  value: T,
): value is T & { latitude: number; longitude: number } {
  return isFiniteCoordinate(value.latitude) && isFiniteCoordinate(value.longitude);
}

export default function SharedMap({
  stops = [],
  vehicles = [],
  initialCenter,
  initialZoom = 12,
  bearing = 0,
  onRightClick,
}: SharedMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [routeGeoJson, setRouteGeoJson] = useState<Feature<LineString> | null>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const canRenderInteractiveMap = typeof mapboxToken === "string" && mapboxToken.trim().length > 0;
  const validStops = useMemo(
    () => stops.filter(hasValidCoordinatePair),
    [stops],
  );
  const validVehicles = useMemo(
    () => vehicles.filter(hasValidCoordinatePair),
    [vehicles],
  );

  const handleRightClick = (event: MapLayerMouseEvent) => {
    event.preventDefault();

    onRightClick?.({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    });
  };

  const flyToLocation = (latitude: number, longitude: number) => {
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: 15,
      duration: 800,
    });
  };

  const resetCamera = () => {
    mapRef.current?.flyTo({
      center: [initialCenter.longitude, initialCenter.latitude],
      zoom: initialZoom,
      bearing,
      duration: 800,
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchRoute = async () => {
      if (validStops.length < 2 || !canRenderInteractiveMap) {
        setRouteGeoJson(null);
        return;
      }

      try {
        const coordinates = validStops
          .map((stop) => `${stop.longitude},${stop.latitude}`)
          .join(";");

        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}` +
          `?geometries=geojson&overview=full&access_token=${mapboxToken}`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Mapbox directions request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
          if (!controller.signal.aborted) {
            setRouteGeoJson(null);
          }
          return;
        }

        if (!controller.signal.aborted) {
          setRouteGeoJson({
            type: "Feature",
            properties: {},
            geometry: data.routes[0].geometry,
          });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Route fetch error:", error);
        if (!controller.signal.aborted) {
          setRouteGeoJson(null);
        }
      }
    };

    void fetchRoute();
    return () => controller.abort();
  }, [canRenderInteractiveMap, mapboxToken, validStops]);

  if (!canRenderInteractiveMap) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 px-6 text-center text-sm text-slate-500">
        Map preview is unavailable because `VITE_MAPBOX_TOKEN` is missing.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: initialCenter.latitude,
          longitude: initialCenter.longitude,
          zoom: initialZoom,
          bearing,
        }}
        onMove={(event) => setZoom(event.viewState.zoom)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        onContextMenu={handleRightClick}
      >
        <NavigationControl position="top-left" />

        {routeGeoJson && (
          <Source id="route-line" type="geojson" data={routeGeoJson}>
            <Layer
              id="route-line-layer"
              type="line"
              paint={{
                "line-color": "#020ebb",
                "line-width": 2,
                "line-opacity": 0.9,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
          </Source>
        )}

        {validStops.map((stop, index) => (
          <Marker
            key={stop.id || index}
            latitude={stop.latitude}
            longitude={stop.longitude}
            anchor="bottom"
          >
            <div
              onClick={() => flyToLocation(stop.latitude, stop.longitude)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") flyToLocation(stop.latitude, stop.longitude); }}
              role="button"
              tabIndex={0}
              className="flex cursor-pointer flex-col items-center"
            >
              {zoom >= 15 && stop.name && (
                <span className="mt-1 whitespace-nowrap rounded bg-white px-2 py-1 text-xs shadow">
                  {stop.name}
                </span>
              )}

              <LoaderPinwheelIcon
                className="h-3 w-3 text-red-600 drop-shadow-lg transition hover:scale-110"
                strokeWidth={2}
              />
            </div>
          </Marker>
        ))}

        {validVehicles.map((vehicle) => {
          const driverLabel = vehicle.driver ?? vehicle.driver_name;

          return (
            <Marker
              key={vehicle.vehicle_id}
              latitude={vehicle.latitude}
              longitude={vehicle.longitude}
              anchor="bottom"
            >
              <div
                onClick={() => flyToLocation(vehicle.latitude, vehicle.longitude)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") flyToLocation(vehicle.latitude, vehicle.longitude); }}
                role="button"
                tabIndex={0}
                className="flex cursor-pointer flex-col items-center"
              >
                {zoom >= 15 && (
                  <span className="mb-1 whitespace-nowrap rounded bg-blue-600 px-2 py-1 text-xs text-white shadow">
                    {vehicle.plate_number || "Vehicle"}
                    {driverLabel ? ` | ${driverLabel}` : ""}
                  </span>
                )}

                <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md"></div>
              </div>
            </Marker>
          );
        })}
      </Map>

      <button
        onClick={resetCamera}
        title="Reset Map View"
        className="absolute right-3 top-3 z-20 flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 shadow-md transition hover:bg-gray-100"
      >
        <RotateCcw size={18} className="text-gray-700" />
      </button>
    </div>
  );
}
