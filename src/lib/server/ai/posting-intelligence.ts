import type { GistCardView, GistRelationType, GistTag } from "@/lib/domain/types";
import { ensureDraftSafety } from "@/lib/server/ai/ai-service";

export async function applyGistDraftIntelligence(input: {
  body: string;
  tag: GistTag;
}) {
  await ensureDraftSafety({
    gistText: input.body,
    selectedTag: input.tag,
    context: "new-gist",
  });

  return {
    tag: input.tag,
  };
}

export async function applyFollowUpDraftIntelligence(input: {
  body: string;
  tag: GistTag;
  relationType: GistRelationType;
  parentGist: Pick<GistCardView, "body" | "tag"> | null;
}) {
  await ensureDraftSafety({
    gistText: input.body,
    selectedTag: input.tag,
    relationType: input.relationType,
    context: "follow-up",
  });

  return {
    tag: input.tag,
    relationType: input.relationType,
  };
}
