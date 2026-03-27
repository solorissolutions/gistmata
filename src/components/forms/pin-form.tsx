"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitPin } from "@/lib/server/auth-actions";

export function PinForm() {
  const [state, action] = useActionState(submitPin, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">6-digit PIN</span>
        <Input
          name="pin"
          inputMode="numeric"
          maxLength={6}
          placeholder="6 digits only"
          autoComplete="off"
          className="text-center text-2xl tracking-[0.45em]"
        />
        <span className="text-xs text-[var(--gm-ink-soft)]">
          Use six numbers you fit remember, but no make am obvious.
        </span>
      </label>
      {state.fieldErrors?.pin ? (
        <p className="text-sm text-[var(--destructive)]">{state.fieldErrors.pin[0]}</p>
      ) : null}
      {state.message ? <p className="text-sm text-[var(--destructive)]">{state.message}</p> : null}
      <SubmitButton idleLabel="Save PIN" pendingLabel="Saving..." className="w-full" />
    </form>
  );
}
