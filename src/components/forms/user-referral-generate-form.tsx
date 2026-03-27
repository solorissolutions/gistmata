"use client";

import { useActionState } from "react";

import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { generateUserReferralAction } from "@/lib/server/locker-actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function UserReferralGenerateForm({ disabled }: { disabled: boolean }) {
  const [state, action] = useActionState(generateUserReferralAction, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <SubmitButton
        idleLabel={disabled ? "No referrals left" : "Generate code"}
        pendingLabel="Generating..."
        disabled={disabled}
      />
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "text-sm text-[var(--accent)]"
              : "text-sm text-[var(--destructive)]"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
