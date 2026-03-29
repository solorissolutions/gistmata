"use client";

import { useActionState, useEffect, useState } from "react";
import { GitBranch, SignalLow } from "lucide-react";

import type { DraftAssistResponse } from "@/lib/ai/contracts";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import {
  GIST_TAGS,
  MAX_GIST_LENGTH,
  RELATION_TYPE_OPTIONS,
} from "@/lib/domain/constants";
import type { GistCardView } from "@/lib/domain/types";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitFollowUpGist } from "@/lib/server/mata-actions";

export function FollowUpGistForm({ parentGist }: { parentGist: GistCardView }) {
  const [state, action] = useActionState(submitFollowUpGist, INITIAL_ACTION_STATE);
  const [bodyCount, setBodyCount] = useState(0);
  const [body, setBody] = useState("");
  const [tag, setTag] = useState(parentGist.tag);
  const [tagTouched, setTagTouched] = useState(false);
  const [relationType, setRelationType] = useState("follow-up");
  const [relationTouched, setRelationTouched] = useState(false);
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
          body: JSON.stringify({
            body: trimmedBody,
            currentTag: tag,
            currentRelationType: relationType,
            parentGistText: parentGist.body,
            context: "follow-up",
          }),
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = (await response.json()) as DraftAssistResponse;
        setDraftAssist(data);

        if (!tagTouched && data.tagSuggestion.confidence >= 0.74) {
          setTag(data.tagSuggestion.suggestedTag);
        }

        if (
          !relationTouched &&
          data.relationSuggestion &&
          data.relationSuggestion.confidence >= 0.72
        ) {
          setRelationType(data.relationSuggestion.suggestedRelationType);
        }
      } catch {
        // Quiet failure keeps the composer usable.
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [body, parentGist.body, relationTouched, relationType, tag, tagTouched]);

  return (
    <form action={action} className="space-y-5" noValidate>
      <div
        className="rounded-[20px] border border-[var(--gm-border)] bg-[var(--gm-green-soft)]/30 px-4 py-3"
        aria-label="Gist you are joining mouth on"
      >
        <div className="flex items-start gap-2">
          <GitBranch className="mt-1 h-4 w-4 shrink-0 text-[var(--gm-green-deep)]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="muted-label mb-1">Joining mouth on</p>
            <p className="line-clamp-2 text-sm leading-6 text-[var(--foreground)]">
              {parentGist.body}
            </p>
            <p className="mt-1 text-xs text-[var(--gm-ink-soft)]">
              @{parentGist.username} · {parentGist.areaLabel} · {parentGist.tag}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="relationType" className="block text-sm font-semibold">
          How you dey join mouth?
        </label>
        <select
          id="relationType"
          name="relationType"
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          value={relationType}
          onChange={(event) => {
            setRelationTouched(true);
            setRelationType(event.currentTarget.value);
          }}
        >
          {RELATION_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {draftAssist?.relationSuggestion &&
        draftAssist.relationSuggestion.confidence >= 0.58 ? (
          <p className="text-xs leading-5 text-[var(--gm-ink-soft)]">
            Suggested relation: {draftAssist.relationSuggestion.suggestedRelationType}.{" "}
            {draftAssist.relationSuggestion.reason}
          </p>
        ) : null}
      </div>

      {!online ? (
        <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--gm-ink-soft)]">
          <div className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
            <SignalLow className="h-4 w-4" aria-hidden="true" />
            Weak connection
          </div>
          <p className="mt-2">Reconnect before you drop this gist.</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="followup-body" className="block text-sm font-semibold">
          Wetin you want add to this mata?
        </label>
        <Textarea
          id="followup-body"
          name="body"
          maxLength={MAX_GIST_LENGTH}
          placeholder="Gist the mata, not the person."
          className="min-h-44"
          onChange={(event) => {
            setBody(event.currentTarget.value);
            setBodyCount(event.currentTarget.value.length);
          }}
          aria-describedby="followup-body-hint"
        />
        <div id="followup-body-hint" className="flex items-center justify-between gap-3 text-xs text-[var(--gm-ink-soft)]">
          <span>No full names, no phone numbers, no addresses.</span>
          <span aria-live="polite">{bodyCount}/{MAX_GIST_LENGTH}</span>
        </div>
        {draftAssist?.safety.severity === "warn" ? (
          <p className="text-xs leading-5 text-[var(--accent)]">{draftAssist.safety.reason}</p>
        ) : null}
        {draftAssist?.safety.severity === "block" ? (
          <p className="text-xs leading-5 text-[var(--destructive)]">{draftAssist.safety.reason}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="followup-tag" className="block text-sm font-semibold">
          This gist na mostly about wetin?
        </label>
        <select
          id="followup-tag"
          name="tag"
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          value={tag}
          onChange={(event) => {
            setTagTouched(true);
            setTag(event.currentTarget.value as typeof parentGist.tag);
          }}
        >
          {GIST_TAGS.map((gistTag) => (
            <option key={gistTag} value={gistTag}>
              {gistTag}
            </option>
          ))}
        </select>
        {draftAssist?.tagSuggestion.confidence &&
        draftAssist.tagSuggestion.confidence >= 0.58 ? (
          <p className="text-xs leading-5 text-[var(--gm-ink-soft)]">
            Suggested tag: {draftAssist.tagSuggestion.suggestedTag}. {draftAssist.tagSuggestion.reason}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="parentGistId" value={parentGist.id} />

      {state.message ? (
        <p
          role="alert"
          className={state.status === "error" ? "text-sm text-[var(--destructive)]" : "text-sm text-[var(--accent)]"}
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton
        idleLabel="Drop Follow-up Gist"
        pendingLabel="Dropping..."
        disabled={!online}
        className="w-full sm:w-auto"
      />
    </form>
  );
}
