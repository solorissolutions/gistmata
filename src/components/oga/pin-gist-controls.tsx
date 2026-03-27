"use client";

import { useActionState } from "react";

import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { pinGistAction, unpinGistAction } from "@/lib/server/oga-actions";

export function PinGistControls({
  gistId,
  pinnedPriority,
}: {
  gistId: string;
  pinnedPriority: 1 | 2 | 3 | null;
}) {
  const [state, action] = useActionState(pinGistAction, INITIAL_ACTION_STATE);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((priority) => (
          <form key={priority} action={action}>
            <input type="hidden" name="gistId" value={gistId} />
            <input type="hidden" name="priority" value={priority} />
            <button
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                pinnedPriority === priority
                  ? "border-[var(--gm-green)] bg-[var(--gm-green)] text-white"
                  : "border-[var(--gm-border)]"
              }`}
            >
              {pinnedPriority === priority ? `Pinned ${priority}` : `Pin ${priority}`}
            </button>
          </form>
        ))}
        {pinnedPriority ? (
          <form action={unpinGistAction}>
            <input type="hidden" name="gistId" value={gistId} />
            <button className="rounded-full border border-[var(--gm-border)] px-3 py-2 text-xs font-semibold">
              Unpin
            </button>
          </form>
        ) : null}
      </div>
      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "text-xs text-[var(--destructive)]"
              : "text-xs text-[var(--accent)]"
          }
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
