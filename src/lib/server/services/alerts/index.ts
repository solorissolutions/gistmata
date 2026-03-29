import "server-only";

import type { BroadcastCreationInput } from "@/lib/contracts/service-layer";
import type { Viewer } from "@/lib/domain/types";
import {
  createBroadcastRecord,
  fetchAlertsBundle,
} from "@/lib/server/repositories/alerts-repository";

export async function getUserAlertsBundle(viewer: Viewer) {
  try {
    return await fetchAlertsBundle(viewer.id);
  } catch {
    return { viewer, groupedAlerts: [] };
  }
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
