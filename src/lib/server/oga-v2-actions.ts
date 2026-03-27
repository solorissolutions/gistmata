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
import { createBroadcast } from "@/lib/server/services/alerts";
import { requireOgaV2 } from "@/lib/server/services/auth";
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

function revalidateMany(paths: string[]) {
  for (const path of new Set(paths)) {
    revalidatePath(path);
  }
}

export async function moderateGistV2Action(formData: FormData) {
  const oga = await requireOgaV2();
  const gistId = String(formData.get("gistId") ?? "");
  const status = String(formData.get("status") ?? "") as "active" | "removed";

  if (status === "removed") {
    await removeGist(gistId, oga);
  } else {
    await restoreGist(gistId, oga);
  }

  revalidateMany([
    "/oga",
    "/oga/gists",
    "/oga/trust",
    "/oga-v2",
    "/oga-v2/mata",
    "/oga-v2/matters",
    "/oga-v2/trust",
    "/mata",
  ]);
}

export async function pinGistV2Action(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const oga = await requireOgaV2();
  const gistId = String(formData.get("gistId") ?? "");
  const priority = Number(formData.get("priority") ?? "0") as 1 | 2 | 3;

  try {
    await pinGist(gistId, priority, oga);
    revalidateMany([
      "/oga/gists",
      "/oga/mata",
      "/oga-v2",
      "/oga-v2/mata",
      "/oga-v2/matters",
      "/mata",
    ]);
    return actionSuccess(`Pinned at slot ${priority}.`);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Gist no pin.");
  }
}

export async function unpinGistV2Action(formData: FormData) {
  const oga = await requireOgaV2();
  const gistId = String(formData.get("gistId") ?? "");

  await unpinGist(gistId, oga);
  revalidateMany([
    "/oga/gists",
    "/oga/mata",
    "/oga-v2",
    "/oga-v2/mata",
    "/oga-v2/matters",
    "/mata",
  ]);
}

export async function createSurveyV2Action(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const surveyType = String(formData.get("surveyType") ?? "single-choice");

  if (surveyType !== "single-choice") {
    return actionError(
      "The current public Judgement Day runtime only publishes single-choice polls. The other survey modes are staged in oga-v2 but still need runtime wiring.",
    );
  }

  const oga = await requireOgaV2();
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
    revalidateMany([
      "/oga/judgement-day",
      "/oga-v2",
      "/oga-v2/judgement-day",
      "/mata",
      "/alerts",
    ]);
    return actionSuccess("Judgement Day don publish.");
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Survey no publish.");
  }
}

export async function toggleSurveyPinV2Action(formData: FormData) {
  const oga = await requireOgaV2();
  const surveyId = String(formData.get("surveyId") ?? "");
  const pinned = String(formData.get("pinned") ?? "") === "true";

  await setSurveyPinned(surveyId, pinned, oga);
  revalidateMany([
    "/oga/judgement-day",
    "/oga-v2",
    "/oga-v2/judgement-day",
    "/mata",
  ]);
}

export async function setSurveyStatusV2Action(formData: FormData) {
  const oga = await requireOgaV2();
  const surveyId = String(formData.get("surveyId") ?? "");
  const status = String(formData.get("status") ?? "") as "draft" | "live" | "closed";

  await setSurveyStatus(surveyId, status, oga);
  revalidateMany([
    "/oga/judgement-day",
    "/oga-v2",
    "/oga-v2/judgement-day",
    "/mata",
    "/alerts",
  ]);
}

export async function generateReferralsV2Action(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const oga = await requireOgaV2();
  const validated = referralGenerateSchema.safeParse({
    count: formData.get("count"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await generateReferralBatch(validated.data.count, oga);
    revalidateMany(["/oga/growth", "/oga-v2", "/oga-v2/growth"]);
    return actionSuccess("Fresh referral batch don land.");
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Referral batch no generate.",
    );
  }
}

export async function sendBroadcastV2Action(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const oga = await requireOgaV2();
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
    revalidateMany([
      "/oga/broadcast",
      "/oga-v2",
      "/oga-v2/broadcast",
      "/alerts",
    ]);
    return actionSuccess("Broadcast don queue for app alerts.");
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Broadcast no send.",
    );
  }
}

export async function updateContactMessageStatusV2Action(formData: FormData) {
  const oga = await requireOgaV2();
  const messageId = String(formData.get("messageId") ?? "");
  const status = String(formData.get("status") ?? "") as "read" | "archived";

  if (status === "read") {
    await markMessageRead(messageId, oga);
  } else {
    await archiveMessage(messageId, oga);
  }

  revalidateMany([
    "/oga",
    "/oga/inbox",
    "/oga-v2",
    "/oga-v2/inbox",
  ]);
}
