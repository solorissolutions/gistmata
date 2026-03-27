"use client";

import { useActionState, useEffect, useRef } from "react";
import { Flag, X } from "lucide-react";

import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitReport } from "@/lib/server/mata-actions";
import { cn } from "@/lib/utils";

const REPORT_OPTIONS = [
  { value: "general", label: "General report" },
  { value: "personal-data", label: "Personal Data" },
  { value: "fake-location", label: "Fake Location" },
];

export function ReportGistDialog({ gistId }: { gistId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action] = useActionState(submitReport, INITIAL_ACTION_STATE);

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
    }
  }, [state.status]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[var(--gm-ink-soft)] hover:bg-[var(--surface-2)]"
      >
        <Flag className="h-4 w-4" />
        Report gist
      </button>

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/25 w-[min(92vw,28rem)] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-0"
      >
        <form action={action} className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="muted-label">Safety</p>
              <h3 className="text-xl font-extrabold tracking-[-0.04em]">
                Report this Gist
              </h3>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-full p-2 text-[var(--gm-ink-soft)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input type="hidden" name="gistId" value={gistId} />
          <div className="space-y-2">
            {REPORT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm"
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  required
                  defaultChecked={option.value === "general"}
                />
                {option.label}
              </label>
            ))}
          </div>
          <textarea
            name="reasonText"
            placeholder="Extra note for oga (optional)"
            className="min-h-24 w-full rounded-[22px] border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--input-foreground)] outline-none placeholder:text-[var(--input-placeholder)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--ring)]"
          />
          {state.message ? (
            <p
              className={cn(
                "text-sm",
                state.status === "error" ? "text-[var(--destructive)]" : "text-[var(--accent)]",
              )}
            >
              {state.message}
            </p>
          ) : null}
          <div className="flex justify-end">
            <SubmitButton idleLabel="Send report" pendingLabel="Sending..." />
          </div>
        </form>
      </dialog>
    </>
  );
}
