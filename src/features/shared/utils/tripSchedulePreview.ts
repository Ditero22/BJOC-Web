export type RouteStopPoint = {
  latitude?: number | string | null;
  longitude?: number | string | null;
  stop_order?: number | null;
  stop_name?: string | null;
};

type RouteRecord = {
  end_location?: string | null;
  route_name?: string | null;
  start_location?: string | null;
};

const BASE_FARE = 15;
const FARE_STEP_AMOUNT = 5;

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function haversineDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLatitude = toRadians(latitude2 - latitude1);
  const dLongitude = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(dLongitude / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateRouteDistanceKm(stops: RouteStopPoint[]) {
  const orderedStops = [...stops]
    .filter((stop) => toNumber(stop.latitude) !== null && toNumber(stop.longitude) !== null)
    .sort((left, right) => (left.stop_order ?? Number.MAX_SAFE_INTEGER) - (right.stop_order ?? Number.MAX_SAFE_INTEGER));

  if (orderedStops.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let index = 0; index < orderedStops.length - 1; index += 1) {
    const currentStop = orderedStops[index];
    const nextStop = orderedStops[index + 1];
    const currentLatitude = toNumber(currentStop.latitude);
    const currentLongitude = toNumber(currentStop.longitude);
    const nextLatitude = toNumber(nextStop.latitude);
    const nextLongitude = toNumber(nextStop.longitude);

    if (
      currentLatitude === null ||
      currentLongitude === null ||
      nextLatitude === null ||
      nextLongitude === null
    ) {
      continue;
    }

    totalDistance += haversineDistanceKm(
      currentLatitude,
      currentLongitude,
      nextLatitude,
      nextLongitude,
    );
  }

  return Number(totalDistance.toFixed(2));
}

export function calculateRouteFare(stops: RouteStopPoint[]) {
  const distanceKm = calculateRouteDistanceKm(stops);
  const roundedDistanceKm = Math.max(1, Math.ceil(Math.max(0, distanceKm)));
  return BASE_FARE + Math.max(0, roundedDistanceKm - 1) * FARE_STEP_AMOUNT;
}

export function formatRouteFare(fare: number | null | undefined) {
  if (typeof fare !== "number" || Number.isNaN(fare)) {
    return "Unavailable";
  }

  return `PHP ${fare.toFixed(2)}`;
}

export function resolveRouteEndpoints(route: RouteRecord | null | undefined, stops: RouteStopPoint[] = []) {
  const orderedStops = [...stops].sort(
    (left, right) => (left.stop_order ?? Number.MAX_SAFE_INTEGER) - (right.stop_order ?? Number.MAX_SAFE_INTEGER),
  );
  const firstStop = orderedStops[0]?.stop_name?.trim();
  const lastStop = orderedStops[orderedStops.length - 1]?.stop_name?.trim();

  return {
    dropOff: route?.end_location?.trim() || lastStop || "Auto from route",
    pickup: route?.start_location?.trim() || firstStop || "Auto from route",
    routeName: route?.route_name?.trim() || "Selected route",
  };
}
