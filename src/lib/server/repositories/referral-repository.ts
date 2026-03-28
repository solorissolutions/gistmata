import "server-only";

import {
  generateReferralCodes,
  getUserReferralsBundle,
} from "@/lib/server/store";

export async function fetchUserReferralBundle(viewerId: string) {
  return getUserReferralsBundle(viewerId);
}

export async function createReferralBatch(ogaId: string, count: number) {
  return generateReferralCodes(ogaId, count);
}
