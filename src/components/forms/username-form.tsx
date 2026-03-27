"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitUsername } from "@/lib/server/auth-actions";

export function UsernameForm({ suggested }: { suggested?: string }) {
  const [state, action] = useActionState(submitUsername, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Permanent username</span>
        <Input
          name="username"
          defaultValue={suggested}
          placeholder="Pick am well. You no fit change am later."
          autoComplete="off"
        />
        <span className="text-xs text-[var(--gm-ink-soft)]">
          Letters, numbers, or underscore only. No spaces.
        </span>
      </label>
      {state.fieldErrors?.username ? (
        <p className="text-sm text-[var(--destructive)]">{state.fieldErrors.username[0]}</p>
      ) : null}
      {state.message ? <p className="text-sm text-[var(--destructive)]">{state.message}</p> : null}
      <SubmitButton idleLabel="Continue" pendingLabel="Saving..." className="w-full" />
    </form>
  );
}
