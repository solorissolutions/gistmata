import "server-only";

import type { GistRelationType, GistTag, LocationSnapshot } from "@/lib/domain/types";
import { dropFollowUpGist, getGistBundle } from "@/lib/server/store";

export async function createFollowUpRecord(input: {
  viewerId: string;
  parentGistId: string;
  relationType: GistRelationType;
  body: string;
  tag: GistTag;
  location: LocationSnapshot;
}) {
  return dropFollowUpGist(input);
}

export async function fetchMatterBundle(gistId: string, viewerId: string) {
  return getGistBundle(gistId, viewerId);
}
