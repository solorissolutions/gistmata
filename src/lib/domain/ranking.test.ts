import { describe, it, expect } from "vitest";

import { getTierProgress, buildLeaderboardFromLedger } from "@/lib/domain/ranking";

describe("ranking helpers", () => {
  it("calculates tier progress", () => {
    const progress = getTierProgress(200);
    expect(progress.current.tier).toBe("Area Voice");
    expect(progress.next?.tier).toBe("Street OG");
    expect(progress.pointsToNext).toBeGreaterThan(0);
  });

  it("builds leaderboard entries", () => {
    const entries = buildLeaderboardFromLedger({
      users: [
        { id: "a", username: "Alpha", tier: "Area Voice", homeState: "FCT", pointsBalance: 120 },
        { id: "b", username: "Beta", tier: "Street OG", homeState: "Kano", pointsBalance: 340 },
      ],
      ledger: [
        { id: "1", userId: "a", eventType: "join", pointsDelta: 20, metadata: {}, createdAt: new Date().toISOString() },
        { id: "2", userId: "b", eventType: "drop-gist", pointsDelta: 40, metadata: {}, createdAt: new Date().toISOString() },
      ],
      mode: "monthly",
    });

    expect(entries[0]?.userId).toBe("b");
    expect(entries[0]?.rank).toBe(1);
  });
});
