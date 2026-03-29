import "server-only";

import type { FeedBundleFilters } from "@/lib/contracts/service-layer";
import type { FeedLevel, Viewer } from "@/lib/domain/types";
import { fetchFeedBundle } from "@/lib/server/repositories/mata-repository";

export async function getFeedBundle(
  level: FeedLevel,
  filters: FeedBundleFilters,
  viewer: Viewer,
) {
  try {
    return await fetchFeedBundle({
      viewerId: viewer.id,
      level,
      tag: filters.tag ?? "All",
      sort: filters.sort ?? "smart",
    });
  } catch {
    return {
      viewer,
      level,
      sort: (filters.sort ?? "smart") as "smart" | "recent",
      gists: [],
      pinnedGists: [],
      feedSummary: {
        totalCount: 0,
        freshCount: 0,
        localLabel: viewer.location?.displayLocality ?? viewer.homeState,
        broaderAreaLabel: viewer.location?.admin2Name ?? viewer.homeState,
        coverageText: "",
        hotspotArea: viewer.location?.displayLocality ?? viewer.homeState,
        spotlightTag: "General" as const,
        nearbyMovement: [] as Array<[string, number]>,
        topAreas: [] as Array<[string, number]>,
      },
      leaderboardTeaser: [],
      flags: {} as Record<string, boolean>,
    };
  }
}

export async function getHotFeedBundle(viewer: Viewer) {
  return getFeedBundle("hot", {}, viewer);
}

export async function getAreaFeedBundle(viewer: Viewer) {
  return getFeedBundle("my-area", {}, viewer);
}

export async function getFeedContext(viewer: Viewer) {
  return {
    viewerId: viewer.id,
    state: viewer.homeState,
    location: viewer.location,
  };
}
