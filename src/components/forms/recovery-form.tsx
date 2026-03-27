"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { recoverAccount } from "@/lib/server/auth-actions";

export function RecoveryForm() {
  const [state, action] = useActionState(recoverAccount, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Account Code</span>
        <Input name="accountCode" placeholder="Paste the code you saved" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">PIN</span>
        <Input name="pin" inputMode="numeric" maxLength={6} placeholder="6-digit PIN" />
      </label>
      {state.message ? <p className="text-sm text-[var(--destructive)]">{state.message}</p> : null}
      <SubmitButton idleLabel="Recover account" pendingLabel="Checking..." className="w-full" />
    </form>
  );
}
