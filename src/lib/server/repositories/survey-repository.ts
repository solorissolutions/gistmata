import "server-only";

import {
  createSurvey,
  getSurveyBundle,
  setSurveyPinned,
  setSurveyStatus,
  voteInSurvey,
} from "@/lib/server/store";

export async function fetchSurveyBundle(surveyId: string, viewerId: string) {
  return getSurveyBundle(surveyId, viewerId);
}

export async function createSurveyRecord(input: {
  ogaId: string;
  question: string;
  scopeType: "nigeria" | "state" | "area";
  scopeValue?: string;
  endsAt: string;
  options: [string, string, string];
}) {
  return createSurvey(input);
}

export async function createSurveyVote(input: {
  viewerId: string;
  surveyId: string;
  optionId: string;
}) {
  return voteInSurvey(input);
}

export async function updateSurveyPinned(input: {
  ogaId: string;
  surveyId: string;
  pinned: boolean;
}) {
  return setSurveyPinned(input);
}

export async function updateSurveyStatus(input: {
  ogaId: string;
  surveyId: string;
  status: "draft" | "live" | "closed";
}) {
  return setSurveyStatus(input);
}
