import "server-only";

import type { GistTag, LocationSnapshot } from "@/lib/domain/types";
import { dropGist, getGistBundle, getLockerBundle } from "@/lib/server/store";

export async function createGistRecord(input: {
  viewerId: string;
  body: string;
  tag: GistTag;
  location: LocationSnapshot;
}) {
  return dropGist(input);
}

export async function fetchGistBundle(gistId: string, viewerId: string) {
  return getGistBundle(gistId, viewerId);
}

export async function fetchLockerBundle(viewerId: string) {
  return getLockerBundle(viewerId);
}
