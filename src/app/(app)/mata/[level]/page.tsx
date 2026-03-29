import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FeedTabs } from "@/components/gist/feed-tabs";
import { FeedSortToggle } from "@/components/gist/feed-sort-toggle";
import { GistCard } from "@/components/gist/gist-card";
import { TopicFilters } from "@/components/gist/topic-filters";
import { requireUser } from "@/lib/server/services/auth";
import { getFeedBundle } from "@/lib/server/services/mata";
import { slugToLabel } from "@/lib/utils";

const VALID_LEVELS = ["my-area", "state", "nigeria", "hot"] as const;

export default async function MataLevelPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ tag?: string; sort?: "smart" | "recent" }>;
}) {
  const viewer = await requireUser();
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const level = resolvedParams.level;

  if (!VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
    notFound();
  }

  const tag = resolvedSearch.tag ?? "All";
  const sort = resolvedSearch.sort === "recent" ? "recent" : "smart";

  const data = await getFeedBundle(
    level as "my-area" | "state" | "nigeria" | "hot",
    { tag, sort },
    viewer,
  );

  const levelPath = `/mata/${level}`;

  return (
    <div className="flex flex-col">
      {/* Sticky header with tabs */}
      <FeedTabs active={level} />

      {/* Topic filters */}
      <TopicFilters active={tag} levelPath={levelPath} />

      {/* Sort toggle */}
      <FeedSortToggle active={sort} levelPath={levelPath} tag={tag} />

      {/* Feed stats */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="text-[13px] text-[var(--secondary)]">
          {data.feedSummary.totalCount} gists · {data.feedSummary.freshCount} fresh today
        </div>
        <div className="text-[13px] font-semibold text-[var(--accent)]">
          {slugToLabel(level)}
        </div>
      </div>

      {/* Feed */}
      <div>
        {/* Pinned gists */}
        {data.pinnedGists.map((gist) => (
          <GistCard key={gist.id} gist={gist} />
        ))}

        {/* Empty state */}
        {data.gists.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[20px] font-bold">Nothing dey here yet.</p>
            <p className="mt-2 text-[15px] text-[var(--secondary)]">
              Change tag, try another Mata level, or drop a fresh Gist.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href="/mata">
                <Button variant="secondary" size="sm">My Street</Button>
              </Link>
              <Link href="/mata/my-area">
                <Button variant="secondary" size="sm">My Area</Button>
              </Link>
              <Link href="/mata/nigeria">
                <Button variant="secondary" size="sm">National</Button>
              </Link>
              <Link href="/drop">
                <Button size="sm">Drop Gist</Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Regular gists */
          data.gists.map((gist) => <GistCard key={gist.id} gist={gist} />)
        )}
      </div>
    </div>
  );
}
