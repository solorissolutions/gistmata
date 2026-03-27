"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitComment } from "@/lib/server/mata-actions";

export function CommentComposer({ gistId }: { gistId: string }) {
  const [state, action] = useActionState(submitComment, INITIAL_ACTION_STATE);

  return (
    <form
      action={action}
      className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm backdrop-blur lg:bottom-4"
    >
      <input type="hidden" name="gistId" value={gistId} />
      <div className="space-y-3">
        <textarea
          name="body"
          placeholder="Drop your comment"
          className="min-h-28 w-full rounded-[22px] border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--input-foreground)] outline-none placeholder:text-[var(--input-placeholder)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--ring)]"
        />
        {state.message ? (
          <p
            className={
              state.status === "error"
                ? "text-sm text-[var(--destructive)]"
                : "text-sm text-[var(--accent)]"
            }
          >
            {state.message}
          </p>
        ) : null}
        <div className="flex justify-end">
          <SubmitButton idleLabel="Drop comment" pendingLabel="Dropping..." className="w-full sm:w-auto" />
        </div>
      </div>
    </form>
  );
}
