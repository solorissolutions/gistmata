import "server-only";

import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";

export async function getOgaOverviewBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();

  return {
    overview: snapshot.overview,
    chrome: snapshot.chrome,
    routeMap: snapshot.routeMap,
  };
}

export async function getPlatformPulseBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.overview;
}
