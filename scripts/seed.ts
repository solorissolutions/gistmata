import { loadEnvConfig } from "@next/env";

import { resetDemoStore, readStore } from "@/lib/server/store";

loadEnvConfig(process.cwd());

async function main() {
  await resetDemoStore();
  const store = await readStore();

  console.log("GistMata demo store reset.");
  console.log("");
  console.log("Active referral codes:");
  for (const code of store.referralCodes.filter((entry) => entry.isActive)) {
    console.log(`- ${code.code}`);
  }

  console.log("");
  console.log("Seeded recovery codes:");
  for (const user of store.users.filter((entry) => entry.devRecoveryCode)) {
    console.log(`- @${user.username}: ${user.devRecoveryCode}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
