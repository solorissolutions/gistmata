import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CONTACT_OGA_EMAIL } from "@/lib/domain/constants";
import { Card } from "@/components/ui/card";
import { PageWithContextRail } from "@/components/app-shell/page-with-context-rail";
import { PageHeader } from "@/components/blocks/page-header";
import { FeedTabs } from "@/components/gist/feed-tabs";
import { FeedSortToggle } from "@/components/gist/feed-sort-toggle";
import { GistCard } from "@/components/gist/gist-card";
import { TopicFilters } from "@/components/gist/topic-filters";
import { LeaderboardList } from "@/components/blocks/leaderboard-list";
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
  const sections = [
    {
      id: "street-signal",
      title: "Street signal",
      defaultOpen: true,
      content: (
        <div className="space-y-2 text-sm text-[var(--gm-ink-soft)]">
          <p>Spot: {data.feedSummary.localLabel}</p>
          <p>Broader area: {data.feedSummary.broaderAreaLabel}</p>
          <p>Hot area: {data.feedSummary.hotspotArea}</p>
          <p>Spotlight tag: {data.feedSummary.spotlightTag}</p>
        </div>
      ),
    },
    {
      id: "nearby-moving",
      title: "Nearby gist moving",
      content: (
        <div className="space-y-2 text-sm text-[var(--gm-ink-soft)]">
          {data.feedSummary.nearbyMovement.map(([tagLabel, count]) => (
            <div key={tagLabel} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
              <span>{tagLabel}</span>
              <span>{count} gists</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "safety",
      title: "Safety first",
      content: (
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          No full names, no phone numbers, no addresses.
        </p>
      ),
    },
    {
      id: "contact-oga",
      title: "Utility",
      content: (
        <div className="space-y-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
          <p>Need reach oga without dropping personal info?</p>
          <Link href="/contact-oga" className="font-semibold text-[var(--gm-green-deep)]">
            Contact oga
          </Link>
          <p>Contact {CONTACT_OGA_EMAIL}</p>
        </div>
      ),
    },
    {
      id: "leaderboard",
      title: "Monthly teaser",
      surface: "raw" as const,
      content: <LeaderboardList entries={data.leaderboardTeaser} title="Monthly teaser" />,
    },
  ];

  return (
    <PageWithContextRail
      storageKey="gm-mata-street-context-collapsed"
      mobileLabel="Street context"
      sections={sections}
      main={
        <div className="space-y-5">
          <PageHeader
            eyebrow="The Mata"
            title="My Street"
            description={data.feedSummary.coverageText}
            actions={
              <div className="grid w-full grid-cols-2 gap-2 text-right sm:w-auto sm:min-w-[220px]">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--gm-ink-soft)]">
                    Live gists
                  </div>
                  <div className="text-lg font-extrabold">{data.feedSummary.totalCount}</div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--gm-ink-soft)]">
                    Fresh today
                  </div>
                  <div className="text-lg font-extrabold">{data.feedSummary.freshCount}</div>
                </div>
              </div>
            }
          />
          <FeedTabs active="my-street" />
          <TopicFilters active={tag} levelPath="/mata" />
          <FeedSortToggle active={sort} levelPath="/mata" tag={tag} />
          <div className="space-y-4">
            {data.pinnedGists.map((gist) => (
              <GistCard key={gist.id} gist={gist} />
            ))}
            {data.gists.length === 0 ? (
              <Card className="space-y-4">
                <p className="text-lg font-extrabold tracking-[-0.04em]">Your street still quiet.</p>
                <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                  No gist don land for your exact street yet. Zoom out or drop one yourself.
                </p>
                <div className="flex flex-wrap gap-2">
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
              </Card>
            ) : (
              data.gists.map((gist) => <GistCard key={gist.id} gist={gist} />)
            )}
          </div>
        </div>
      }
    />
  );
}
