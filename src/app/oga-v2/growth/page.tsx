import { OgaV2ReferralBatchForm } from "@/components/oga-v2/oga-v2-forms";
import {
  OgaV2Header,
  OgaV2MetricStrip,
  OgaV2Panel,
  OgaV2Pill,
} from "@/components/oga-v2/oga-v2-ui";
import { getGrowthSummaryBundle } from "@/lib/server/services/oga/user-ops-service";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2GrowthPage() {
  const growth = await getGrowthSummaryBundle();

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Growth"
        description="Full referral control for the anonymous board: mint supply, inspect every activation, walk the invite tree, and see which codes are still live or already spent."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Total codes",
            value: growth.summary.totalCodes,
            hint: `${growth.summary.activeCodes} codes still active.`,
          },
          {
            label: "Unused codes",
            value: growth.summary.unusedCodes,
            hint: `${growth.summary.usedCodes} codes already spent.`,
          },
          {
            label: "Activations",
            value: growth.summary.activatedUsers,
            hint: `${growth.summary.inviteVelocity7d} landed in the last 7 days.`,
          },
          {
            label: "Referral points",
            value: growth.summary.totalPointsAwarded,
            hint: `${growth.summary.rootAccounts} root accounts in the tree.`,
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <OgaV2Panel title="Generate referrals" eyebrow="Unlimited oga supply">
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

          <OgaV2Panel title="Recent activations" eyebrow="Who just entered">
            <div className="space-y-3">
              {growth.recentActivations.map((entry) => (
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
                    {entry.referredArea ? `${entry.referredArea} · ` : ""}
                    {entry.referredState} · {entry.referralCode} ·{" "}
                    {formatTimelineDate(entry.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Referral tree" eyebrow="Who invited whom">
            <div className="space-y-3">
              {growth.referralTree.map((node) => (
                <div
                  key={node.id}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  style={{ paddingLeft: `${node.depth * 18 + 16}px` }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {node.isOga ? <OgaV2Pill tone="warning">oga</OgaV2Pill> : null}
                    <OgaV2Pill>{node.state}</OgaV2Pill>
                    <OgaV2Pill>{node.tier}</OgaV2Pill>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">@{node.username}</span>
                    <span>{node.totalDescendants} descendants</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                    {node.parentUsername ? `invited by @${node.parentUsername}` : "root account"} ·{" "}
                    {node.directChildren} direct invites · {node.unusedReferralSupply} unused codes
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Code inventory" eyebrow="Used vs unused supply">
            <div className="space-y-3">
              {growth.codeInventory.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{entry.code}</span>
                    <OgaV2Pill
                      tone={
                        entry.status === "used"
                          ? "success"
                          : entry.status === "unused"
                            ? "neutral"
                            : "warning"
                      }
                    >
                      {entry.status}
                    </OgaV2Pill>
                  </div>
                  <div className="mt-2 text-sm text-[var(--gm-ink-soft)]">
                    created by @{entry.createdByUsername}
                    {entry.usedByUsername ? ` · used by @${entry.usedByUsername}` : " · unused"}
                  </div>
                  <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                    created {formatTimelineDate(entry.createdAt)}
                    {entry.usedAt ? ` · used ${formatTimelineDate(entry.usedAt)}` : ""}
                    {entry.usedByArea ? ` · ${entry.usedByArea}` : ""}
                    {entry.usedByState ? `, ${entry.usedByState}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Chain pressure" eyebrow="Who is growing the board">
            <div className="space-y-3">
              {growth.chainPressure.map((entry) => (
                <div
                  key={entry.userId}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">@{entry.username}</span>
                    <span>{entry.count} descendants</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                    {entry.directChildren} direct invites · +{entry.referralPointsAwarded} pts ·{" "}
                    {entry.unusedReferralSupply} unused codes left
                  </div>
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

          <OgaV2Panel title="Recent code usage" eyebrow="Single-use confirmation">
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
                    created by @{entry.createdByUsername}
                    {entry.usedByUsername ? ` · used by @${entry.usedByUsername}` : ""}
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
      </div>
    </div>
  );
}
