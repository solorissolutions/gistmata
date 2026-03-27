import "server-only";

import type { Viewer } from "@/lib/domain/types";
import { commentSchema } from "@/lib/domain/validation";
import {
  createComment,
  fetchInteractionBundle,
  toggleReaction,
  toggleSave,
} from "@/lib/server/repositories/interaction-repository";

export async function addComment(gistId: string, body: string, viewer: Viewer) {
  const validated = commentSchema.parse({ body });

  return createComment({
    viewerId: viewer.id,
    gistId,
    body: validated.body,
  });
}

export async function addReaction(
  gistId: string,
  type: "wahala" | "omo" | "sharp",
  viewer: Viewer,
) {
  return toggleReaction({
    viewerId: viewer.id,
    gistId,
    type,
  });
}

export async function removeReaction(
  gistId: string,
  type: "wahala" | "omo" | "sharp",
  viewer: Viewer,
) {
  return toggleReaction({
    viewerId: viewer.id,
    gistId,
    type,
  });
}

export async function saveGist(gistId: string, viewer: Viewer) {
  return toggleSave({ viewerId: viewer.id, gistId });
}

export async function unsaveGist(gistId: string, viewer: Viewer) {
  return toggleSave({ viewerId: viewer.id, gistId });
}

export async function toggleViewerReaction(
  gistId: string,
  type: "wahala" | "omo" | "sharp",
  viewer: Viewer,
) {
  return toggleReaction({
    viewerId: viewer.id,
    gistId,
    type,
  });
}

export async function toggleViewerSave(gistId: string, viewer: Viewer) {
  return toggleSave({ viewerId: viewer.id, gistId });
}

export async function getViewerInteractionState(gistId: string, viewer: Viewer) {
  const bundle = await fetchInteractionBundle(gistId, viewer.id);

  return bundle
    ? {
        gistId,
        viewerReaction: bundle.gist.viewerReaction,
        isSaved: bundle.gist.isSaved,
        commentsCount: bundle.comments.length,
      }
    : null;
}
