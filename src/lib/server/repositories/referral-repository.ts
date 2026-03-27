import "server-only";

import {
  generateReferralCodes,
  generateUserReferralCode,
  getUserReferralsBundle,
} from "@/lib/server/store";

export async function fetchUserReferralBundle(viewerId: string) {
  return getUserReferralsBundle(viewerId);
}

export async function createUserReferralCode(viewerId: string) {
  return generateUserReferralCode(viewerId);
}

export async function createReferralBatch(ogaId: string, count: number) {
  return generateReferralCodes(ogaId, count);
}
