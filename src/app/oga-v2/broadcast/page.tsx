import { OgaV2BroadcastComposer } from "@/components/oga-v2/oga-v2-forms";
import { OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { getOgaDashboardSnapshot } from "@/lib/server/services/oga";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2BroadcastPage() {
  const snapshot = await getOgaDashboardSnapshot();
  const { broadcast } = snapshot;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Broadcast"
        description="Platform voice should stay operational: broadcast all users, target inactive users, send one-state alerts, and preview the message before it goes out."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "All users",
            value: broadcast.audienceEstimates.all,
            hint: "Potential platform-wide audience.",
          },
          {
            label: "Inactive users",
            value: broadcast.audienceEstimates.inactive,
            hint: "Available for inactivity warnings.",
          },
          {
            label: "Recent alerts",
            value: broadcast.recentAlerts.length,
            hint: "Latest alert records in store.",
          },
          {
            label: "Growth leaders",
            value: broadcast.audienceEstimates.stateLeaders.length,
            hint: "Highest-volume state audiences right now.",
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <OgaV2Panel title="Compose broadcast" eyebrow="Platform voice">
            <OgaV2BroadcastComposer />
          </OgaV2Panel>

          <OgaV2Panel title="Recent alerts" eyebrow="What users have seen">
            <div className="space-y-3">
              {broadcast.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{alert.title}</div>
                    <div className="text-xs text-[var(--gm-ink-soft)]">
                      {formatTimelineDate(alert.createdAt)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                    {alert.body}
                  </div>
                  <div className="mt-2 text-xs text-[var(--gm-ink-soft)]">{alert.link}</div>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="State leaders" eyebrow="Audience pressure">
            <div className="space-y-3">
              {broadcast.audienceEstimates.stateLeaders.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Referral growth watch" eyebrow="Growth amplification">
            <div className="space-y-3">
              {broadcast.referralHighlights.length === 0 ? (
                <div className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                  No standout referral activity right now.
                </div>
              ) : (
                broadcast.referralHighlights.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">
                        @{entry.referrerUsername} invited @{entry.referredUsername}
                      </span>
                      <OgaV2Pill tone="success">+{entry.pointsAwarded} pts</OgaV2Pill>
                    </div>
                    <div className="mt-2 text-xs text-[var(--gm-ink-soft)]">
                      {entry.referralCode}
                    </div>
                  </div>
                ))
              )}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Broadcast audit" eyebrow="Recent sends">
            <div className="space-y-3">
              {broadcast.broadcastTrail.map((entry) => (
                <div key={entry.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
                  <div className="font-semibold">{entry.notes ?? entry.actionType}</div>
                  <div className="mt-1 text-[var(--gm-ink-soft)]">
                    {formatTimelineDate(entry.createdAt)}
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
