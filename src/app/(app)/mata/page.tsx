import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FeedTabs } from "@/components/gist/feed-tabs";
import { FeedSortToggle } from "@/components/gist/feed-sort-toggle";
import { GistCard } from "@/components/gist/gist-card";
import { TopicFilters } from "@/components/gist/topic-filters";
import { requireUser } from "@/lib/server/services/auth";
import { getFeedBundle } from "@/lib/server/services/mata";

export default async function MataPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; sort?: "smart" | "recent" }>;
}) {
  const viewer = await requireUser();
  const resolvedSearch = await searchParams;
  const tag = resolvedSearch.tag ?? "All";
  const sort = resolvedSearch.sort === "recent" ? "recent" : "smart";
  const data = await getFeedBundle("my-street", { tag, sort }, viewer);

  return (
    <div className="flex flex-col">
      {/* Sticky header with tabs */}
      <FeedTabs active="my-street" />

      {/* Topic filters */}
      <TopicFilters active={tag} levelPath="/mata" />

      {/* Sort toggle */}
      <FeedSortToggle active={sort} levelPath="/mata" tag={tag} />

      {/* Feed stats - subtle */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="text-[13px] text-[var(--secondary)]">
          {data.feedSummary.totalCount} gists · {data.feedSummary.freshCount} fresh today
        </div>
        <div className="text-[13px] font-semibold text-[var(--accent)]">
          {data.feedSummary.localLabel}
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
            <p className="text-[20px] font-bold">Your street still quiet.</p>
            <p className="mt-2 text-[15px] text-[var(--secondary)]">
              No gist don land for your exact street yet. Zoom out or drop one yourself.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href="/mata/my-area">
                <Button variant="secondary" size="sm">My Area</Button>
              </Link>
              <Link href="/mata/my-state">
                <Button variant="secondary" size="sm">My State</Button>
              </Link>
              <Link href="/mata/national">
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
