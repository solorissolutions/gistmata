import { OgaV2SurveyComposer } from "@/components/oga-v2/oga-v2-forms";
import { OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { setSurveyStatusV2Action, toggleSurveyPinV2Action } from "@/lib/server/oga-v2-actions";
import { getLiveSurveyOpsBundle } from "@/lib/server/services/oga/survey-ops-service";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2JudgementDayPage({
  searchParams,
}: {
  searchParams: Promise<{ fromMatter?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const data = await getLiveSurveyOpsBundle(resolvedSearch);
  const { summary, supportMatrix, surveys, sourceMatter, prefilledQuestion } = data;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Judgement Day"
        description="Create and control surveys from the operator side. Single-choice polls publish to the live runtime today; richer survey modes are visible here and staged for the next backend pass."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Total surveys",
            value: summary.total,
            hint: "All survey records in the current store.",
          },
          {
            label: "Live",
            value: summary.live,
            hint: "Currently open in the public runtime.",
            tone: "success",
          },
          {
            label: "Pinned",
            value: summary.pinned,
            hint: "One of these leads the public square.",
          },
          {
            label: "Total votes",
            value: summary.totalVotes,
            hint: `${summary.closed} closed surveys in history.`,
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <OgaV2Panel title="Survey composer" eyebrow="Create and publish">
          <OgaV2SurveyComposer
            prefillQuestion={prefilledQuestion}
            prefillContext={
              sourceMatter
                ? `${sourceMatter.tag} · ${sourceMatter.areaDisplay}, ${sourceMatter.stateName}`
                  : ""
              }
              sourceMatter={
                sourceMatter
                  ? {
                      id: sourceMatter.id,
                      label: `${sourceMatter.tag} · ${sourceMatter.areaDisplay}, ${sourceMatter.stateName}`,
                    }
                  : null
              }
            />
          </OgaV2Panel>

          <OgaV2Panel title="Live and recent surveys" eyebrow="Control queue">
            <div className="space-y-4">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <OgaV2Pill
                      tone={survey.runtimeStatus === "live" ? "success" : survey.runtimeStatus === "closed" ? "warning" : "neutral"}
                    >
                      {survey.runtimeStatus}
                    </OgaV2Pill>
                    {survey.pinned ? <OgaV2Pill>pinned</OgaV2Pill> : null}
                    <OgaV2Pill>{survey.totalVotes} votes</OgaV2Pill>
                  </div>
                  <div className="mt-3 text-base font-semibold">{survey.question}</div>
                  <div className="mt-1 text-sm text-[var(--gm-ink-soft)]">
                    Scope {survey.scopeValue ?? survey.scopeType} · created{" "}
                    {formatTimelineDate(survey.createdAt)} · closes {formatTimelineDate(survey.endsAt)}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    {survey.options.map((option) => (
                      <div key={option.id} className="flex items-center justify-between">
                        <span>{option.label}</span>
                        <span className="font-semibold">{option.votesCount}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={toggleSurveyPinV2Action}>
                      <input type="hidden" name="surveyId" value={survey.id} />
                      <input type="hidden" name="pinned" value={String(!survey.pinned)} />
                      <button className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold">
                        {survey.pinned ? "Unpin live slot" : "Pin live slot"}
                      </button>
                    </form>
                    <form action={setSurveyStatusV2Action}>
                      <input type="hidden" name="surveyId" value={survey.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={survey.runtimeStatus === "closed" ? "live" : "closed"}
                      />
                      <button className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold">
                        {survey.runtimeStatus === "closed" ? "Re-open" : "Close"}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Survey mode support" eyebrow="Runtime truth">
            <div className="space-y-3">
              {supportMatrix.map((entry) => (
                <div
                  key={entry.type}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{entry.type}</span>
                    <OgaV2Pill tone={entry.readiness === "Live runtime" ? "success" : "warning"}>
                      {entry.readiness}
                    </OgaV2Pill>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                    {entry.note}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          {sourceMatter ? (
            <OgaV2Panel title="Triggered from matter" eyebrow="Operator handoff">
              <div className="space-y-3 text-sm">
                <div className="font-semibold">
                  {sourceMatter.tag} · {sourceMatter.areaDisplay}, {sourceMatter.stateName}
                </div>
                <div className="leading-6 text-[var(--gm-ink-soft)]">{sourceMatter.body}</div>
                <div className="text-[var(--gm-ink-soft)]">
                  Use this handoff to convert an emerging public matter into a survey with context.
                </div>
              </div>
            </OgaV2Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
