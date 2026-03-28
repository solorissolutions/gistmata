"use client";

import { useActionState, useState } from "react";

import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import {
  generateReferralsV2Action,
  pinGistV2Action,
  sendBroadcastV2Action,
  unpinGistV2Action,
} from "@/lib/server/oga-v2-actions";

export function OgaV2PinControls({
  gistId,
  pinnedPriority,
}: {
  gistId: string;
  pinnedPriority: 1 | 2 | 3 | null;
}) {
  const [state, action] = useActionState(pinGistV2Action, INITIAL_ACTION_STATE);

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
                  : "border-[var(--gm-border)] bg-[var(--surface)]"
              }`}
            >
              {pinnedPriority === priority ? `Pinned ${priority}` : `Pin ${priority}`}
            </button>
          </form>
        ))}
        {pinnedPriority ? (
          <form action={unpinGistV2Action}>
            <input type="hidden" name="gistId" value={gistId} />
            <button className="rounded-full border border-[var(--gm-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold">
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

export function OgaV2ReferralBatchForm() {
  const [state, action] = useActionState(generateReferralsV2Action, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold">Batch size</span>
          <input
            name="count"
            type="number"
            min={1}
            max={10}
            defaultValue={5}
            className="h-11 w-28 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          />
        </label>
        <SubmitButton idleLabel="Generate referrals" pendingLabel="Generating..." />
      </div>
      <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
        Fresh codes are generated straight into the existing referral store and become available immediately.
      </p>
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
    </form>
  );
}

export function OgaV2BroadcastComposer() {
  const [state, action] = useActionState(sendBroadcastV2Action, INITIAL_ACTION_STATE);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("/alerts");
  const [audience, setAudience] = useState("all");
  const [stateName, setStateName] = useState("");

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Audience</span>
              <select
                name="audience"
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
              >
                <option value="all">All users</option>
                <option value="inactive">Inactive users</option>
                <option value="state">One state</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">State</span>
              <input
                name="stateName"
                value={stateName}
                onChange={(event) => setStateName(event.target.value)}
                placeholder="Needed only for one-state alerts"
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Title</span>
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Alert title"
              className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Body</span>
            <textarea
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="What should users see?"
              className="min-h-28 w-full rounded-[22px] border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Link</span>
            <input
              name="link"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="/alerts or /mata/..."
              className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
            />
          </label>

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

          <SubmitButton idleLabel="Send broadcast" pendingLabel="Sending..." />
        </div>

        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
          <div className="muted-label">Preview</div>
          <div className="mt-3 space-y-3 rounded-[20px] border border-[var(--border)] bg-[var(--background)] px-4 py-4">
            <div className="text-xs uppercase tracking-[0.12em] text-[var(--gm-ink-soft)]">
              {audience === "state" ? `State alert${stateName ? `: ${stateName}` : ""}` : audience}
            </div>
            <div className="text-base font-extrabold tracking-[-0.03em]">
              {title || "Broadcast title"}
            </div>
            <div className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              {body || "Broadcast body preview"}
            </div>
            <div className="text-xs text-[var(--gm-ink-soft)]">{link || "/alerts"}</div>
          </div>
        </div>
      </div>
    </form>
  );
}
