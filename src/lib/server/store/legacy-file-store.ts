import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import type { AppStore } from "@/lib/domain/types";
import { buildSeedStore } from "@/lib/server/store/seed-data";

const LEGACY_STORE_PATH = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  ".data",
  "gistmata-demo-store.json",
);
const SAFE_FALLBACK_STORE_DIR = path.join(os.homedir(), "AppData", "Local", "GistMata");
const STORE_PATH =
  process.env.GISTMATA_STORE_PATH?.trim() ||
  path.join(
    process.env.LOCALAPPDATA?.trim() || SAFE_FALLBACK_STORE_DIR,
    "gistmata-demo-store.json",
  );

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    await fs.access(STORE_PATH);
  } catch {
    if (STORE_PATH !== LEGACY_STORE_PATH) {
      try {
        await fs.access(LEGACY_STORE_PATH);
        await fs.copyFile(LEGACY_STORE_PATH, STORE_PATH);
        return;
      } catch {
        // Fall through to fresh seed creation.
      }
    }

    await fs.writeFile(STORE_PATH, JSON.stringify(buildSeedStore(), null, 2), "utf8");
  }
}

export async function loadLegacyFileStore(): Promise<Partial<AppStore>> {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_PATH, "utf8");

  try {
    return JSON.parse(raw) as Partial<AppStore>;
  } catch {
    const seeded = buildSeedStore();
    await fs.writeFile(STORE_PATH, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  }
}

export async function saveLegacyFileStore(store: AppStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function resetLegacyFileStore(store: AppStore = buildSeedStore()) {
  await saveLegacyFileStore(store);
}

export function getLegacyStorePath() {
  return STORE_PATH;
}
