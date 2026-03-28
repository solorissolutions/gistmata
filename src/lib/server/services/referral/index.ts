import "server-only";

import type { Viewer } from "@/lib/domain/types";
import {
  createReferralBatch,
  fetchUserReferralBundle,
} from "@/lib/server/repositories/referral-repository";
import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";

export async function generateReferralBatch(count: number, viewer: Viewer) {
  if (!viewer.isOga) {
    throw new Error("Only oga can generate referral batches.");
  }

  return createReferralBatch(viewer.id, count);
}

export async function getUserReferralBundle(viewer: Viewer) {
  return fetchUserReferralBundle(viewer.id);
}

export async function getOgaReferralMetrics() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.growth;
}
