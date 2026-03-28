"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ReferralCodeItem = {
  id: string;
  code: string;
  status?: "used" | "unused";
  helperText?: string | null;
};

export function ReferralCodeList({
  title,
  eyebrow = "Referral codes",
  description,
  codes,
  emptyText,
}: {
  title: string;
  eyebrow?: string;
  description: string;
  codes: ReferralCodeItem[];
  emptyText: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(codeId: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(codeId);
      window.setTimeout(() => {
        setCopiedId((current) => (current === codeId ? null : current));
      }, 2000);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <p className="muted-label">{eyebrow}</p>
        <h3 className="text-xl font-extrabold tracking-[-0.04em]">{title}</h3>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">{description}</p>
      </div>

      {codes.length === 0 ? (
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--gm-ink-soft)]">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((code) => {
            const copied = copiedId === code.id;

            return (
              <div
                key={code.id}
                className="flex flex-col gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <code className="block font-mono text-base font-bold tracking-[0.12em] text-[var(--foreground)]">
                    {code.code}
                  </code>
                  <p className="text-xs leading-5 text-[var(--gm-ink-soft)]">
                    {code.helperText ??
                      (code.status === "used"
                        ? "Used once already."
                        : "Unused. Single-use only.")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleCopy(code.id, code.code)}
                  icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
