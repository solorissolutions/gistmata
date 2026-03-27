import type {
  LocationProvider,
  LocationResolverInput,
} from "@/lib/server/location/provider";
import { resolveMockLocation } from "@/lib/server/location/mock-provider";

export const googleLocationProvider: LocationProvider = {
  key: "google",
  label: "Google adapter placeholder",
  async resolve(input: LocationResolverInput) {
    const resolved = resolveMockLocation(input);

    return {
      ...resolved,
      provider: "google-placeholder",
      providerLabel: process.env.GOOGLE_MAPS_API_KEY
        ? "Google adapter placeholder"
        : "Google adapter placeholder (mock fallback)",
      fallbackUsed: true,
    };
  },
};
