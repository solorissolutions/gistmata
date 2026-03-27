import { notFound } from "next/navigation";

import { PageWithContextRail } from "@/components/app-shell/page-with-context-rail";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";
import { SurveyCard } from "@/components/gist/survey-card";
import { requireUser } from "@/lib/server/services/auth";
import { getSurveyBundle } from "@/lib/server/services/survey";

export default async function JudgementDayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requireUser();
  const resolvedParams = await params;
  const data = await getSurveyBundle(resolvedParams.id, viewer);

  if (!data.survey) {
    notFound();
  }

  return (
    <PageWithContextRail
      storageKey="gm-judgement-day-context-collapsed"
      mobileLabel="Survey context"
      sections={[
        {
          id: "privacy",
          title: "Privacy",
          defaultOpen: true,
          content: (
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              Voting stays anonymous. This page no show who vote for what.
            </p>
          ),
        },
        {
          id: "reward",
          title: "Reward",
          content: (
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              Voting this survey gives {data.survey.pointsReward} GistPoints.
            </p>
          ),
        },
      ]}
      main={
        <div className="space-y-5">
          <PageHeader
            eyebrow="Judgement Day"
            title={data.survey.status === "live" ? "Live survey" : "Survey results"}
            description={
              data.survey.status === "live"
                ? "Vote stays anonymous. Results move in real time."
                : "Voting don close, but the result still dey visible to everybody."
            }
          />
          <SurveyCard survey={data.survey} interactive />
          <Card className="space-y-2">
            <p className="muted-label">Reward</p>
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              Voting this survey gives {data.survey.pointsReward} GistPoints.
            </p>
          </Card>
        </div>
      }
    />
  );
}
