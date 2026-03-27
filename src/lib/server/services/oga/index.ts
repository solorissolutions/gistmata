import "server-only";

import type { Viewer } from "@/lib/domain/types";
import {
  fetchOgaDashboardSnapshot,
  pinGistRecord,
  unpinGistRecord,
} from "@/lib/server/repositories/oga-repository";

export async function getOgaDashboardSnapshot() {
  return fetchOgaDashboardSnapshot();
}

export async function getOgaOverviewBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.overview;
}

export async function getOgaMataMonitorBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.mata;
}

export async function getOgaMattersBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.matters;
}

export async function getOgaUsersBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.users;
}

export async function getOgaGrowthBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.growth;
}

export async function getOgaLocationHealthBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.location;
}

export async function getOgaInboxBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.inbox;
}

export async function getOgaJudgementDayBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.judgementDay;
}

export async function getOgaBroadcastBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.broadcast;
}

export async function pinGist(gistId: string, priority: 1 | 2 | 3, oga: Viewer) {
  return pinGistRecord({
    ogaId: oga.id,
    gistId,
    priority,
  });
}

export async function unpinGist(gistId: string, oga: Viewer) {
  return unpinGistRecord({
    ogaId: oga.id,
    gistId,
  });
}

export async function reorderPinnedGists(gistId: string, priority: 1 | 2 | 3, oga: Viewer) {
  return pinGist(gistId, priority, oga);
}
