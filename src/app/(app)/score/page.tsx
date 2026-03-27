import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";
import { LeaderboardList } from "@/components/blocks/leaderboard-list";
import { requireUser } from "@/lib/server/services/auth";
import { getUserScoreBundle } from "@/lib/server/services/score";

export default async function ScorePage() {
  const viewer = await requireUser();
  const data = await getUserScoreBundle(viewer);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        eyebrow="Score"
        title={`${viewer.pointsBalance} GistPoints`}
        description="Points, tiers, and momentum. No vanity profile, just contribution history."
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="muted-label">Current tier</p>
              <h2 className="text-3xl font-extrabold tracking-[-0.05em]">
                {data.progress.current.tier}
              </h2>
            </div>
            <Badge>{viewer.username}</Badge>
          </div>
          <div className="space-y-2">
            <div className="h-3 rounded-full bg-[var(--gm-green-soft)]">
              <div
                className="h-3 rounded-full bg-[var(--gm-green)]"
                style={{ width: `${Math.round(data.progress.progress * 100)}%` }}
              />
            </div>
            <p className="text-sm text-[var(--gm-ink-soft)]">
              {data.progress.next
                ? `${data.progress.pointsToNext} points to ${data.progress.next.tier}`
                : "Top tier reached."}
            </p>
          </div>
          <div className="space-y-3">
            {data.history.slice(0, 8).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{entry.eventType}</p>
                  <p className="text-xs text-[var(--gm-ink-soft)]">{entry.createdAt}</p>
                </div>
                <div className="font-bold">+{entry.pointsDelta}</div>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <LeaderboardList entries={data.leaderboardTeaser} title="Monthly leaders" />
          <Card className="space-y-3">
            <p className="muted-label">More</p>
            <div className="space-y-2 text-sm font-semibold">
              <Link
                href="/score/leaderboard"
                className="block rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
              >
                Full leaderboard
              </Link>
              <Link
                href="/score/tiers"
                className="block rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
              >
                Tier explainer
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
