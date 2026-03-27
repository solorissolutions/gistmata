import { PageHeader } from "@/components/blocks/page-header";
import { ReferralBatchForm } from "@/components/forms/referral-batch-form";
import { Card } from "@/components/ui/card";
import { getOgaGrowthBundle } from "@/lib/server/store";

export default async function OgaGrowthPage() {
  const data = await getOgaGrowthBundle();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Oga" title="Growth" description="Referral generation, usage, activation, and retention snapshots." />
      <Card className="space-y-4">
        <ReferralBatchForm />
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div>Total codes: {data.activationMetrics.totalCodes}</div>
          <div>Used codes: {data.activationMetrics.usedCodes}</div>
          <div>Activated users: {data.activationMetrics.activatedUsers}</div>
        </div>
        <div className="text-sm text-[var(--gm-ink-soft)]">
          Usage rate: {Math.round(data.activationMetrics.usageRate * 100)}%
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-2">
        <p className="muted-label">Active codes</p>
        {data.activeCodes.map((code) => (
          <div key={code.id} className="flex justify-between text-sm">
            <span>{code.code}</span>
            <span>{code.expiresAt ?? "No expiry"}</span>
          </div>
        ))}
        </Card>
        <Card className="space-y-2">
          <p className="muted-label">Used codes</p>
          {data.usedCodes.map((code) => (
            <div key={code.id} className="space-y-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="font-semibold">{code.code}</span>
                <span>{code.usedByUsername}</span>
              </div>
              <div className="text-xs text-[var(--gm-ink-soft)]">
                Created by @{code.createdByUsername}
              </div>
            </div>
          ))}
        </Card>
      </div>
      <Card className="space-y-3">
        <p className="muted-label">Referral lineage</p>
        {data.referralLineage.map((entry) => (
          <div key={`${entry.username}-${entry.joinedAt}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
            <span>
              @{entry.username} · {entry.state}
            </span>
            <span className="text-[var(--gm-ink-soft)]">
              from @{entry.referredByUsername} via {entry.referralCodeUsed}
            </span>
          </div>
        ))}
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-2">
          <p className="muted-label">Retention snapshot</p>
          <div className="flex justify-between text-sm">
            <span>Active in last 7 days</span>
            <span>{data.retentionSnapshot.last7Days}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Active in last 30 days</span>
            <span>{data.retentionSnapshot.last30Days}</span>
          </div>
        </Card>
        <Card className="space-y-2">
          <p className="muted-label">Codes expiring soon</p>
          {data.expiringSoon.length === 0 ? (
            <p className="text-sm text-[var(--gm-ink-soft)]">No active referral batch close to expiry.</p>
          ) : (
            data.expiringSoon.map((code) => (
              <div key={code.id} className="flex justify-between text-sm">
                <span>{code.code}</span>
                <span>{code.expiresAt}</span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
