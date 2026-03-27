"use server";

import { revalidatePath } from "next/cache";

import { INITIAL_ACTION_STATE, type ActionState } from "@/lib/domain/validation";
import { actionError, actionSuccess } from "@/lib/server/action-state";
import { requireUser } from "@/lib/server/services/auth";
import { generateReferralCode } from "@/lib/server/services/referral";

export async function generateUserReferralAction(
  _state: ActionState = INITIAL_ACTION_STATE,
  _formData: FormData,
): Promise<ActionState> {
  void _state;
  void _formData;

  const viewer = await requireUser();

  try {
    await generateReferralCode(viewer);
    revalidatePath("/locker/referrals");
    return actionSuccess("New referral code don land.");
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Referral code no generate.",
    );
  }
}
