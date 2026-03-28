import { PageHeader } from "@/components/blocks/page-header";
import { BackButton } from "@/components/blocks/back-button";
import { ReferralCodeList } from "@/components/referrals/referral-code-list";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/server/services/auth";
import { getUserReferralBundle } from "@/lib/server/services/referral";

export const metadata = { title: "Your referrals — GistMata" };

export default async function LockerReferralsPage() {
  const viewer = await requireUser();
  const data = await getUserReferralBundle(viewer);

  return (
    <div className="space-y-5">
      <BackButton fallbackHref="/locker" />
      <PageHeader
        eyebrow="Locker"
        title="Your referrals"
        description={
          data.viewer.isOga
            ? "Oga referrals are unlimited. Usage still stays anonymous."
            : "You get exactly 5 personal invite codes. Each one works once, then the slot is spent."
        }
      />

      <Card className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
            <p className="muted-label">Referral allowance</p>
            <p className="text-2xl font-extrabold tracking-[-0.05em]">
              {Number.isFinite(data.allowance) ? data.allowance : "Unlimited"}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
            <p className="muted-label">Used</p>
            <p className="text-2xl font-extrabold tracking-[-0.05em]">{data.usedCount}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
            <p className="muted-label">Referrals left</p>
            <p className="text-2xl font-extrabold tracking-[-0.05em]">
              {Number.isFinite(data.leftCount) ? data.leftCount : "Unlimited"}
            </p>
          </div>
        </div>

        {data.viewer.isOga ? (
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--gm-ink-soft)]">
            This operator account still has unlimited referral capacity, but generation is no longer handled inside the public app.
          </div>
        ) : (
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--gm-ink-soft)]">
            No extra generation for normal users. The five codes tied to your join are your full supply.
          </div>
        )}
      </Card>

      <ReferralCodeList
        title="Issued codes"
        description="Copy unused codes as needed. Once a person joins with one code, that code closes permanently."
        codes={data.codes.map((code) => ({
          ...code,
          helperText:
            code.status === "used"
              ? "Used once already."
              : "Unused. Single-use only.",
        }))}
        emptyText="No referral codes are attached to this account yet."
      />
    </div>
  );
}
