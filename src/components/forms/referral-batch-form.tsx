"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { generateReferralsAction } from "@/lib/server/oga-actions";

export function ReferralBatchForm() {
  const [state, action] = useActionState(generateReferralsAction, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input
        name="count"
        type="number"
        min={1}
        max={10}
        defaultValue={3}
        className="h-11 w-24 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
      />
      <SubmitButton idleLabel="Generate" pendingLabel="Generating..." />
      {state.message ? <p className="text-sm text-[var(--accent)]">{state.message}</p> : null}
    </form>
  );
}
