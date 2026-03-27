import { ensureOgaAccount, readStore } from "@/lib/server/store";
import { loginWithUsernameAndPin } from "@/lib/server/store";

async function main() {
  const user = await ensureOgaAccount();

  const login = await loginWithUsernameAndPin("oga", "091332");
  const store = await readStore();
  const persisted = store.users.find(
    (entry) => entry.usernameNormalized === "oga" && entry.isOga,
  );

  if (!persisted) {
    throw new Error("Oga account no persist to the primary store.");
  }

  console.log("Oga auth synced:");
  console.log(`- userId: ${user.id}`);
  console.log(`- username: ${persisted.username}`);
  console.log(`- isOga: ${persisted.isOga}`);
  console.log(`- loginVerified: ${login.user.username}`);
  console.log(`- accountCodeHint: ${persisted.devRecoveryCode ?? "GM-0001-OG"}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Oga auth sync failed.");
  process.exit(1);
});
