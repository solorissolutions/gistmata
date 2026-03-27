import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { JOIN_DRAFT_COOKIE_NAME } from "@/lib/domain/constants";
import type { AgeRangeValue, GenderValue } from "@/lib/domain/types";
import {
  createJoinDraft,
  findJoinDraft,
  finalizeJoinDraft,
  updateJoinDraftBasics,
  updateJoinDraftPin,
  updateJoinDraftUsername,
} from "@/lib/server/repositories/onboarding-repository";
import { establishSessionForUser } from "@/lib/server/services/auth";

async function getJoinDraftCookieStore() {
  return cookies();
}

export async function getCurrentJoinDraftId() {
  return (await getJoinDraftCookieStore()).get(JOIN_DRAFT_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentJoinDraft() {
  return findJoinDraft(await getCurrentJoinDraftId());
}

export async function requireJoinDraft(
  requirement: "exists" | "username" | "account-code" = "exists",
) {
  const draft = await getCurrentJoinDraft();

  if (!draft) {
    redirect("/join");
  }

  if (requirement === "username" && !draft.username) {
    redirect("/join");
  }

  if (requirement === "account-code" && !draft.accountCode) {
    redirect("/join");
  }

  return draft;
}

export async function validateReferralForSignup(code: string) {
  const draft = await createJoinDraft(code);

  (await getJoinDraftCookieStore()).set(JOIN_DRAFT_COOKIE_NAME, draft.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2,
  });

  return draft;
}

export async function reserveUsername(username: string) {
  const draftId = await getCurrentJoinDraftId();

  if (!draftId) {
    throw new Error("Start from referral code first.");
  }

  await updateJoinDraftUsername(draftId, username);
  return findJoinDraft(draftId);
}

export async function createUserWithPinAndAccountCode(pin: string) {
  const draftId = await getCurrentJoinDraftId();

  if (!draftId) {
    throw new Error("Start from referral code first.");
  }

  await updateJoinDraftPin(draftId, pin);
  return findJoinDraft(draftId);
}

export async function completeOnboardingBasics(input: {
  state: string;
  ageRange: AgeRangeValue;
  gender: GenderValue;
}) {
  const draftId = await getCurrentJoinDraftId();

  if (!draftId) {
    throw new Error("Start from referral code first.");
  }

  await updateJoinDraftBasics(draftId, input);
  return findJoinDraft(draftId);
}

export async function finalizeFirstEntry() {
  const draftId = await getCurrentJoinDraftId();

  if (!draftId) {
    redirect("/join");
  }

  const completed = await finalizeJoinDraft(draftId);
  await establishSessionForUser(completed.userId);
  (await getJoinDraftCookieStore()).delete(JOIN_DRAFT_COOKIE_NAME);
  return completed;
}
