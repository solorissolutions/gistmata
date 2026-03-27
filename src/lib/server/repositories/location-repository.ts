import "server-only";

import { getLocationProviderInfo, resolveLocation } from "@/lib/server/location";

export async function resolveLocationSnapshot(input: {
  latitude?: number;
  longitude?: number;
  homeState: string;
}) {
  return resolveLocation(input);
}

export function getLocationProvider() {
  return getLocationProviderInfo();
}
