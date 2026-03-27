import "server-only";

import type { UserRecord } from "@/lib/domain/types";
import {
  createSession,
  deleteSession,
  ensureOgaAccount,
  getUserBySessionToken,
  loginWithUsernameAndPin,
  readStore,
  recoverSession,
} from "@/lib/server/store";

export async function getViewerBySessionToken(token: string | null) {
  return getUserBySessionToken(token);
}

export async function createUserSession(userId: string) {
  return createSession(userId);
}

export async function deleteUserSession(token: string | null) {
  return deleteSession(token);
}

export async function loginByUsernameAndPin(username: string, pin: string) {
  return loginWithUsernameAndPin(username, pin);
}

export async function recoverByAccountCode(accountCode: string, pin: string) {
  return recoverSession(accountCode, pin);
}

export async function getEnsuredOgaUserRecord(): Promise<UserRecord | null> {
  await ensureOgaAccount();
  const store = await readStore();

  return (
    store.users.find((user) => user.isOga && user.usernameNormalized === "oga") ??
    store.users.find((user) => user.isOga) ??
    null
  );
}
