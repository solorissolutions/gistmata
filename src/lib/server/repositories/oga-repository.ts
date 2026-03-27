import "server-only";

import { setPinnedGistPriority, unpinGist } from "@/lib/server/store";
import { getOgaV2DashboardSnapshot } from "@/lib/server/oga-v2";

export async function fetchOgaDashboardSnapshot() {
  return getOgaV2DashboardSnapshot();
}

export async function pinGistRecord(input: {
  ogaId: string;
  gistId: string;
  priority: 1 | 2 | 3;
}) {
  return setPinnedGistPriority(input);
}

export async function unpinGistRecord(input: { ogaId: string; gistId: string }) {
  return unpinGist(input);
}
