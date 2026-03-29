"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitComment } from "@/lib/server/mata-actions";

export function CommentComposer({ gistId }: { gistId: string }) {
  const [state, action] = useActionState(submitComment, INITIAL_ACTION_STATE);
  const [body, setBody] = useState("");

  const canSubmit = body.trim().length > 0;

  return (
    <form action={action} className="flex gap-3">
      <input type="hidden" name="gistId" value={gistId} />

      {/* Avatar placeholder */}
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-bold">
          ?
        </div>
      </div>

      {/* Input */}
      <div className="min-w-0 flex-1">
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Drop your reply"
          className="min-h-[60px] w-full resize-none border-none bg-transparent text-[17px] text-[var(--foreground)] placeholder:text-[var(--secondary)] focus:outline-none"
        />

        {state.message && (
          <p className={`mt-1 text-[14px] ${
            state.status === "error" ? "text-[var(--destructive)]" : "text-[var(--accent)]"
          }`}>
            {state.message}
          </p>
        )}

        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={!canSubmit}>
            Reply
          </Button>
        </div>
      </div>
    </form>
  );
}
