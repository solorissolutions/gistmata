import "server-only";

import type { FeedBundleFilters } from "@/lib/contracts/service-layer";
import type { FeedLevel, Viewer } from "@/lib/domain/types";
import { fetchFeedBundle } from "@/lib/server/repositories/mata-repository";

export async function getFeedBundle(
  level: FeedLevel,
  filters: FeedBundleFilters,
  viewer: Viewer,
) {
  return fetchFeedBundle({
    viewerId: viewer.id,
    level,
    tag: filters.tag ?? "All",
    sort: filters.sort ?? "smart",
  });
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
