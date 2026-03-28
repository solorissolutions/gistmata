"use server";

import { redirect } from "next/navigation";

import {
  INITIAL_ACTION_STATE,
  type ActionState,
  loginSchema,
  recoverySchema,
} from "@/lib/domain/validation";
import { actionError, fromZodError } from "@/lib/server/action-state";
import {
  loginWithUsernamePin,
  logoutUser,
  recoverUserSession,
} from "@/lib/server/services/auth";

export async function operatorLoginAction(
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
    redirect(result.user.isOga ? "/oga-v2" : "/403?reason=oga-only");
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Login no work. Check your username and PIN.",
    );
  }
}

export async function operatorRecoveryAction(
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
    redirect(recovered.user.isOga ? "/oga-v2" : "/403?reason=oga-only");
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Recovery no work.",
    );
  }
}

export async function operatorLogoutAction() {
  await logoutUser();
  redirect("/login");
}
