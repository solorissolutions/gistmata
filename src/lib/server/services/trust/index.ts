import "server-only";

import type { Viewer } from "@/lib/domain/types";
import { reportSchema } from "@/lib/domain/validation";
import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";
import {
  createReport,
  updateGistStatus,
} from "@/lib/server/repositories/trust-repository";

export function runDraftSafetyChecks() {
  return {
    personalDataRisk: false,
    fakeLocationRisk: false,
    allowed: true,
  };
}

export async function submitReport(input: {
  gistId: string;
  type: "general" | "personal-data" | "fake-location";
  reasonText?: string;
}, viewer: Viewer) {
  const validated = reportSchema.parse(input);

  return createReport({
    viewerId: viewer.id,
    gistId: validated.gistId,
    type: validated.type,
    reasonText: validated.reasonText,
  });
}

export async function getModerationQueue() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.trust.queue;
}

export async function removeGist(gistId: string, oga: Viewer) {
  return updateGistStatus({
    ogaId: oga.id,
    gistId,
    status: "removed",
  });
}

export async function restoreGist(gistId: string, oga: Viewer) {
  return updateGistStatus({
    ogaId: oga.id,
    gistId,
    status: "active",
  });
}

export async function evaluateTrustRisk(userId: string) {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.users.items.find((user) => user.id === userId) ?? null;
}

export async function getUserTrustSummary(userId: string) {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.users.items.find((user) => user.id === userId) ?? null;
}
