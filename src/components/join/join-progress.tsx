"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { JOIN_STEPS } from "@/lib/domain/constants";
import { cn } from "@/lib/utils";

type DraftSummary = {
  referralCode: string | null;
  username: string | null;
  accountCode: string | null;
  reservedReferralCodes?: string[] | null;
};

export function JoinProgress({ draft }: { draft: DraftSummary | null }) {
  const pathname = usePathname();
  const activeIndex = Math.max(
    0,
    JOIN_STEPS.findIndex((step) => step.href === pathname),
  );
  const progress = ((activeIndex + 1) / JOIN_STEPS.length) * 100;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="muted-label">Join flow</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">
            Anonymous entry, straight into Mata.
          </h1>
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            Referral first. Username once. PIN once. Save your Account Code well.
          </p>
        </div>

        <div className="h-2 rounded-full bg-[var(--gm-green-soft)]">
          <div
            className="h-2 rounded-full bg-[var(--gm-green)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {JOIN_STEPS.map((step, index) => {
          const active = pathname === step.href;
          const complete = index < activeIndex;

          return (
            <div
              key={step.href}
              className={cn(
                "rounded-2xl border px-4 py-3 transition",
                active
                  ? "border-[var(--gm-green)] bg-[var(--gm-green-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-2)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{step.label}</div>
                  <div className="text-xs text-[var(--gm-ink-soft)]">{step.help}</div>
                </div>
                <span className="text-xs font-semibold text-[var(--gm-ink-soft)]">
                  {complete ? "Done" : active ? "Now" : `${index + 1}/6`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--gm-ink-soft)]">
        <p className="font-semibold text-[var(--foreground)]">Join draft</p>
        <p className="mt-2">Code: {draft?.referralCode ?? "Waiting for referral"}</p>
        <p>Username: {draft?.username ? `@${draft.username}` : "Not set yet"}</p>
        <p>Account Code: {draft?.accountCode ? "Generated and ready to save" : "Shows after PIN"}</p>
        <p>
          Referral codes:{" "}
          {draft?.reservedReferralCodes?.length
            ? `${draft.reservedReferralCodes.length} ready to copy`
            : "Show after PIN"}
        </p>
      </div>

      <Link
        href="/locker/recovery"
        className="inline-flex text-sm font-semibold text-[var(--gm-green-deep)]"
      >
        Recover with Account Code + PIN
      </Link>
    </div>
  );
}
