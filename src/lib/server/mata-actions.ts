"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  commentSchema,
  contactOgaSchema,
  followUpGistSchema,
  gistSchema,
  INITIAL_ACTION_STATE,
  reportSchema,
  type ActionState,
} from "@/lib/domain/validation";
import { DraftSafetyIssue } from "@/lib/server/ai/ai-service";
import {
  actionError,
  actionSuccess,
  actionWarning,
  fromZodError,
} from "@/lib/server/action-state";
import { requireUser } from "@/lib/server/services/auth";
import { submitContactOgaMessage } from "@/lib/server/services/contact";
import { createGist } from "@/lib/server/services/gist";
import {
  addComment,
  toggleViewerReaction,
  toggleViewerSave,
} from "@/lib/server/services/interaction";
import { createFollowUpGist } from "@/lib/server/services/matter";
import { submitSurveyResponse } from "@/lib/server/services/survey";
import { submitReport as submitReportService } from "@/lib/server/services/trust";

export async function submitGist(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const viewer = await requireUser();
  const validated = gistSchema.safeParse({
    body: formData.get("body"),
    tag: formData.get("tag"),
    displayLocality: formData.get("displayLocality"),
    areaBucket: formData.get("areaBucket"),
    admin2Name: formData.get("admin2Name"),
    admin2Type: formData.get("admin2Type"),
    stateName: formData.get("stateName"),
    confidenceScore: formData.get("confidenceScore"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  let gistId = "";

  try {
    gistId = await createGist({
      body: validated.data.body,
      tag: validated.data.tag,
      location: {
        displayLocality: validated.data.displayLocality,
        areaBucket: validated.data.areaBucket,
        admin2Name: validated.data.admin2Name,
        admin2Type: validated.data.admin2Type,
        stateName: validated.data.stateName,
        confidenceScore: validated.data.confidenceScore,
      },
    }, viewer);
  } catch (error) {
    if (error instanceof DraftSafetyIssue) {
      return error.severity === "warn"
        ? actionWarning(error.message)
        : actionError(error.message);
    }
    return actionError(error instanceof Error ? error.message : "Gist no drop.");
  }

  revalidatePath("/mata");
  revalidatePath("/locker/my-gists");
  redirect(`/gist/${gistId}?dropped=1`);
}

export async function submitFollowUpGist(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const viewer = await requireUser();
  const validated = followUpGistSchema.safeParse({
    body: formData.get("body"),
    tag: formData.get("tag"),
    relationType: formData.get("relationType"),
    parentGistId: formData.get("parentGistId"),
    displayLocality: formData.get("displayLocality"),
    areaBucket: formData.get("areaBucket"),
    admin2Name: formData.get("admin2Name"),
    admin2Type: formData.get("admin2Type"),
    stateName: formData.get("stateName"),
    confidenceScore: formData.get("confidenceScore"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  let childGistId = "";

  try {
    childGistId = await createFollowUpGist({
      parentGistId: validated.data.parentGistId,
      relationType: validated.data.relationType,
      body: validated.data.body,
      tag: validated.data.tag,
      location: {
        displayLocality: validated.data.displayLocality,
        areaBucket: validated.data.areaBucket,
        admin2Name: validated.data.admin2Name,
        admin2Type: validated.data.admin2Type,
        stateName: validated.data.stateName,
        confidenceScore: validated.data.confidenceScore,
      },
    }, viewer);
  } catch (error) {
    if (error instanceof DraftSafetyIssue) {
      return error.severity === "warn"
        ? actionWarning(error.message)
        : actionError(error.message);
    }
    return actionError(error instanceof Error ? error.message : "Follow-up gist no drop.");
  }

  revalidatePath("/mata");
  revalidatePath(`/gist/${validated.data.parentGistId}`);
  redirect(`/gist/${childGistId}?dropped=1`);
}

export async function submitComment(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const viewer = await requireUser();
  const gistId = String(formData.get("gistId") ?? "");
  const validated = commentSchema.safeParse({
    body: formData.get("body"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await addComment(gistId, validated.data.body, viewer);
    revalidatePath(`/gist/${gistId}`);
    revalidatePath("/alerts");
    return actionSuccess("Comment don land.");
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Comment no drop.");
  }
}

export async function submitReport(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const viewer = await requireUser();
  const validated = reportSchema.safeParse({
    type: formData.get("type"),
    reasonText: formData.get("reasonText"),
    gistId: formData.get("gistId"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await submitReportService(validated.data, viewer);
    revalidatePath(`/gist/${validated.data.gistId}`);
    revalidatePath("/oga/trust");
    return actionSuccess("Report sent to oga queue.");
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Report no send.");
  }
}

export async function toggleReactionAction(formData: FormData) {
  const viewer = await requireUser();
  const gistId = String(formData.get("gistId") ?? "");
  const type = String(formData.get("type") ?? "") as "wahala" | "omo" | "sharp";

  await toggleViewerReaction(gistId, type, viewer);

  revalidatePath("/mata");
  revalidatePath(`/gist/${gistId}`);
}

export async function toggleSaveGistAction(formData: FormData) {
  const viewer = await requireUser();
  const gistId = String(formData.get("gistId") ?? "");

  await toggleViewerSave(gistId, viewer);

  revalidatePath("/mata");
  revalidatePath("/locker");
  revalidatePath("/locker/saved");
  revalidatePath(`/gist/${gistId}`);
}

export async function voteSurveyAction(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const viewer = await requireUser();
  const surveyId = String(formData.get("surveyId") ?? "");
  const optionId = String(formData.get("optionId") ?? "");

  try {
    const result = await submitSurveyResponse(surveyId, optionId, viewer);

    revalidatePath(`/judgement-day/${surveyId}`);
    revalidatePath("/mata");
    revalidatePath("/alerts");
    revalidatePath("/score");

    return actionSuccess(`Vote don land. +${result.pointsReward} GistPoints.`);
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Vote no land.",
    );
  }
}

export async function submitContactOga(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const viewer = await requireUser();
  const optionalField = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
  };
  const validated = contactOgaSchema.safeParse({
    accountCodeReference: optionalField("accountCodeReference"),
    category: optionalField("category"),
    body: formData.get("body"),
    intelMethod: optionalField("intelMethod"),
    intelUrgency: optionalField("intelUrgency"),
    intelSummary: optionalField("intelSummary"),
    intelLocationHint: optionalField("intelLocationHint"),
    intelLinkedGistReference: optionalField("intelLinkedGistReference"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await submitContactOgaMessage({
      accountCodeReference: validated.data.accountCodeReference,
      category: validated.data.category,
      body: validated.data.body,
      intel:
        validated.data.category === "Intel"
          ? {
              method: validated.data.intelMethod!,
              urgency: validated.data.intelUrgency!,
              summary: validated.data.intelSummary!,
              locationHint: validated.data.intelLocationHint,
              linkedGistReference: validated.data.intelLinkedGistReference,
            }
          : undefined,
    }, viewer);
    revalidatePath("/contact-oga");
    revalidatePath("/oga");
    revalidatePath("/oga/inbox");
    revalidatePath("/oga-v2");
    revalidatePath("/oga-v2/inbox");
    return actionSuccess(
      validated.data.category === "Intel"
        ? "Intel don land for oga queue."
        : "Message don land for oga inbox.",
    );
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Message no send.",
    );
  }
}
