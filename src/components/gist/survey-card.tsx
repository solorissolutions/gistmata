"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { voteSurveyAction } from "@/lib/server/mata-actions";
import type { SurveyView } from "@/lib/domain/types";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { compactNumber, percent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SurveyCard({
  survey,
  interactive = false,
}: {
  survey: SurveyView;
  interactive?: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    voteSurveyAction,
    INITIAL_ACTION_STATE,
  );
  const [optimisticOptionId, setOptimisticOptionId] = useState<string | null>(null);
  const surveyClosed = survey.status !== "live";
  const selectedOptionId = survey.viewerOptionId ?? optimisticOptionId;
  const hasVoted = survey.hasVoted || state.status === "success";
  const canVote = interactive && !surveyClosed && !hasVoted;

  useEffect(() => {
    if (state.status === "success") {
      startTransition(() => {
        router.refresh();
      });
    }
  }, [router, state.status]);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Badge>Judgement Day</Badge>
        <span className="text-xs text-[var(--gm-ink-soft)]">
          {compactNumber(survey.totalVotes)} votes
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-extrabold tracking-[-0.04em]">
          {survey.question}
        </h3>
        <p className="text-sm text-[var(--gm-ink-soft)]">
          Scope: {survey.scopeLabel}
        </p>
      </div>
      <div className="space-y-3">
        {survey.options.map((option) => {
          const selected = selectedOptionId === option.id;

          return (
            <div
              key={option.id}
              className="space-y-2 rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{option.label}</span>
                  {hasVoted && selected ? (
                    <span className="rounded-full bg-[var(--chip-active)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--chip-active-foreground)]">
                      Your vote
                    </span>
                  ) : null}
                </div>
                <span className="text-[var(--muted-foreground)]">
                  {percent(option.percentage)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--chip)]">
                <div
                  className="h-2 rounded-full bg-[var(--accent)]"
                  style={{ width: percent(option.percentage) }}
                />
              </div>

              {canVote ? (
                <form
                  action={action}
                  onSubmit={() => {
                    setOptimisticOptionId(option.id);
                  }}
                >
                  <input type="hidden" name="surveyId" value={survey.id} />
                  <input type="hidden" name="optionId" value={option.id} />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    className="h-9 rounded-full"
                  >
                    {pending && selected ? "Dropping vote..." : "Vote"}
                  </Button>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {state.message ? (
          <p
            className={
              state.status === "error"
                ? "text-sm leading-6 text-[var(--destructive)]"
                : "text-sm leading-6 text-[var(--accent)]"
            }
          >
            {state.message}
          </p>
        ) : hasVoted ? (
          <div className="flex items-start gap-2 text-sm leading-6 text-[var(--accent)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Your vote dey counted. Results still dey move live.</p>
          </div>
        ) : surveyClosed ? (
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            This Judgement Day don close. Results stay visible, but voting don stop.
          </p>
        ) : interactive ? (
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            Vote once only. You go collect {survey.pointsReward} GistPoints after successful vote.
          </p>
        ) : null}

        {!interactive ? (
          <Link
            href={`/judgement-day/${survey.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--gm-green-deep)]"
          >
            Open survey
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
