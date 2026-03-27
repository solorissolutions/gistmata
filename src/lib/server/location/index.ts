import { googleLocationProvider } from "@/lib/server/location/google-provider";
import { mockLocationProvider } from "@/lib/server/location/mock-provider";
import type {
  LocationProvider,
  LocationResolverInput,
} from "@/lib/server/location/provider";

function getConfiguredProvider(): LocationProvider {
  const configured = (process.env.LOCATION_PROVIDER ?? "mock").toLowerCase();

  if (configured === "google") {
    return googleLocationProvider;
  }

  return mockLocationProvider;
}

export function getLocationProviderInfo() {
  const provider = getConfiguredProvider();

  return {
    key: provider.key,
    label: provider.label,
  };
}

export async function resolveLocation(input: LocationResolverInput) {
  return getConfiguredProvider().resolve(input);
}
