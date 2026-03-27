import "server-only";

import type { BroadcastCreationInput } from "@/lib/contracts/service-layer";
import type { Viewer } from "@/lib/domain/types";
import {
  createBroadcastRecord,
  fetchAlertsBundle,
} from "@/lib/server/repositories/alerts-repository";
import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";

export async function getUserAlertsBundle(viewer: Viewer) {
  return fetchAlertsBundle(viewer.id);
}

export async function createBroadcast(input: BroadcastCreationInput, oga: Viewer) {
  return createBroadcastRecord({
    ogaId: oga.id,
    audience: input.audience,
    stateName: input.stateName,
    title: input.title,
    body: input.body,
    link: input.link,
  });
}

export async function createInactivityWarnings() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.broadcast.audienceEstimates.inactive;
}

export async function getBroadcastHistory() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.broadcast.broadcastTrail;
}
