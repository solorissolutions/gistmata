import "server-only";

import type { Viewer } from "@/lib/domain/types";
import {
  getLocationProvider,
  resolveLocationSnapshot,
} from "@/lib/server/repositories/location-repository";

export async function resolvePostingLocation(
  input: { latitude?: number; longitude?: number },
  viewer: Viewer,
) {
  return resolveLocationSnapshot({
    latitude: input.latitude,
    longitude: input.longitude,
    homeState: viewer.homeState,
  });
}

export function getDisplayLocationForGist(viewer: Viewer) {
  return viewer.location ?? null;
}

export function getViewerLocationContext(viewer: Viewer) {
  return {
    provider: getLocationProvider(),
    homeState: viewer.homeState,
    location: viewer.location,
  };
}
