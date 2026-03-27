"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitReferralCode } from "@/lib/server/auth-actions";

export function ReferralForm() {
  const [state, action] = useActionState(submitReferralCode, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Referral code</span>
        <Input name="code" placeholder="Who give you code?" autoComplete="off" />
        <span className="text-xs text-[var(--gm-ink-soft)]">
          Ask the person wey invite you. GistMata no dey do open signup.
        </span>
      </label>
      {state.message ? <p className="text-sm text-[var(--destructive)]">{state.message}</p> : null}
      <SubmitButton idleLabel="Check code" pendingLabel="Checking..." className="w-full" />
    </form>
  );
}
