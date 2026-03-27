import "server-only";

import {
  addCommentToGist,
  getGistBundle,
  toggleGistReaction,
  toggleSavedGist,
} from "@/lib/server/store";

export async function createComment(input: {
  viewerId: string;
  gistId: string;
  body: string;
}) {
  return addCommentToGist(input);
}

export async function toggleReaction(input: {
  viewerId: string;
  gistId: string;
  type: "wahala" | "omo" | "sharp";
}) {
  return toggleGistReaction(input);
}

export async function toggleSave(input: { viewerId: string; gistId: string }) {
  return toggleSavedGist(input);
}

export async function fetchInteractionBundle(gistId: string, viewerId: string) {
  return getGistBundle(gistId, viewerId);
}
