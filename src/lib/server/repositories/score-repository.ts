import "server-only";

import { getLeaderboardBundle, getScoreBundle } from "@/lib/server/store";

export async function fetchScoreBundle(viewerId: string) {
  return getScoreBundle(viewerId);
}

export async function fetchLeaderboardBundle(mode: "monthly" | "all-time") {
  return getLeaderboardBundle(mode);
}
