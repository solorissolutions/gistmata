import Link from "next/link";

import { PageWithContextRail } from "@/components/app-shell/page-with-context-rail";
import { PageHeader } from "@/components/blocks/page-header";
import { BackButton } from "@/components/blocks/back-button";
import { LeaderboardList } from "@/components/blocks/leaderboard-list";
import { getLeaderboardBundle } from "@/lib/server/services/score";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const mode = resolvedSearch.mode === "all-time" ? "all-time" : "monthly";
  const entries = await getLeaderboardBundle(mode);

  return (
    <PageWithContextRail
      storageKey="gm-score-leaderboard-context-collapsed"
      mobileLabel="Leaderboard context"
      sections={[
        {
          id: "meaning",
          title: "What this means",
          defaultOpen: true,
          content: (
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              This leaderboard shows points + tier only. No follow graph, no profile culture.
            </p>
          ),
        },
        {
          id: "privacy",
          title: "Privacy",
          content: (
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              Your gist location context is about the post, not your identity.
            </p>
          ),
        },
      ]}
      main={
        <div className="space-y-5">
          <BackButton fallbackHref="/score" />
          <PageHeader
            eyebrow="Score"
            title={mode === "monthly" ? "Monthly leaderboard" : "All-time leaderboard"}
            description="Tiers and points only. No followers, no public profile theatre."
            actions={
              <div className="flex gap-2">
                <Link
                  href="/score/leaderboard?mode=monthly"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
                >
                  Monthly
                </Link>
                <Link
                  href="/score/leaderboard?mode=all-time"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
                >
                  All-time
                </Link>
              </div>
            }
          />
          <LeaderboardList entries={entries} />
        </div>
      }
    />
  );
}
