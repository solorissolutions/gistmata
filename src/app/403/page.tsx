import Link from "next/link";

import { LogoLockup } from "@/components/blocks/logo-lockup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const reason = resolvedSearch.reason;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <LogoLockup />
      <Card className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="muted-label">403</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">
            This side na oga only.
          </h1>
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            {reason === "oga-only"
              ? "The oga dashboard no be public Mata space. Only the reserved oga account fit enter here."
              : "You no get access to this page."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/mata" className="flex-1">
            <Button className="w-full">Back to Mata</Button>
          </Link>
          <Link href="/locker/recovery" className="flex-1">
            <Button variant="secondary" className="w-full">
              Recover oga account
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
