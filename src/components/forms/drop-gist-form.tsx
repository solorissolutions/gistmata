"use client";

import { useActionState, useEffect, useState } from "react";
import { SignalLow } from "lucide-react";

import type { DraftAssistResponse } from "@/lib/ai/contracts";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { GIST_TAGS, MAX_GIST_LENGTH } from "@/lib/domain/constants";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitGist } from "@/lib/server/mata-actions";

export function DropGistForm() {
  const [state, action] = useActionState(submitGist, INITIAL_ACTION_STATE);
  const [bodyCount, setBodyCount] = useState(0);
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("General");
  const [tagTouched, setTagTouched] = useState(false);
  const [draftAssist, setDraftAssist] = useState<DraftAssistResponse | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const syncStatus = () => setOnline(window.navigator.onLine);
    syncStatus();
    window.addEventListener("online", syncStatus);
    window.addEventListener("offline", syncStatus);
    return () => {
      window.removeEventListener("online", syncStatus);
      window.removeEventListener("offline", syncStatus);
    };
  }, []);

  useEffect(() => {
    const trimmedBody = body.trim();

    if (trimmedBody.length < 12) {
      setDraftAssist(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/ai/draft-hints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: trimmedBody, currentTag: tag, context: "new-gist" }),
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = (await response.json()) as DraftAssistResponse;
        setDraftAssist(data);

        if (!tagTouched && data.tagSuggestion.confidence >= 0.74) {
          setTag(data.tagSuggestion.suggestedTag);
        }
      } catch {
        // Quiet failure keeps the composer usable.
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [body, tag, tagTouched]);

  return (
    <form action={action} className="space-y-5">
      {!online ? (
        <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--gm-ink-soft)]">
          <div className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
            <SignalLow className="h-4 w-4" />
            Weak connection
          </div>
          <p className="mt-2">Reconnect before you drop this gist.</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-semibold">Wetin happen?</label>
        <Textarea
          name="body"
          maxLength={MAX_GIST_LENGTH}
          placeholder="Wetin happen?"
          className="min-h-44"
          onChange={(event) => {
            setBody(event.currentTarget.value);
            setBodyCount(event.currentTarget.value.length);
          }}
        />
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--gm-ink-soft)]">
          <span>No full names, no phone numbers, no addresses.</span>
          <span>{bodyCount}/{MAX_GIST_LENGTH}</span>
        </div>
        {draftAssist?.safety.severity === "warn" ? (
          <p className="text-xs leading-5 text-[var(--accent)]">{draftAssist.safety.reason}</p>
        ) : null}
        {draftAssist?.safety.severity === "block" ? (
          <p className="text-xs leading-5 text-[var(--destructive)]">{draftAssist.safety.reason}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">This gist na mostly about wetin?</label>
        <select
          name="tag"
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          value={tag}
          onChange={(event) => {
            setTagTouched(true);
            setTag(event.currentTarget.value);
          }}
        >
          {GIST_TAGS.map((gistTag) => (
            <option key={gistTag} value={gistTag}>
              {gistTag}
            </option>
          ))}
        </select>
        {draftAssist?.tagSuggestion.confidence && draftAssist.tagSuggestion.confidence >= 0.58 ? (
          <p className="text-xs leading-5 text-[var(--gm-ink-soft)]">
            Suggested tag: {draftAssist.tagSuggestion.suggestedTag}. {draftAssist.tagSuggestion.reason}
          </p>
        ) : null}
      </div>

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
      <SubmitButton
        idleLabel="Drop Gist"
        pendingLabel="Dropping..."
        disabled={!online}
        className="w-full sm:w-auto"
      />
    </form>
  );
}
