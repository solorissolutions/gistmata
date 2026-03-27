import { NextResponse } from "next/server";

import { draftAssistRequestSchema } from "@/lib/ai/contracts";
import {
  analyzeDraftSafety,
  suggestDraftTag,
  suggestRelationType,
} from "@/lib/server/ai/ai-service";
import { requireUser } from "@/lib/server/services/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireUser();

    const json = await request.json();
    const payload = draftAssistRequestSchema.parse(json);

    const [safety, tagSuggestion, relationSuggestion] = await Promise.all([
      analyzeDraftSafety({
        gistText: payload.body,
        selectedTag: payload.currentTag,
        relationType: payload.currentRelationType,
        context: payload.context,
      }),
      suggestDraftTag({
        gistText: payload.body,
        currentTag: payload.currentTag,
      }),
      payload.context === "follow-up" && payload.parentGistText
        ? suggestRelationType({
            gistText: payload.body,
            parentGistText: payload.parentGistText,
            currentRelationType: payload.currentRelationType,
          })
        : Promise.resolve(undefined),
    ]);

    return NextResponse.json({
      safety,
      tagSuggestion,
      relationSuggestion,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Draft hints request no valid." },
        { status: 400 },
      );
    }

    console.warn(
      `[gistmata-ai] ${JSON.stringify({
        action: "draft-hints-route",
        at: new Date().toISOString(),
        reason: error instanceof Error ? error.message : "unknown",
      })}`,
    );

    return NextResponse.json(
      { message: "Draft hints no clear right now." },
      { status: 500 },
    );
  }
}
