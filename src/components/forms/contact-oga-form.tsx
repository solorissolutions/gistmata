"use client";

import { useActionState, useState } from "react";

import type { ContactOgaCategory } from "@/lib/domain/types";
import {
  CONTACT_OGA_CATEGORIES,
  CONTACT_OGA_EMAIL,
  INTEL_METHOD_OPTIONS,
  INTEL_URGENCY_OPTIONS,
} from "@/lib/domain/constants";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitContactOga } from "@/lib/server/mata-actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function ContactOgaForm({
  identity,
  accountCodeReference,
}: {
  identity: string;
  accountCodeReference: string | null;
}) {
  const [state, action] = useActionState(submitContactOga, INITIAL_ACTION_STATE);
  const [category, setCategory] = useState<ContactOgaCategory>("General");
  const isIntel = category === "Intel";

  return (
    <form action={action} className="space-y-4">
      <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
        <p className="muted-label">Your GistMata identity</p>
        <p className="mt-2 text-sm font-semibold">{identity}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
          No phone number. No real name. Just your platform identity.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">Category</span>
        <select
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value as ContactOgaCategory)}
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
        >
          {CONTACT_OGA_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">Account Code reference</span>
        <input
          name="accountCodeReference"
          defaultValue={accountCodeReference ?? ""}
          placeholder="Optional"
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
        />
        <p className="text-xs leading-5 text-[var(--gm-ink-soft)]">
          If this message na recovery matter, add the helpful part only.
        </p>
      </label>

      {isIntel ? (
        <>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">How you got this intel</span>
            <select
              name="intelMethod"
              required
              defaultValue={INTEL_METHOD_OPTIONS[0]?.value}
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
            >
              {INTEL_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Urgency</span>
            <select
              name="intelUrgency"
              required
              defaultValue="watch"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
            >
              {INTEL_URGENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Short summary</span>
            <input
              name="intelSummary"
              required
              maxLength={120}
              placeholder="One-line summary of the matter"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Location hint</span>
            <input
              name="intelLocationHint"
              maxLength={120}
              placeholder="Street, bus stop, market, junction, or area"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Linked Gist or reference</span>
            <input
              name="intelLinkedGistReference"
              maxLength={120}
              placeholder="Optional Gist link or gist ID"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
            />
          </label>
        </>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-semibold">
          {isIntel ? "Intel details" : "Message"}
        </span>
        <textarea
          name="body"
          placeholder={
            isIntel
              ? "State the matter plainly: what is happening, how you know, where it touches, and what oga should watch."
              : "Send message to oga"
          }
          className="min-h-36 w-full rounded-[22px] border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--input-foreground)] outline-none placeholder:text-[var(--input-placeholder)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--ring)]"
        />
      </label>

      <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4 text-sm leading-6 text-[var(--gm-ink-soft)]">
        <p className="font-semibold text-[var(--foreground)]">Contact oga</p>
        <p className="mt-2">Contact {CONTACT_OGA_EMAIL}</p>
        {isIntel ? (
          <p className="mt-2">
            Intel stays platform-only and lands in oga queue with your selected source method.
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
        idleLabel={isIntel ? "Send intel to oga" : "Send message to oga"}
        pendingLabel="Sending..."
      />
    </form>
  );
}
