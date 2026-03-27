import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { loadEnvConfig } from "@next/env";
import { Client } from "pg";

loadEnvConfig(process.cwd());

async function main() {
  const connectionString =
    process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error("DIRECT_URL or DATABASE_URL must be set before running migrations.");
  }

  const client = new Client({
    connectionString,
    ssl:
      /supabase\.co/i.test(connectionString) || /sslmode=require/i.test(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
  });

  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  await client.connect();

  try {
    for (const file of migrationFiles) {
      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      await client.query(sql);
      console.log(`Applied ${file}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
