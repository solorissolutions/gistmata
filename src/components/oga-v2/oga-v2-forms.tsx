"use client";

import { useActionState, useState } from "react";

import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import {
  createSurveyV2Action,
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

export function OgaV2SurveyComposer({
  prefillQuestion,
  prefillContext,
  sourceMatter,
}: {
  prefillQuestion?: string;
  prefillContext?: string;
  sourceMatter?: { id: string; label: string } | null;
}) {
  const [state, action] = useActionState(createSurveyV2Action, INITIAL_ACTION_STATE);
  const [surveyType, setSurveyType] = useState("single-choice");
  const [questionPreview, setQuestionPreview] = useState(prefillQuestion ?? "");
  const [optionOne, setOptionOne] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [optionThree, setOptionThree] = useState("");
  const supported = surveyType === "single-choice";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Survey type</span>
              <select
                name="surveyType"
                value={surveyType}
                onChange={(event) => setSurveyType(event.target.value)}
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
              >
                <option value="single-choice">Single-choice poll</option>
                <option value="multi-choice">Multi-choice</option>
                <option value="multi-question">Multi-question</option>
                <option value="anonymous-feedback">Anonymous feedback</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Close date</span>
              <input
                name="endsAt"
                type="date"
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Public question</span>
            <input
              name="question"
              defaultValue={prefillQuestion}
              onChange={(event) => setQuestionPreview(event.target.value)}
              placeholder="What should the public answer?"
              className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Operator context</span>
            <textarea
              defaultValue={prefillContext}
              placeholder="Internal context for oga. This is staged in the new dashboard and not persisted to the public runtime yet."
              className="min-h-24 w-full rounded-[22px] border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Target scope</span>
              <select
                name="scopeType"
                defaultValue="nigeria"
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
              >
                <option value="nigeria">Nigeria</option>
                <option value="state">State</option>
                <option value="area">Area</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Scope value</span>
              <input
                name="scopeValue"
                placeholder="Only if scope is state or area"
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Option one</span>
              <input
                name="optionOne"
                onChange={(event) => setOptionOne(event.target.value)}
                placeholder="Option one"
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Option two</span>
              <input
                name="optionTwo"
                onChange={(event) => setOptionTwo(event.target.value)}
                placeholder="Option two"
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Option three</span>
              <input
                name="optionThree"
                onChange={(event) => setOptionThree(event.target.value)}
                placeholder="Option three"
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
              />
            </label>
          </div>

          {sourceMatter ? (
            <div className="rounded-[22px] border border-dashed border-[var(--border)] px-4 py-4 text-sm leading-6 text-[var(--gm-ink-soft)]">
              <div className="font-semibold text-[var(--foreground)]">Triggered from matter</div>
              <div className="mt-1">{sourceMatter.label}</div>
              <input type="hidden" name="sourceMatterId" value={sourceMatter.id} />
            </div>
          ) : null}

          {!supported ? (
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-sm leading-6 text-[var(--gm-ink-soft)]">
              This survey mode is visible in the new dashboard now, but the public runtime still only publishes single-choice polls safely. Keep inspecting the control surface here; runtime wiring is the next backend step.
            </div>
          ) : null}

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
            idleLabel="Publish Judgement Day"
            pendingLabel="Publishing..."
            disabled={!supported}
          />
        </div>

        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
          <div className="muted-label">Preview</div>
          <div className="mt-3 space-y-3">
            <div className="text-sm font-semibold">
              {questionPreview || "Public question preview"}
            </div>
            <div className="space-y-2">
              {[optionOne, optionTwo, optionThree]
                .filter(Boolean)
                .map((option) => (
                  <div
                    key={option}
                    className="rounded-[18px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  >
                    {option}
                  </div>
                ))}
            </div>
            <p className="text-xs leading-5 text-[var(--gm-ink-soft)]">
              Single-choice goes live in the current runtime. The richer modes are surfaced here but still staged.
            </p>
          </div>
        </div>
      </div>
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
              placeholder="/alerts or /judgement-day/..."
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
