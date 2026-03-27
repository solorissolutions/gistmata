import "server-only";

import type { GistDraftInput } from "@/lib/contracts/service-layer";
import type { LocationSnapshot, Viewer } from "@/lib/domain/types";
import { gistSchema } from "@/lib/domain/validation";
import { applyGistDraftIntelligence } from "@/lib/server/ai/posting-intelligence";
import {
  createGistRecord,
  fetchGistBundle,
  fetchLockerBundle,
} from "@/lib/server/repositories/gist-repository";

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

export function canViewerPostGist(viewer: Viewer) {
  return !viewer.comotTagged;
}

export function validateGistDraft(input: {
  body: string;
  tag: string;
  displayLocality: string;
  areaBucket: string;
  admin2Name: string;
  admin2Type: string;
  stateName: string;
  confidenceScore: number;
}) {
  return gistSchema.parse(input);
}

export async function createGist(input: GistDraftInput, viewer: Viewer) {
  if (!canViewerPostGist(viewer)) {
    throw new Error("Your account is under restriction and cannot post right now.");
  }

  const analyzedDraft = await applyGistDraftIntelligence({
    body: input.body,
    tag: input.tag,
  });

  return createGistRecord({
    viewerId: viewer.id,
    body: input.body,
    tag: analyzedDraft.tag,
    location: normalizeGistLocation(input.location),
  });
}

export async function getGistById(gistId: string, viewer: Viewer) {
  return fetchGistBundle(gistId, viewer.id);
}

export async function getViewerLockerBundle(viewer: Viewer) {
  return fetchLockerBundle(viewer.id);
}

export async function getViewerGists(viewer: Viewer) {
  const bundle = await fetchLockerBundle(viewer.id);
  return bundle.myGists;
}
