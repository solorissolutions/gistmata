import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CONTACT_OGA_EMAIL } from "@/lib/domain/constants";
import { Card } from "@/components/ui/card";
import { PageWithContextRail } from "@/components/app-shell/page-with-context-rail";
import { PageHeader } from "@/components/blocks/page-header";
import { FeedTabs } from "@/components/gist/feed-tabs";
import { FeedSortToggle } from "@/components/gist/feed-sort-toggle";
import { GistCard } from "@/components/gist/gist-card";
import { PredictionSlotCard } from "@/components/gist/prediction-slot-card";
import { SurveyCard } from "@/components/gist/survey-card";
import { TopicFilters } from "@/components/gist/topic-filters";
import { LeaderboardList } from "@/components/blocks/leaderboard-list";
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

  const data = await getFeedBundle(
    level as "my-area" | "state" | "nigeria" | "hot",
    {
      tag: resolvedSearch.tag ?? "All",
      sort: resolvedSearch.sort === "recent" ? "recent" : "smart",
    },
    viewer,
  );
  const levelPath = `/mata/${level}`;
  const activeTag = resolvedSearch.tag ?? "All";
  const sections = [
    {
      id: "current-lens",
      title: "Current lens",
      defaultOpen: true,
      content: (
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          {level === "hot"
            ? "Hot uses simple recent engagement velocity."
            : `${slugToLabel(level)} keeps the feed geography-first.`}
        </p>
      ),
    },
    {
      id: "context",
      title: "Context",
      content: (
        <div className="space-y-2 text-sm text-[var(--gm-ink-soft)]">
          <p>Spot: {data.feedSummary.localLabel}</p>
          <p>Hot area: {data.feedSummary.hotspotArea}</p>
          <p>Spotlight tag: {data.feedSummary.spotlightTag}</p>
        </div>
      ),
    },
    {
      id: "contact-oga",
      title: "Utility",
      content: (
        <div className="space-y-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
          <p>Need send platform note to oga?</p>
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
      storageKey={`gm-${level}-context-collapsed`}
      mobileLabel="Mata context"
      sections={sections}
      main={
        <div className="space-y-5">
          <PageHeader
            eyebrow="The Mata"
            title={slugToLabel(level)}
            description={
              level === "hot"
                ? "Hot stays simple: fresh engagement velocity, trust, and recency."
                : "Read by geography first. No hashtags, no social graph, just the gist."
            }
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
          <FeedTabs active={level} />
          <TopicFilters active={activeTag} levelPath={levelPath} />
          <FeedSortToggle
            active={data.sort}
            levelPath={levelPath}
            tag={activeTag}
          />
          <div className="space-y-4">
            {data.predictionSlot ? (
              <PredictionSlotCard prediction={data.predictionSlot} />
            ) : null}
            {data.activeSurvey ? <SurveyCard survey={data.activeSurvey} interactive /> : null}
            {data.pinnedGists.map((gist) => (
              <GistCard key={gist.id} gist={gist} />
            ))}
            {data.gists.length === 0 ? (
              <Card className="space-y-4">
                <p className="text-lg font-extrabold tracking-[-0.04em]">Nothing dey here yet.</p>
                <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                  Change tag, try another Mata level, or drop a fresh Gist from your side.
                </p>
                <div className="flex flex-wrap gap-2">
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
