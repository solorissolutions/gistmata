"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { createSurveyAction } from "@/lib/server/oga-actions";

export function SurveyCreateForm() {
  const [state, action] = useActionState(createSurveyAction, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-3">
      <input name="question" placeholder="Survey question" className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="scopeType" defaultValue="nigeria" className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]">
          <option value="nigeria">Nigeria</option>
          <option value="state">State</option>
          <option value="area">Area</option>
        </select>
        <input name="scopeValue" placeholder="Scope value if needed" className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]" />
      </div>
      <input name="endsAt" type="date" className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]" />
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="optionOne" placeholder="Option one" className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]" />
        <input name="optionTwo" placeholder="Option two" className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]" />
        <input name="optionThree" placeholder="Option three" className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]" />
      </div>
      {state.message ? <p className={state.status === "error" ? "text-sm text-[var(--destructive)]" : "text-sm text-[var(--accent)]"}>{state.message}</p> : null}
      <SubmitButton idleLabel="Create survey" pendingLabel="Publishing..." />
    </form>
  );
}
