import "server-only";

import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";

export async function getOgaPreIntelBundle(filters?: { q?: string }) {
  const snapshot = await fetchOgaDashboardSnapshot();
  const q = filters?.q?.trim().toLowerCase() ?? "";

  const matterMatches = snapshot.preIntel.searchable.matters
    .filter((matter) => {
      if (!q) {
        return false;
      }

      return [
        matter.label,
        matter.tag,
        matter.areaDisplay,
        matter.stateName,
        matter.owner,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    })
    .slice(0, 8);

  const userMatches = snapshot.preIntel.searchable.users
    .filter((user) => {
      if (!q) {
        return false;
      }

      return [
        user.label,
        user.state,
        user.areaDisplay ?? "",
        user.trustState,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    })
    .slice(0, 8);

  return {
    summary: snapshot.preIntel.summary,
    heatMap: snapshot.preIntel.heatMap,
    referralGraph: snapshot.preIntel.referralGraph,
    trendAlerts: snapshot.preIntel.trendAlerts,
    profileClusters: snapshot.preIntel.profileClusters,
    filters: {
      q: filters?.q ?? "",
    },
    search: {
      matterMatches,
      userMatches,
    },
  };
}
