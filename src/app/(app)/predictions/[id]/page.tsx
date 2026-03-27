import { notFound } from "next/navigation";

import { BackButton } from "@/components/blocks/back-button";
import { PageHeader } from "@/components/blocks/page-header";
import { Card } from "@/components/ui/card";
import { requireViewer } from "@/lib/server/auth/dal";
import { readStore } from "@/lib/server/store";

export default async function PredictionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireViewer();
  const resolvedParams = await params;
  const store = await readStore();
  const prediction = store.predictionModules.find((entry) => entry.id === resolvedParams.id);

  if (!prediction) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        eyebrow="Predictions"
        title={prediction.title}
        description="This slot is structurally ready above Mata, but the full predictions market still stays behind a feature flag."
        actions={<BackButton fallbackHref="/mata" />}
      />
      <Card className="space-y-3">
        <p className="muted-label">{prediction.kicker}</p>
        <p className="text-sm leading-7 text-[var(--gm-ink-soft)]">{prediction.body}</p>
      </Card>
      <Card className="space-y-3">
        <p className="muted-label">Future placement</p>
        <p className="text-sm leading-7 text-[var(--gm-ink-soft)]">
          When predictions turn on, this module sits above Judgement Day, pinned Gists,
          and the regular Mata feed.
        </p>
      </Card>
    </div>
  );
}
