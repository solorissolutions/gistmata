"use server";

import { revalidatePath } from "next/cache";

import {
  broadcastSchema,
  INITIAL_ACTION_STATE,
  referralGenerateSchema,
  surveySchema,
  type ActionState,
} from "@/lib/domain/validation";
import { actionError, actionSuccess, fromZodError } from "@/lib/server/action-state";
import { requireOga } from "@/lib/server/services/auth";
import { createBroadcast } from "@/lib/server/services/alerts";
import { generateReferralBatch } from "@/lib/server/services/referral";
import {
  createSurvey,
  setSurveyPinned,
  setSurveyStatus,
} from "@/lib/server/services/oga/survey-ops-service";
import {
  archiveMessage,
  markMessageRead,
} from "@/lib/server/services/oga/inbox-service";
import {
  pinGist,
  removeGist,
  restoreGist,
  unpinGist,
} from "@/lib/server/services/oga/matter-ops-service";

export async function moderateGistAction(formData: FormData) {
  const oga = await requireOga();
  const gistId = String(formData.get("gistId") ?? "");
  const status = String(formData.get("status") ?? "") as "active" | "removed";

  if (status === "removed") {
    await removeGist(gistId, oga);
  } else {
    await restoreGist(gistId, oga);
  }

  revalidatePath("/oga/gists");
  revalidatePath("/mata");
}

export async function pinGistAction(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const oga = await requireOga();
  const gistId = String(formData.get("gistId") ?? "");
  const priority = Number(formData.get("priority") ?? "0") as 1 | 2 | 3;

  try {
    await pinGist(gistId, priority, oga);
    revalidatePath("/oga/gists");
    revalidatePath("/mata");
    return actionSuccess(`Pinned by oga at slot ${priority}.`);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Gist no pin.");
  }
}

export async function unpinGistAction(formData: FormData) {
  const oga = await requireOga();
  const gistId = String(formData.get("gistId") ?? "");

  await unpinGist(gistId, oga);
  revalidatePath("/oga/gists");
  revalidatePath("/mata");
}

export async function createSurveyAction(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const oga = await requireOga();
  const validated = surveySchema.safeParse({
    question: formData.get("question"),
    scopeType: formData.get("scopeType"),
    scopeValue: formData.get("scopeValue"),
    endsAt: formData.get("endsAt"),
    optionOne: formData.get("optionOne"),
    optionTwo: formData.get("optionTwo"),
    optionThree: formData.get("optionThree"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await createSurvey({
      question: validated.data.question,
      scopeType: validated.data.scopeType,
      scopeValue: validated.data.scopeValue,
      endsAt: validated.data.endsAt,
      options: [
        validated.data.optionOne,
        validated.data.optionTwo,
        validated.data.optionThree,
      ],
    }, oga);
    revalidatePath("/oga/judgement-day");
    revalidatePath("/mata");
    return actionSuccess("New Judgement Day don publish.");
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Survey no publish.");
  }
}

export async function toggleSurveyPinAction(formData: FormData) {
  const oga = await requireOga();
  const surveyId = String(formData.get("surveyId") ?? "");
  const pinned = String(formData.get("pinned") ?? "") === "true";

  await setSurveyPinned(surveyId, pinned, oga);
  revalidatePath("/oga/judgement-day");
  revalidatePath("/mata");
}

export async function setSurveyStatusAction(formData: FormData) {
  const oga = await requireOga();
  const surveyId = String(formData.get("surveyId") ?? "");
  const status = String(formData.get("status") ?? "") as "draft" | "live" | "closed";

  await setSurveyStatus(surveyId, status, oga);
  revalidatePath("/oga/judgement-day");
  revalidatePath("/mata");
}

export async function generateReferralsAction(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const oga = await requireOga();
  const validated = referralGenerateSchema.safeParse({
    count: formData.get("count"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await generateReferralBatch(validated.data.count, oga);
    revalidatePath("/oga/growth");
    return actionSuccess("Fresh referral batch don land.");
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Referral batch no generate.",
    );
  }
}

export async function sendBroadcastAction(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const oga = await requireOga();
  const validated = broadcastSchema.safeParse({
    audience: formData.get("audience"),
    stateName: formData.get("stateName"),
    title: formData.get("title"),
    body: formData.get("body"),
    link: formData.get("link"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await createBroadcast({
      audience: validated.data.audience,
      stateName: validated.data.stateName,
      title: validated.data.title,
      body: validated.data.body,
      link: validated.data.link,
    }, oga);
    revalidatePath("/oga/broadcast");
    revalidatePath("/alerts");
    return actionSuccess("Broadcast don queue for app alerts.");
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Broadcast no send.",
    );
  }
}

export async function updateContactMessageStatusAction(formData: FormData) {
  const oga = await requireOga();
  const messageId = String(formData.get("messageId") ?? "");
  const status = String(formData.get("status") ?? "") as "read" | "archived";

  if (status === "read") {
    await markMessageRead(messageId, oga);
  } else {
    await archiveMessage(messageId, oga);
  }

  revalidatePath("/oga");
  revalidatePath("/oga-v2");
  revalidatePath("/oga-v2/inbox");
}
