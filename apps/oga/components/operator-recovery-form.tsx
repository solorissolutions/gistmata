"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";

import { operatorRecoveryAction } from "../lib/auth-actions";

export function OperatorRecoveryForm() {
  const [state, action] = useActionState(operatorRecoveryAction, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Account Code</span>
          <Input
            name="accountCode"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="GM-0001-OG"
            aria-describedby={state.fieldErrors?.accountCode ? "operator-account-code-error" : undefined}
          />
          {state.fieldErrors?.accountCode ? (
            <p id="operator-account-code-error" className="text-sm text-[var(--destructive)]" role="alert">
              {state.fieldErrors.accountCode[0]}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">PIN</span>
          <Input
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            autoComplete="current-password"
            placeholder="6-digit operator PIN"
            aria-describedby={state.fieldErrors?.pin ? "operator-recovery-pin-error" : undefined}
          />
          {state.fieldErrors?.pin ? (
            <p id="operator-recovery-pin-error" className="text-sm text-[var(--destructive)]" role="alert">
              {state.fieldErrors.pin[0]}
            </p>
          ) : null}
        </label>
      </div>

      {state.status === "error" && state.message && !state.fieldErrors ? (
        <p className="rounded-2xl bg-[var(--destructive-soft)] px-4 py-3 text-sm text-[var(--destructive)]" role="alert">
          {state.message}
        </p>
      ) : null}

      <SubmitButton idleLabel="Recover operator session" pendingLabel="Recovering…" className="w-full" />

      <p className="text-center text-sm text-[var(--gm-ink-soft)]">
        Already know the username + PIN?{" "}
        <Link href="/login" className="font-semibold text-[var(--gm-green-deep)] underline underline-offset-2">
          Back to login
        </Link>
      </p>
    </form>
  );
}
