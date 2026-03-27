"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function TranslationToggle({ text }: { text: string | null }) {
  const [open, setOpen] = useState(false);

  if (!text) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--gm-border)] px-3 py-2 text-xs text-[var(--gm-ink-soft)]">
        Translation stub ready for future provider.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="ghost"
        type="button"
        className="h-8 px-0 text-xs text-[var(--accent)]"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide translation" : "Show translation"}
      </Button>
      {open ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
          {text}
        </div>
      ) : null}
    </div>
  );
}
