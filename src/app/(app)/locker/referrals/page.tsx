import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";
import { BackButton } from "@/components/blocks/back-button";
import { UserReferralGenerateForm } from "@/components/forms/user-referral-generate-form";
import { requireUser } from "@/lib/server/services/auth";
import { getUserReferralBundle } from "@/lib/server/services/referral";

export const metadata = { title: "Your referrals — GistMata" };

export default async function LockerReferralsPage() {
  const viewer = await requireUser();
  const data = await getUserReferralBundle(viewer);

  const exhausted = data.leftCount === 0;

  return (
    <div className="space-y-5">
      <BackButton fallbackHref="/locker" />
      <PageHeader
        eyebrow="Locker"
        title="Your referrals"
        description={
          data.viewer.isOga
            ? "Oga referrals are unlimited. Usage still stays anonymous."
            : "You get 5 lifetime invites. Used codes show status only — no identity."
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
            Referral generation for oga stays for{" "}
            <Link href="/oga/growth" className="font-semibold text-[var(--gm-green-deep)]">
              Oga → Growth
            </Link>
            .
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Generate a new code</p>
                <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                  Who use am no go show. Na code status only you go see.
                </p>
              </div>
              <UserReferralGenerateForm disabled={exhausted} />
            </div>

            {exhausted ? (
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--gm-ink-soft)]">
                You don finish your lifetime invites.
              </div>
            ) : null}
          </>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="muted-label">Issued codes</p>
          <span className="text-sm text-[var(--gm-ink-soft)]">{data.issuedCount}</span>
        </div>

        {data.codes.length === 0 ? (
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            You never generate any referral code yet.
          </p>
        ) : (
          <div className="space-y-2">
            {data.codes.map((code) => (
              <div
                key={code.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
              >
                <span className="font-semibold tracking-[0.08em]">{code.code}</span>
                {code.status === "used" ? (
                  <Badge>Used</Badge>
                ) : (
                  <Badge>Unused</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          Used means: this code don land already.
        </p>
      </Card>

      
    </div>
  );
}
