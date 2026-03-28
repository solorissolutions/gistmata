import { loadEnvConfig } from "@next/env";

import type { AppStore } from "@/lib/domain/types";
import {
  OGA_ACCOUNT_CODE,
  OGA_DEFAULT_PIN,
  OGA_USERNAME_NORMALIZED,
} from "@/lib/server/auth/oga-credentials";
import {
  deleteSession,
  ensureOgaAccount,
  loginWithUsernameAndPin,
  readStore,
} from "@/lib/server/store";
import { isPostgresStoreConfigured } from "@/lib/server/store/postgres-store";
import { verifySecretValue } from "@/lib/server/store/helpers";

loadEnvConfig(process.cwd());

type OgaSnapshot = {
  count: number;
  users: Array<{
    id: string;
    username: string;
    isOga: boolean;
    pinMatches: boolean;
    accountCodeMatches: boolean;
    hasRecoveryCode: boolean;
    createdAt: string;
    lastActiveAt: string;
  }>;
};

function getOgaSnapshot(store: AppStore): OgaSnapshot {
  const users = store.users
    .filter((user) => user.isOga || user.usernameNormalized === OGA_USERNAME_NORMALIZED)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .map((user) => ({
      id: user.id,
      username: user.username,
      isOga: user.isOga,
      pinMatches: verifySecretValue(OGA_DEFAULT_PIN, user.pinHash),
      accountCodeMatches: verifySecretValue(OGA_ACCOUNT_CODE, user.accountCodeHash),
      hasRecoveryCode: user.devRecoveryCode === OGA_ACCOUNT_CODE,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    }));

  return {
    count: users.length,
    users,
  };
}

function hasValidCanonicalOga(snapshot: OgaSnapshot) {
  return (
    snapshot.count === 1 &&
    snapshot.users[0]?.username.toLowerCase() === OGA_USERNAME_NORMALIZED &&
    snapshot.users[0].isOga &&
    snapshot.users[0].pinMatches &&
    snapshot.users[0].accountCodeMatches
  );
}

async function main() {
  if (!isPostgresStoreConfigured()) {
    throw new Error(
      "DIRECT_URL or DATABASE_URL must be set before ensuring remote oga auth.",
    );
  }

  const checkOnly = process.argv.includes("--check");
  const before = getOgaSnapshot(await readStore());

  if (!checkOnly && !hasValidCanonicalOga(before)) {
    await ensureOgaAccount();
  }

  const after = getOgaSnapshot(await readStore());

  if (!hasValidCanonicalOga(after)) {
    throw new Error("Remote oga account is still invalid after ensure step.");
  }

  const smoke = await loginWithUsernameAndPin("oga", OGA_DEFAULT_PIN);
  await deleteSession(smoke.token);

  console.log(
    JSON.stringify(
      {
        mode: checkOnly ? "check" : "ensure",
        changed: !hasValidCanonicalOga(before),
        before,
        after,
        smokeLogin: {
          userId: smoke.user.id,
          username: smoke.user.username,
          isOga: smoke.user.isOga,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
