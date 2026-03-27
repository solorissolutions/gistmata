import { Trophy } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { LeaderboardEntry } from "@/lib/domain/types";

export function LeaderboardList({
  entries,
  title = "Leaderboard",
}: {
  entries: LeaderboardEntry[];
  title?: string;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[var(--gm-green)]" />
        <h3 className="text-lg font-extrabold tracking-[-0.04em]">{title}</h3>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
          >
            <div>
              <div className="text-sm font-semibold">
                {entry.rank}. @{entry.username}
              </div>
              <div className="text-xs text-[var(--gm-ink-soft)]">
                {entry.tier} · {entry.state}
              </div>
            </div>
            <div className="text-sm font-bold">{entry.points} pts</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
