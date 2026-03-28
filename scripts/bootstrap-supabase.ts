import { loadEnvConfig } from "@next/env";

import { buildSeedStore } from "@/lib/server/store/seed-data";
import {
  isPostgresStoreConfigured,
  replacePostgresStore,
} from "@/lib/server/store/postgres-store";

loadEnvConfig(process.cwd());

async function main() {
  if (!isPostgresStoreConfigured()) {
    throw new Error("DIRECT_URL or DATABASE_URL must be set before bootstrapping Supabase.");
  }

  const store = buildSeedStore();

  await replacePostgresStore(store);

  console.log("Supabase/Postgres runtime store refreshed.");
  console.log(`Users: ${store.users.length}`);
  console.log(`Gists: ${store.gists.length}`);
  console.log(`Referral activations: ${store.referralActivations.length}`);
  console.log(`Contact messages: ${store.contactOgaMessages.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
