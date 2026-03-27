import "server-only";

import { getAlertsBundle, sendBroadcast } from "@/lib/server/store";

export async function fetchAlertsBundle(viewerId: string) {
  return getAlertsBundle(viewerId);
}

export async function createBroadcastRecord(input: {
  ogaId: string;
  audience: "all" | "inactive" | "state";
  stateName?: string;
  title: string;
  body: string;
  link?: string;
}) {
  return sendBroadcast(input);
}
