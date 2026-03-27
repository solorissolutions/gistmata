"use client";

import { useActionState } from "react";

import { AGE_RANGES, GENDERS, NIGERIAN_STATES } from "@/lib/domain/constants";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitBasics } from "@/lib/server/auth-actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function BasicsForm() {
  const [state, action] = useActionState(submitBasics, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">State</span>
        <select
          name="state"
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          defaultValue=""
        >
          <option value="" disabled>
            Choose your state
          </option>
          {NIGERIAN_STATES.map((stateName) => (
            <option key={stateName} value={stateName}>
              {stateName}
            </option>
          ))}
        </select>
        <span className="text-xs text-[var(--gm-ink-soft)]">
          We start from state only. Your local posting area resolves later when you Drop Gist.
        </span>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">Age range</span>
        <select
          name="ageRange"
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          defaultValue=""
        >
          <option value="" disabled>
            Select age range
          </option>
          {AGE_RANGES.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">Gender</span>
        <select
          name="gender"
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          defaultValue=""
        >
          <option value="" disabled>
            Select gender
          </option>
          {GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </label>

      {state.message ? <p className="text-sm text-[var(--destructive)]">{state.message}</p> : null}
      <SubmitButton idleLabel="Continue" pendingLabel="Saving..." className="w-full" />
    </form>
  );
}
