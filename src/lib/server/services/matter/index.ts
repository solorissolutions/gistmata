import "server-only";

import type { FollowUpGistDraftInput } from "@/lib/contracts/service-layer";
import type { LocationSnapshot, Viewer } from "@/lib/domain/types";
import { followUpGistSchema } from "@/lib/domain/validation";
import { applyFollowUpDraftIntelligence } from "@/lib/server/ai/posting-intelligence";
import {
  createFollowUpRecord,
  fetchMatterBundle,
} from "@/lib/server/repositories/matter-repository";

function normalizeGistLocation(location: LocationSnapshot) {
  return {
    displayLocality: location.displayLocality,
    areaBucket: location.areaBucket,
    admin2Name: location.admin2Name,
    admin2Type: location.admin2Type,
    stateName: location.stateName,
    confidenceScore: location.confidenceScore,
  };
}

export function assertViewerCanSubmitFollowUp(viewer: Viewer) {
  if (viewer.comotTagged) {
    throw new Error("Your account is under restriction and cannot submit follow-up gists.");
  }
}

export function validateFollowUpDraft(input: {
  body: string;
  tag: string;
  relationType: string;
  parentGistId: string;
  displayLocality: string;
  areaBucket: string;
  admin2Name: string;
  admin2Type: string;
  stateName: string;
  confidenceScore: number;
}) {
  return followUpGistSchema.parse(input);
}

export async function createFollowUpGist(input: FollowUpGistDraftInput, viewer: Viewer) {
  assertViewerCanSubmitFollowUp(viewer);

  const parentBundle = await fetchMatterBundle(input.parentGistId, viewer.id);
  const analyzedDraft = await applyFollowUpDraftIntelligence({
    body: input.body,
    tag: input.tag,
    relationType: input.relationType,
    parentGist: parentBundle?.gist ?? null,
  });

  return createFollowUpRecord({
    viewerId: viewer.id,
    parentGistId: input.parentGistId,
    relationType: analyzedDraft.relationType,
    body: input.body,
    tag: analyzedDraft.tag,
    location: normalizeGistLocation(input.location),
  });
}

export async function getMatterBundleByGist(gistId: string, viewer: Viewer) {
  return fetchMatterBundle(gistId, viewer.id);
}

export async function getMatterBundleByRootGist(rootGistId: string, viewer: Viewer) {
  return fetchMatterBundle(rootGistId, viewer.id);
}

export async function getRelatedFollowUps(gistId: string, viewer: Viewer) {
  const bundle = await fetchMatterBundle(gistId, viewer.id);
  return bundle?.followUps ?? [];
}

export async function getMatterSummary(rootGistId: string, viewer: Viewer) {
  const bundle = await fetchMatterBundle(rootGistId, viewer.id);

  if (!bundle) {
    return null;
  }

  return {
    gist: bundle.gist,
    followUps: bundle.followUps,
    commentsCount: bundle.comments.length,
  };
}
