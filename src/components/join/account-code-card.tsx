"use client";

import { useState } from "react";
import { AlertCircle, Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AccountCodeCard({ code }: { code?: string | null }) {
  const [copied, setCopied] = useState(false);
  const visibleCode = code?.trim() ?? "";
  const missingCode = visibleCode.length === 0;

  async function handleCopy() {
    if (missingCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(visibleCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="space-y-5 border-[var(--gm-green-deep)] bg-[linear-gradient(180deg,#0e5230_0%,#0b2218_100%)] p-6 text-white shadow-[0_18px_40px_rgba(8,35,22,0.28)]">
      <div className="space-y-2">
        <div className="muted-label !text-white/72">Account Code</div>
        <div
          className="rounded-[24px] border border-white/18 bg-[#08150f] px-4 py-4 shadow-inner shadow-black/20"
          aria-live="polite"
        >
          {missingCode ? (
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#f8d8a6]" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  Account Code no show yet.
                </p>
                <p className="text-sm leading-6 text-white/74">
                  Go back to PIN step and try again. Recovery for GistMata still depends on
                  Account Code + PIN.
                </p>
              </div>
            </div>
          ) : (
            <code className="block overflow-hidden break-all font-mono text-[1.55rem] font-bold tracking-[0.16em] text-[#f5fff7] sm:text-[1.85rem]">
              {visibleCode}
            </code>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded-[20px] border border-white/12 bg-white/8 px-4 py-3 text-sm leading-6 text-white/88">
        <p className="font-semibold text-white">Screenshot this now.</p>
        <p>Shown once in this join flow.</p>
        <p>Na this + your PIN go bring you back if phone loss.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCopy}
          disabled={missingCode}
          icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        >
          {copied ? "Code copied" : "Copy code"}
        </Button>
        <p className="text-sm text-white/78" role="status" aria-live="polite">
          {copied ? "Copied. Save am well before you move on." : "Read am, save am, then continue."}
        </p>
      </div>
    </Card>
  );
}
