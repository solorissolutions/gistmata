import { OgaV2ReferralBatchForm } from "@/components/oga-v2/oga-v2-forms";
import { OgaV2Header, OgaV2MetricStrip, OgaV2Panel } from "@/components/oga-v2/oga-v2-ui";
import { getGrowthSummaryBundle } from "@/lib/server/services/oga/user-ops-service";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2GrowthPage() {
  const growth = await getGrowthSummaryBundle();

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Growth"
        description="Referrals, invite velocity, supply pressure, and how growth is spreading by state and area without turning the dashboard into a private referral browser."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Total codes",
            value: growth.summary.totalCodes,
            hint: `${growth.summary.activeCodes} still active.`,
          },
          {
            label: "Used codes",
            value: growth.summary.usedCodes,
            hint: `${growth.summary.inviteVelocity7d} used in the last 7 days.`,
          },
          {
            label: "Activated users",
            value: growth.summary.activatedUsers,
            hint: `${growth.summary.inviteVelocity30d} used in the last 30 days.`,
          },
          {
            label: "Unused active",
            value: growth.supplyPatterns.unusedActive,
            hint: `${growth.supplyPatterns.exhausted} exhausted chains so far.`,
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <OgaV2Panel title="Generate referrals" eyebrow="Supply control">
            <OgaV2ReferralBatchForm />
          </OgaV2Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <OgaV2Panel title="Growth by state" eyebrow="Spread">
              <div className="space-y-3">
                {growth.byState.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </OgaV2Panel>

            <OgaV2Panel title="Growth by area" eyebrow="Local pull">
              <div className="space-y-3">
                {growth.byArea.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </OgaV2Panel>
          </div>

          <OgaV2Panel title="Recent referral usage" eyebrow="Invite velocity">
            <div className="space-y-3">
              {growth.recentUses.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">{entry.code}</span>
                    <span>{entry.state}</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                    {entry.area ? `${entry.area} · ` : ""}
                    {entry.usedAt ? `used ${formatTimelineDate(entry.usedAt)}` : "unused"}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Chain pressure" eyebrow="Aggregate referral trees">
            <div className="space-y-3">
              {growth.chainPressure.map((entry) => (
                <div key={entry.userId} className="flex items-center justify-between text-sm">
                  <span>@{entry.username}</span>
                  <span className="font-semibold">{entry.count}</span>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Supply patterns" eyebrow="Operational pressure">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Exhausted chains</span>
                <span className="font-semibold">{growth.supplyPatterns.exhausted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Unused active supply</span>
                <span className="font-semibold">{growth.supplyPatterns.unusedActive}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dormant active supply</span>
                <span className="font-semibold">{growth.supplyPatterns.dormant}</span>
              </div>
            </div>
          </OgaV2Panel>
        </div>
      </div>
    </div>
  );
}
