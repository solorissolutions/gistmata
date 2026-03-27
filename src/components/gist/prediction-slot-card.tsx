import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PredictionModuleView } from "@/lib/domain/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PredictionSlotCard({
  prediction,
}: {
  prediction: PredictionModuleView;
}) {
  return (
    <Card className="space-y-4 border-[var(--accent)] bg-[var(--highlight-surface)]">
      <div className="flex items-center justify-between gap-3">
        <Badge>Predictions</Badge>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
          Future slot
        </span>
      </div>
      <div className="space-y-2">
        <p className="muted-label">{prediction.kicker}</p>
        <h2 className="text-2xl font-extrabold tracking-[-0.05em]">{prediction.title}</h2>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">{prediction.body}</p>
      </div>
      <Link
        href={`/predictions/${prediction.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
      >
        Open prediction lane
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
