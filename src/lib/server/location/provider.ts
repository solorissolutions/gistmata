import type { LocationSnapshot } from "@/lib/domain/types";

export type LocationResolverInput = {
  latitude?: number;
  longitude?: number;
  homeState?: string;
};

export type ResolvedLocation = LocationSnapshot & {
  provider: string;
  providerLabel: string;
  fallbackUsed: boolean;
};

export interface LocationProvider {
  key: string;
  label: string;
  resolve(input: LocationResolverInput): Promise<ResolvedLocation>;
}
