"use client";

import { useEffect } from "react";
import { Bell, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";

export default function AlertsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        eyebrow="Alerts"
        title="Your alerts"
        description="Comments, Mata activity, points, and account notices stay here."
      />
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        <Bell className="h-8 w-8 text-[var(--gm-ink-soft)]" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold">Alerts no load right now.</p>
          <p className="text-sm text-[var(--gm-ink-soft)]">Small issue from our side. Try again.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      </Card>
    </div>
  );
}
