import "server-only";

import type { SurveyCreationInput } from "@/lib/contracts/service-layer";
import type { Viewer } from "@/lib/domain/types";
import {
  createSurveyRecord,
  createSurveyVote,
  fetchSurveyBundle,
  updateSurveyPinned,
  updateSurveyStatus,
} from "@/lib/server/repositories/survey-repository";
import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";

export async function createSurvey(input: SurveyCreationInput, oga: Viewer) {
  return createSurveyRecord({
    ogaId: oga.id,
    question: input.question,
    scopeType: input.scopeType,
    scopeValue: input.scopeValue,
    endsAt: input.endsAt,
    options: input.options,
  });
}

export async function publishSurvey(surveyId: string, oga: Viewer) {
  return updateSurveyStatus({
    ogaId: oga.id,
    surveyId,
    status: "live",
  });
}

export async function closeSurvey(surveyId: string, oga: Viewer) {
  return updateSurveyStatus({
    ogaId: oga.id,
    surveyId,
    status: "closed",
  });
}

export async function setSurveyPinnedState(
  surveyId: string,
  pinned: boolean,
  oga: Viewer,
) {
  return updateSurveyPinned({
    ogaId: oga.id,
    surveyId,
    pinned,
  });
}

export async function setSurveyRuntimeStatus(
  surveyId: string,
  status: "draft" | "live" | "closed",
  oga: Viewer,
) {
  return updateSurveyStatus({
    ogaId: oga.id,
    surveyId,
    status,
  });
}

export async function getSurveyBundle(surveyId: string, viewer: Viewer) {
  return fetchSurveyBundle(surveyId, viewer.id);
}

export async function getLiveSurveyBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.judgementDay.liveSurveys[0] ?? null;
}

export async function submitSurveyResponse(
  surveyId: string,
  optionId: string,
  viewer: Viewer,
) {
  return createSurveyVote({
    viewerId: viewer.id,
    surveyId,
    optionId,
  });
}

export async function getSurveyResultsAggregate(surveyId: string, viewer: Viewer) {
  const bundle = await fetchSurveyBundle(surveyId, viewer.id);
  return bundle?.survey ?? null;
}

export async function getSurveyDetailForOga() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.judgementDay;
}
