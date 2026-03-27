import "server-only";

import { type AgeRangeValue, type GenderValue } from "@/lib/domain/types";
import {
  beginJoinDraft,
  completeJoinDraft,
  getJoinDraft,
  setJoinDraftBasics,
  setJoinDraftPin,
  setJoinDraftUsername,
} from "@/lib/server/store";

export async function createJoinDraft(referralCode: string) {
  return beginJoinDraft(referralCode);
}

export async function findJoinDraft(joinDraftId: string | null) {
  return getJoinDraft(joinDraftId);
}

export async function updateJoinDraftUsername(joinDraftId: string, username: string) {
  return setJoinDraftUsername(joinDraftId, username);
}

export async function updateJoinDraftPin(joinDraftId: string, pin: string) {
  return setJoinDraftPin(joinDraftId, pin);
}

export async function updateJoinDraftBasics(
  joinDraftId: string,
  basics: {
    state: string;
    ageRange: AgeRangeValue;
    gender: GenderValue;
  },
) {
  return setJoinDraftBasics(joinDraftId, basics);
}

export async function finalizeJoinDraft(joinDraftId: string) {
  return completeJoinDraft(joinDraftId);
}
