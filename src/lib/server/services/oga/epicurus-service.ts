import "server-only";

import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";

export async function getEpicurusBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.epicurus;
}
