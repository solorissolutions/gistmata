import "server-only";

import type { Viewer } from "@/lib/domain/types";
import type { SurveyCreationInput } from "@/lib/contracts/service-layer";
import {
  createSurveyRecord,
  fetchSurveyBundle,
  updateSurveyPinned,
  updateSurveyStatus,
} from "@/lib/server/repositories/survey-repository";
import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";
import { getCreateSurveyFromMatterHelper } from "@/lib/server/services/oga/matter-ops-service";

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

export async function publishSurvey(id: string, oga: Viewer) {
  return updateSurveyStatus({
    ogaId: oga.id,
    surveyId: id,
    status: "live",
  });
}

export async function closeSurvey(id: string, oga: Viewer) {
  return updateSurveyStatus({
    ogaId: oga.id,
    surveyId: id,
    status: "closed",
  });
}

export async function setSurveyPinned(id: string, pinned: boolean, oga: Viewer) {
  return updateSurveyPinned({
    ogaId: oga.id,
    surveyId: id,
    pinned,
  });
}

export async function setSurveyStatus(id: string, status: "draft" | "live" | "closed", oga: Viewer) {
  return updateSurveyStatus({
    ogaId: oga.id,
    surveyId: id,
    status,
  });
}

export async function getOgaSurveyBundle(id: string, viewerId: string) {
  return fetchSurveyBundle(id, viewerId);
}

export async function getLiveSurveyOpsBundle(filters?: { fromMatter?: string }) {
  const snapshot = await fetchOgaDashboardSnapshot();
  const helper = filters?.fromMatter
    ? await getCreateSurveyFromMatterHelper(filters.fromMatter)
    : null;

  return {
    summary: snapshot.judgementDay.summary,
    supportMatrix: snapshot.judgementDay.supportMatrix,
    surveys: snapshot.judgementDay.surveys,
    liveSurveys: snapshot.judgementDay.liveSurveys,
    sourceMatter: helper?.sourceMatter ?? null,
    prefilledQuestion: helper?.prefilledQuestion ?? "",
  };
}

export async function getSurveyAggregateResults(id: string, viewerId: string) {
  const bundle = await fetchSurveyBundle(id, viewerId);
  return bundle?.survey ?? null;
}
