import { OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { getOgaOverviewBundle } from "@/lib/server/services/oga/overview-service";
import { compactNumber, formatTimelineDate } from "@/lib/utils";

export default async function OgaV2OverviewPage() {
  const { overview } = await getOgaOverviewBundle();

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Overview"
        description="Platform pulse first. What is moving, what is risky, what needs intervention, and what oga can act on next."
        actions={
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-right text-sm">
            <div className="muted-label">Snapshot</div>
            <div className="mt-1 font-semibold">{formatTimelineDate(overview.generatedAt)}</div>
          </div>
        }
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Active now",
            value: compactNumber(overview.metrics.activeUsersNow),
            hint: "Users active in the last 30 minutes.",
          },
          {
            label: "Daily active",
            value: compactNumber(overview.metrics.dailyActiveUsers),
            hint: "Unique users active since midnight.",
          },
          {
            label: "Weekly active",
            value: compactNumber(overview.metrics.weeklyActiveUsers),
            hint: "Seven-day active platform reach.",
          },
          {
            label: "New users",
            value: compactNumber(overview.metrics.newUsersToday),
            hint: `${compactNumber(overview.metrics.retainedUsers)} retained users active this week.`,
            tone: "success",
          },
          {
            label: "Gists today",
            value: compactNumber(overview.metrics.totalGistsToday),
            hint: `${compactNumber(overview.metrics.followUpGistsToday)} follow-up gists today.`,
          },
          {
            label: "Comments today",
            value: compactNumber(overview.metrics.commentsToday),
            hint: `${compactNumber(overview.metrics.savesToday)} saves today.`,
          },
          {
            label: "Reports today",
            value: compactNumber(overview.metrics.reportsToday),
            hint: `${compactNumber(overview.reportBacklog.total)} open reports in queue.`,
            tone: overview.metrics.reportsToday > 0 ? "danger" : "default",
          },
          {
            label: "Inbox unread",
            value: compactNumber(overview.inboxUnread),
            hint: `${compactNumber(overview.metrics.referralActivations7d)} referral activations in the last 7 days.`,
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <OgaV2Panel title="Platform pulse" eyebrow="Shape of the square">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="space-y-3">
                <div className="muted-label">Top tags</div>
                {overview.topTags.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="muted-label">Top areas</div>
                {overview.topAreas.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="muted-label">Top states</div>
                {overview.topStates.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </OgaV2Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <OgaV2Panel title="Trust risk spikes" eyebrow="Intervention load">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <OgaV2Pill tone="danger">
                    {overview.trustRiskSpikes.riskUsers} users near trust action
                  </OgaV2Pill>
                  <OgaV2Pill tone="warning">
                    {overview.trustRiskSpikes.personalDataToday} privacy reports today
                  </OgaV2Pill>
                  <OgaV2Pill tone="warning">
                    {overview.trustRiskSpikes.fakeLocationToday} fake-location reports today
                  </OgaV2Pill>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Personal data backlog</span>
                    <span className="font-semibold">{overview.reportBacklog.personalData}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fake location backlog</span>
                    <span className="font-semibold">{overview.reportBacklog.fakeLocation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>General backlog</span>
                    <span className="font-semibold">{overview.reportBacklog.general}</span>
                  </div>
                </div>
              </div>
            </OgaV2Panel>

            <OgaV2Panel title="Population mix" eyebrow="Who is in the platform">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="muted-label">Age ranges</div>
                  {overview.ageMix.map(([label, count]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="muted-label">Gender mix</div>
                  {overview.genderMix.map(([label, count]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </OgaV2Panel>
          </div>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Recent activations" eyebrow="Referral pulse">
            <div className="space-y-3">
              {overview.recentActivations.length === 0 ? (
                <div className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                  No referral activation yet.
                </div>
              ) : (
                overview.recentActivations.map((activation) => (
                  <div
                    key={activation.id}
                    className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">
                        @{activation.referrerUsername} invited @{activation.referredUsername}
                      </div>
                      <OgaV2Pill tone="success">+{activation.pointsAwarded} pts</OgaV2Pill>
                    </div>
                    <div className="mt-1 text-xs leading-5 text-[var(--gm-ink-soft)]">
                      {activation.referredArea ? `${activation.referredArea} · ` : ""}
                      {activation.referredState} · {activation.referralCode} ·{" "}
                      {formatTimelineDate(activation.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Pinned matas" eyebrow="Front page control">
            <div className="space-y-3">
              {overview.pinnedMatters.length === 0 ? (
                <div className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                  No pinned mata slots in use.
                </div>
              ) : (
                overview.pinnedMatters.map((matter) => (
                  <div
                    key={matter.id}
                    className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{matter.tag}</div>
                      <OgaV2Pill>{`slot ${matter.pinnedPriority}`}</OgaV2Pill>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                      {matter.body}
                    </div>
                  </div>
                ))
              )}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Referral usage" eyebrow="Growth pressure">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Total codes</span>
                <span className="font-semibold">{overview.referralUsage.totalCodes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Used codes</span>
                <span className="font-semibold">{overview.referralUsage.usedCodes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active codes</span>
                <span className="font-semibold">{overview.referralUsage.activeCodes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total activations</span>
                <span className="font-semibold">{overview.referralUsage.totalActivations}</span>
              </div>
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Growth leaders" eyebrow="Tree pressure">
            <div className="space-y-3">
              {overview.growthLeaders.length === 0 ? (
                <div className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                  No referral chain pressure yet.
                </div>
              ) : (
                overview.growthLeaders.map((entry) => (
                  <div
                    key={entry.userId}
                    className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">@{entry.username}</span>
                      <OgaV2Pill>{entry.count} descendants</OgaV2Pill>
                    </div>
                    <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                      {entry.directChildren} direct invites · +{entry.referralPointsAwarded} pts
                    </div>
                  </div>
                ))
              )}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Location health" eyebrow="Geography quality">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Known users</span>
                <span className="font-semibold">{overview.locationHealth.knownUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Unknown users</span>
                <span className="font-semibold">{overview.locationHealth.unknownUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Low confidence users</span>
                <span className="font-semibold">{overview.locationHealth.lowConfidenceUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cached locations</span>
                <span className="font-semibold">{overview.locationHealth.cachedLocations}</span>
              </div>
            </div>
          </OgaV2Panel>
        </div>
      </div>
    </div>
  );
}
