import Link from "next/link";

import { AccountCodeCard } from "@/components/join/account-code-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireJoinDraft } from "@/lib/server/services/onboarding";

export default async function JoinAccountCodePage() {
  const draft = await requireJoinDraft("username");

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="muted-label">Step 4</p>
        <h2 className="text-3xl font-extrabold tracking-[-0.05em]">Screenshot this now.</h2>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          Na this + your PIN go bring you back if phone loss.
        </p>
      </div>
      <AccountCodeCard code={draft.accountCode} />
      <Card className="space-y-2 bg-[var(--surface)]">
        <p className="muted-label">Recovery note</p>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          No email reset, no phone reset. Locker recovery na only Account Code + PIN.
        </p>
      </Card>
      <div className="flex flex-col gap-3 sm:flex-row">
        {draft.accountCode ? (
          <Link href="/join/basics" className="flex-1">
            <Button className="w-full">I don save am</Button>
          </Link>
        ) : (
          <Link href="/join/pin" className="flex-1">
            <Button className="w-full">Back to PIN</Button>
          </Link>
        )}
        <Link href="/locker/recovery" className="flex-1">
          <Button variant="secondary" className="w-full">
            See recovery page
          </Button>
        </Link>
      </div>
    </div>
  );
}
