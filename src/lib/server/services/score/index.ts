import "server-only";

import type { TierBenefitsBundle } from "@/lib/contracts/service-layer";
import type { UserTier, Viewer } from "@/lib/domain/types";
import { EXTRA_ALLOWANCE_RULE, TIER_BENEFITS } from "@/lib/domain/constants";
import { getTierProgress } from "@/lib/domain/ranking";
import {
  fetchLeaderboardBundle,
  fetchScoreBundle,
} from "@/lib/server/repositories/score-repository";

export async function getUserScoreBundle(viewer: Viewer) {
  try {
    return await fetchScoreBundle(viewer.id);
  } catch {
    return {
      viewer,
      progress: getTierProgress(viewer.pointsBalance),
      history: [],
      leaderboardTeaser: [],
    };
  }
}

export async function getLeaderboardBundle(mode: "monthly" | "all-time") {
  return fetchLeaderboardBundle(mode);
}

export function getTierBenefits(tier: UserTier): TierBenefitsBundle {
  return {
    tier,
    ...TIER_BENEFITS[tier],
  };
}

export function getPostingAllowance(viewer: Viewer) {
  const extraAllowance = Math.floor(viewer.pointsBalance / 10000);

  return {
    rule: EXTRA_ALLOWANCE_RULE,
    total: 5 + extraAllowance,
    extraAllowance,
  };
}
