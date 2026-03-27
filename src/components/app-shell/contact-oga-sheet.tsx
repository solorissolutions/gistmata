"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { MessageSquare, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { CONTACT_OGA_CATEGORIES } from "@/lib/domain/constants";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitContactOga } from "@/lib/server/mata-actions";

const QUICK_CATEGORIES = CONTACT_OGA_CATEGORIES.filter((category) => category !== "Intel");

export function ContactOgaSheet({
  identity,
  collapsed = false,
}: {
  identity: string;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(submitContactOga, INITIAL_ACTION_STATE);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Contact oga"
        aria-label="Contact oga"
        aria-haspopup="dialog"
        className={`flex items-center rounded-2xl text-sm font-semibold transition text-[var(--gm-ink-soft)] hover:bg-[var(--gm-green-soft)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gm-green)] ${
          collapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-3 w-full"
        }`}
      >
        <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
        {collapsed ? (
          <span className="sr-only">Contact oga</span>
        ) : (
          <span>Contact oga</span>
        )}
      </button>

      {/* Sheet overlay */}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Contact oga"
          className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet panel */}
          <div className="relative z-10 w-full max-w-md rounded-t-[28px] border border-[var(--gm-border)] bg-[var(--background)] p-5 shadow-2xl lg:rounded-[28px]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="muted-label">Reach the platform</p>
                <h2 className="text-xl font-extrabold tracking-[-0.04em]">Contact oga</h2>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close contact oga"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            {state.status === "success" ? (
              <div className="rounded-[20px] bg-[var(--gm-green-soft)] px-4 py-4 text-sm text-[var(--gm-green-deep)]">
                <p className="font-semibold">Message don reach oga.</p>
                <p className="mt-1">We go read am. Your identity stay platform-only.</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-3 text-sm font-semibold underline underline-offset-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form action={action} className="space-y-4">
                <div className="rounded-[18px] border border-[var(--gm-border)] bg-[var(--gm-card)] px-3 py-3 text-sm">
                  <p className="muted-label">Sending as</p>
                  <p className="mt-1 font-semibold">{identity}</p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="oga-sheet-category" className="text-sm font-semibold">
                    Category
                  </label>
                  <select
                    id="oga-sheet-category"
                    name="category"
                    defaultValue="General"
                    className="h-11 w-full rounded-2xl border border-[var(--gm-border)] bg-[var(--gm-card)] px-4 text-sm text-[var(--foreground)]"
                  >
                    {QUICK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="oga-sheet-body" className="text-sm font-semibold">
                    Message
                  </label>
                  <textarea
                    id="oga-sheet-body"
                    name="body"
                    rows={4}
                    placeholder="Tell oga wetin dey happen..."
                    className="w-full rounded-[18px] border border-[var(--gm-border)] bg-[var(--gm-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none resize-none focus:border-[var(--gm-green)]"
                    aria-describedby="oga-sheet-hint"
                  />
                  <p id="oga-sheet-hint" className="text-xs text-[var(--gm-ink-soft)]">
                    No real name. No phone number. Platform identity only.
                  </p>
                </div>

                <p className="text-xs text-[var(--gm-ink-soft)]">
                  Need structured intel intake?{" "}
                  <Link href="/contact-oga" className="font-semibold text-[var(--foreground)] underline underline-offset-2">
                    Open full Contact oga page
                  </Link>
                  .
                </p>

                {state.status === "error" && state.message ? (
                  <p className="text-sm text-[var(--destructive)]" role="alert">
                    {state.message}
                  </p>
                ) : null}

                <SubmitButton
                  idleLabel="Send to oga"
                  pendingLabel="Sending..."
                  className="w-full"
                />
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
