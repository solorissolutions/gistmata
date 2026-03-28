"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { sendBroadcastAction } from "@/lib/server/oga-actions";

export function BroadcastForm() {
  const [state, action] = useActionState(sendBroadcastAction, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="audience" className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]" defaultValue="all">
          <option value="all">All users</option>
          <option value="inactive">Inactive users</option>
          <option value="state">One state</option>
        </select>
        <input name="stateName" placeholder="State if audience = state" className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]" />
      </div>
      <input name="title" placeholder="Alert title" className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]" />
      <textarea name="body" placeholder="Alert body" className="min-h-24 w-full rounded-[22px] border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]" />
      <input name="link" placeholder="/alerts or /mata/..." className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]" />
      {state.message ? <p className={state.status === "error" ? "text-sm text-[var(--destructive)]" : "text-sm text-[var(--accent)]"}>{state.message}</p> : null}
      <SubmitButton idleLabel="Send broadcast" pendingLabel="Sending..." />
    </form>
  );
}
