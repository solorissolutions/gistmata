import Link from "next/link";

import { OgaV2Empty, OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { getOgaPreIntelBundle } from "@/lib/server/services/oga/pre-intel-service";
import { compactNumber, formatTimelineDate } from "@/lib/utils";

export default async function OgaV2IntelLivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const data = await getOgaPreIntelBundle(resolvedSearch);

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Intel"
        title="Live Signals"
        description="An anonymity-safe early warning layer built from GistMata’s own data only: what is clustering where, which referral chains are shaping reach, and which behavior patterns need trust review."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Heat zones",
            value: compactNumber(data.summary.heatZones),
            hint: "Areas with enough public signal to inspect.",
          },
          {
            label: "Trend alerts",
            value: compactNumber(data.summary.trendAlerts),
            hint: "Emerging area-tag clusters worth watching.",
            tone: data.summary.trendAlerts > 0 ? "warning" : "default",
          },
          {
            label: "Watchlist users",
            value: compactNumber(data.summary.watchlistUsers),
            hint: "Accounts already pushing trust or report pressure.",
            tone: data.summary.watchlistUsers > 0 ? "danger" : "default",
          },
          {
            label: "Referral hubs",
            value: compactNumber(data.summary.referralHubs),
            hint: "Users currently shaping invitation spread.",
          },
        ]}
      />

      <OgaV2Panel title="Deep search" eyebrow="Cross-surface lookup">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="search"
            name="q"
            defaultValue={data.filters.q}
            placeholder="Search matas, tags, areas, states, usernames, trust states"
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
          />
          <button className="h-11 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)]">
            Search
          </button>
        </form>

        {data.filters.q ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="muted-label">Matter matches</div>
              {data.search.matterMatches.length === 0 ? (
                <OgaV2Empty
                  title="No matching mata."
                  description="Try a broader area, tag, or author keyword."
                />
              ) : (
                data.search.matterMatches.map((matter) => (
                  <Link
                    key={matter.id}
                    href={`/oga-v2/matters?matterId=${matter.id}`}
                    className="block rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <OgaV2Pill>{matter.tag}</OgaV2Pill>
                      <OgaV2Pill>{matter.stateName}</OgaV2Pill>
                    </div>
                    <div className="mt-2 text-sm leading-6">{matter.label}</div>
                    <div className="mt-2 text-xs text-[var(--gm-ink-soft)]">
                      @{matter.owner} · {matter.areaDisplay} · signal {matter.signalScore}
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="space-y-3">
              <div className="muted-label">User matches</div>
              {data.search.userMatches.length === 0 ? (
                <OgaV2Empty
                  title="No matching user."
                  description="Try username, state, area, or trust keyword."
                />
              ) : (
                data.search.userMatches.map((user) => (
                  <Link
                    key={user.id}
                    href={`/oga-v2/users?userId=${user.id}`}
                    className="block rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <OgaV2Pill>{user.trustState}</OgaV2Pill>
                      <OgaV2Pill>{user.state}</OgaV2Pill>
                    </div>
                    <div className="mt-2 text-sm font-semibold">{user.label}</div>
                    <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                      {user.areaDisplay ?? "Unknown area"} · {user.totalContributionCount} contributions ·{" "}
                      {user.referralChildrenCount} referral children
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        ) : null}
      </OgaV2Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <OgaV2Panel title="Heat map" eyebrow="What is being talked about where">
            <div className="space-y-3">
              {data.heatMap.map((zone) => (
                <div
                  key={`${zone.areaDisplay}-${zone.stateName}`}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {zone.areaDisplay}, {zone.stateName}
                      </div>
                      <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                        {zone.dominantTags.map(([tag]) => tag).join(" · ")}
                      </div>
                    </div>
                    <OgaV2Pill tone={zone.reportCount > 0 ? "warning" : "neutral"}>
                      heat {zone.heatScore}
                    </OgaV2Pill>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                    <div className="flex items-center justify-between gap-3 sm:block">
                      <span className="text-[var(--gm-ink-soft)]">Gists</span>
                      <span className="font-semibold">{zone.gistCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block">
                      <span className="text-[var(--gm-ink-soft)]">Recent</span>
                      <span className="font-semibold">{zone.recentCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block">
                      <span className="text-[var(--gm-ink-soft)]">Reports</span>
                      <span className="font-semibold">{zone.reportCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block">
                      <span className="text-[var(--gm-ink-soft)]">Follow-ups</span>
                      <span className="font-semibold">{zone.followUpCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Trend alerts" eyebrow="Emerging topics before they spread">
            {data.trendAlerts.length === 0 ? (
              <OgaV2Empty
                title="No fresh trend alert."
                description="Recent area-tag chatter is not outrunning the baseline yet."
              />
            ) : (
              <div className="space-y-3">
                {data.trendAlerts.map((alert) => (
                  <div
                    key={`${alert.tag}-${alert.areaDisplay}-${alert.stateName}`}
                    className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <OgaV2Pill tone="warning">{alert.tag}</OgaV2Pill>
                      <OgaV2Pill>{alert.areaDisplay}</OgaV2Pill>
                      <OgaV2Pill>{alert.stateName}</OgaV2Pill>
                    </div>
                    <div className="mt-2 text-sm leading-6">{alert.note}</div>
                    <div className="mt-2 text-xs text-[var(--gm-ink-soft)]">
                      recent {alert.recentCount} · baseline {alert.baselineCount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </OgaV2Panel>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Referral network graph" eyebrow="Who influences who">
            <div className="space-y-3">
              {data.referralGraph.nodes.map((node) => (
                <div
                  key={node.id}
                  className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">@{node.username}</span>
                    <OgaV2Pill>{node.referrals} referrals</OgaV2Pill>
                  </div>
                  <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                    {node.state} · {node.tier} · {node.trustState}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="muted-label">Recent edges</div>
              {data.referralGraph.edges.slice(0, 10).map((edge) => (
                <div key={`${edge.fromUserId}-${edge.toUserId}`} className="text-sm">
                  <span className="font-semibold">@{edge.fromUsername}</span> → @{edge.toUsername}
                  <div className="text-xs text-[var(--gm-ink-soft)]">
                    {edge.state} · joined {formatTimelineDate(edge.joinedAt)}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Profile clusters" eyebrow="Groups by behavior pattern">
            <div className="space-y-4">
              {data.profileClusters.map((cluster) => (
                <div key={cluster.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{cluster.label}</div>
                      <div className="text-xs text-[var(--gm-ink-soft)]">{cluster.description}</div>
                    </div>
                    <OgaV2Pill>{cluster.count}</OgaV2Pill>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cluster.sample.map((user) => (
                      <Link
                        key={user.id}
                        href={`/oga-v2/users?userId=${user.id}`}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold"
                      >
                        @{user.username}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>
      </div>
    </div>
  );
}
