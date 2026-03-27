import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase URL and server key are required.");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const table of ["users", "join_drafts", "contact_messages", "gists", "surveys"]) {
    const { error, count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`${table}: ERROR ${error.message}`);
    } else {
      console.log(`${table}: OK count=${count ?? 0}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
