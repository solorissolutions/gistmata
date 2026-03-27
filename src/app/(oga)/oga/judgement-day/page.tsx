import { setSurveyStatusAction, toggleSurveyPinAction } from "@/lib/server/oga-actions";
import { PageHeader } from "@/components/blocks/page-header";
import { SurveyCreateForm } from "@/components/forms/survey-create-form";
import { SurveyCard } from "@/components/gist/survey-card";
import { Card } from "@/components/ui/card";
import { readStore } from "@/lib/server/store";

export default async function OgaJudgementDayPage() {
  const store = await readStore();
  const surveys = store.surveys
    .slice()
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt));

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Oga" title="Judgement Day" description="Create, pin, unpin, and close platform surveys." />
      <Card>
        <SurveyCreateForm />
      </Card>
      <div className="space-y-4">
        {surveys.map((survey) => (
          <Card key={survey.id} className="space-y-4">
            <SurveyCard
              survey={{
                id: survey.id,
                question: survey.question,
                scopeLabel: survey.scopeValue ?? survey.scopeType,
                status: survey.status,
                pinned: survey.pinned,
                startsAt: survey.startsAt,
                endsAt: survey.endsAt,
                hasVoted: false,
                viewerOptionId: null,
                totalVotes: store.surveyVotes.filter((vote) => vote.surveyId === survey.id).length,
                pointsReward: survey.pointsReward,
                options: store.surveyOptions
                  .filter((option) => option.surveyId === survey.id)
                  .map((option) => ({
                    id: option.id,
                    label: option.label,
                    votesCount: option.votesCount,
                    percentage:
                      store.surveyVotes.filter((vote) => vote.surveyId === survey.id).length === 0
                        ? 0
                        : option.votesCount /
                          store.surveyVotes.filter((vote) => vote.surveyId === survey.id).length,
                  })),
              }}
            />
            <div className="flex flex-wrap gap-2">
              <form action={toggleSurveyPinAction}>
                <input type="hidden" name="surveyId" value={survey.id} />
                <input type="hidden" name="pinned" value={String(!survey.pinned)} />
                <button className="rounded-full border border-[var(--gm-border)] px-4 py-2 text-sm font-semibold">
                  {survey.pinned ? "Unpin" : "Pin"}
                </button>
              </form>
              <form action={setSurveyStatusAction}>
                <input type="hidden" name="surveyId" value={survey.id} />
                <input
                  type="hidden"
                  name="status"
                  value={survey.status === "closed" ? "live" : "closed"}
                />
                <button className="rounded-full border border-[var(--gm-border)] px-4 py-2 text-sm font-semibold">
                  {survey.status === "closed" ? "Re-open" : "Close"}
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
