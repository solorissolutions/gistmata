import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import type { UserRecord, Viewer } from "@/lib/domain/types";
import { clearSessionCookie, getSessionToken, setSessionCookie } from "@/lib/server/auth/session";
import {
  createUserSession,
  deleteUserSession,
  getViewerBySessionToken,
  loginByUsernameAndPin,
  recoverByAccountCode,
} from "@/lib/server/repositories/auth-repository";

function mapUserRecordToViewer(user: UserRecord): Viewer {
  return {
    id: user.id,
    username: user.username,
    tier: user.tier,
    pointsBalance: user.pointsBalance,
    homeState: user.homeState,
    isOga: user.isOga,
    comotTagged: user.comotTagged,
    location:
      user.homeAreaDisplay &&
      user.homeAreaBucket &&
      user.homeAdmin2Name &&
      user.homeAdmin2Type &&
      user.locationConfidence !== null
        ? {
            displayLocality: user.homeAreaDisplay,
            areaBucket: user.homeAreaBucket,
            admin2Name: user.homeAdmin2Name,
            admin2Type: user.homeAdmin2Type,
            stateName: user.homeState,
            confidenceScore: user.locationConfidence,
          }
        : null,
  };
}

export async function getCurrentSession() {
  return getSessionToken();
}

export const getCurrentUser = cache(async () => {
  const token = await getCurrentSession();
  return getViewerBySessionToken(token);
});

export const getCurrentViewer = getCurrentUser;

export async function requireUser() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/");
  }

  return viewer;
}

export async function loginWithUsernamePin(username: string, pin: string) {
  const result = await loginByUsernameAndPin(username, pin);
  await setSessionCookie(result.token);
  return result;
}

export async function recoverUserSession(accountCode: string, pin: string) {
  const result = await recoverByAccountCode(accountCode, pin);
  await setSessionCookie(result.token);
  return result;
}

export async function establishSessionForUser(userId: string) {
  const token = await createUserSession(userId);
  await setSessionCookie(token);
  return token;
}

export async function logoutUser() {
  const token = await getCurrentSession();
  await deleteUserSession(token);
  await clearSessionCookie();
}
