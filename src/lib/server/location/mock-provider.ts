import { NIGERIA_LOCATION_POINTS } from "@/lib/server/location/nigeria-points";
import type {
  LocationProvider,
  LocationResolverInput,
  ResolvedLocation,
} from "@/lib/server/location/provider";

function distance(left: { lat: number; lng: number }, right: { lat: number; lng: number }) {
  return Math.sqrt(
    Math.pow(left.lat - right.lat, 2) + Math.pow(left.lng - right.lng, 2),
  );
}

function fallbackByState(stateName?: string) {
  return (
    NIGERIA_LOCATION_POINTS.find((point) => point.stateName === stateName) ??
    NIGERIA_LOCATION_POINTS.find((point) => point.stateName === "FCT")!
  );
}

function toResolvedLocation(
  point: (typeof NIGERIA_LOCATION_POINTS)[number],
  fallbackUsed: boolean,
): ResolvedLocation {
  return {
    displayLocality: point.displayLocality,
    areaBucket: point.areaBucket,
    admin2Name: point.admin2Name,
    admin2Type: point.admin2Type,
    stateName: point.stateName,
    confidenceScore: fallbackUsed ? 0.68 : point.confidenceScore,
    provider: "mock",
    providerLabel: "Mock Nigeria localities",
    fallbackUsed,
  };
}

export function resolveMockLocation(input: LocationResolverInput): ResolvedLocation {
  if (
    typeof input.latitude !== "number" ||
    typeof input.longitude !== "number" ||
    Number.isNaN(input.latitude) ||
    Number.isNaN(input.longitude)
  ) {
    return toResolvedLocation(fallbackByState(input.homeState), true);
  }

  const nearest = NIGERIA_LOCATION_POINTS.slice().sort((left, right) => {
    const leftDistance = distance(
      { lat: input.latitude!, lng: input.longitude! },
      { lat: left.lat, lng: left.lng },
    );
    const rightDistance = distance(
      { lat: input.latitude!, lng: input.longitude! },
      { lat: right.lat, lng: right.lng },
    );
    return leftDistance - rightDistance;
  })[0];

  return toResolvedLocation(nearest, false);
}

export const mockLocationProvider: LocationProvider = {
  key: "mock",
  label: "Mock Nigeria localities",
  async resolve(input) {
    return resolveMockLocation(input);
  },
};
