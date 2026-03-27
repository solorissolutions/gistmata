import { describe, it, expect } from "vitest";

import {
  readStore,
  resetDemoStore,
  voteInSurvey,
} from "@/lib/server/store";

describe("voteInSurvey", () => {
  it("lets an eligible member vote once and awards points", async () => {
    await resetDemoStore();
    const before = await readStore();
    const survey = before.surveys.find((entry) => entry.status === "live");
    expect(survey).toBeTruthy();
    if (!survey) return;

    const option = before.surveyOptions.find((entry) => entry.surveyId === survey.id);
    expect(option).toBeTruthy();
    if (!option) return;

    const voter = before.users.find(
      (user) =>
        !user.isOga &&
        !before.surveyVotes.some(
          (vote) => vote.surveyId === survey.id && vote.userId === user.id,
        ),
    );
    expect(voter).toBeTruthy();
    if (!voter) return;

    const result = await voteInSurvey({
      viewerId: voter.id,
      surveyId: survey.id,
      optionId: option.id,
    });

    expect(result.pointsReward).toBe(survey.pointsReward);

    const after = await readStore();
    const refreshedUser = after.users.find((user) => user.id === voter.id);
    const recordedVote = after.surveyVotes.find(
      (vote) => vote.surveyId === survey.id && vote.userId === voter.id,
    );

    expect(refreshedUser).toBeTruthy();
    expect(recordedVote).toBeTruthy();
    expect(refreshedUser?.pointsBalance).toBe(voter.pointsBalance + survey.pointsReward);
  });

  it("blocks duplicate votes on the same survey", async () => {
    await resetDemoStore();
    const store = await readStore();
    const existingVote = store.surveyVotes[0];
    expect(existingVote).toBeTruthy();
    if (!existingVote) return;

    await expect(
      voteInSurvey({
        viewerId: existingVote.userId,
        surveyId: existingVote.surveyId,
        optionId: existingVote.optionId,
      }),
    ).rejects.toThrow(/You don vote already\./);
  });

  it("blocks voting on closed surveys", async () => {
    await resetDemoStore();
    const store = await readStore();
    const closedSurvey = store.surveys.find((entry) => entry.status === "closed");
    expect(closedSurvey).toBeTruthy();
    if (!closedSurvey) return;

    const option = store.surveyOptions.find((entry) => entry.surveyId === closedSurvey.id);
    const voter = store.users.find((user) => !user.isOga);

    expect(option).toBeTruthy();
    expect(voter).toBeTruthy();
    if (!option || !voter) return;

    await expect(
      voteInSurvey({
        viewerId: voter.id,
        surveyId: closedSurvey.id,
        optionId: option.id,
      }),
    ).rejects.toThrow(/That Judgement Day vote no open now\./);
  });
});
