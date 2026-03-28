"use server";

import { redirect } from "next/navigation";

import {
  basicsSchema,
  INITIAL_ACTION_STATE,
  type ActionState,
  loginSchema,
  pinSchema,
  recoverySchema,
  referralCodeSchema,
  usernameSchema,
} from "@/lib/domain/validation";
import { actionError, fromZodError } from "@/lib/server/action-state";
import {
  loginWithUsernamePin,
  logoutUser,
  recoverUserSession,
} from "@/lib/server/services/auth";
import { getOperatorDashboardDestination } from "@/lib/server/operator-app";
import {
  completeOnboardingBasics,
  createUserWithPinAndAccountCode,
  finalizeFirstEntry,
  reserveUsername,
  validateReferralForSignup,
} from "@/lib/server/services/onboarding";

export async function submitReferralCode(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const validated = referralCodeSchema.safeParse({
    code: formData.get("code"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await validateReferralForSignup(validated.data.code);
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Referral code no clear.",
    );
  }

  redirect("/join/username");
}

export async function submitUsername(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const validated = usernameSchema.safeParse({
    username: formData.get("username"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await reserveUsername(validated.data.username);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Username no work.");
  }

  redirect("/join/pin");
}

export async function submitPin(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const validated = pinSchema.safeParse({
    pin: formData.get("pin"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await createUserWithPinAndAccountCode(validated.data.pin);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "PIN no work.");
  }

  redirect("/join/account-code");
}

export async function submitBasics(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const validated = basicsSchema.safeParse({
    state: formData.get("state"),
    ageRange: formData.get("ageRange"),
    gender: formData.get("gender"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    await completeOnboardingBasics(validated.data);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Basics no save.");
  }

  redirect("/join/rules");
}

export async function acceptJoinRules() {
  await finalizeFirstEntry();
  redirect("/mata");
}

export async function recoverAccount(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const validated = recoverySchema.safeParse({
    accountCode: formData.get("accountCode"),
    pin: formData.get("pin"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    const recovered = await recoverUserSession(validated.data.accountCode, validated.data.pin);
    redirect(recovered.user.isOga ? getOperatorDashboardDestination() : "/mata");
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Recovery no work.",
    );
  }
}

export async function loginAction(
  _state: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const validated = loginSchema.safeParse({
    username: formData.get("username"),
    pin: formData.get("pin"),
  });

  if (!validated.success) {
    return fromZodError(validated.error);
  }

  try {
    const result = await loginWithUsernamePin(validated.data.username, validated.data.pin);
    redirect(result.user.isOga ? getOperatorDashboardDestination() : "/mata");
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Login no work. Check your username and PIN.",
    );
  }
}

export async function logoutAction() {
  await logoutUser();
  redirect("/");
}
