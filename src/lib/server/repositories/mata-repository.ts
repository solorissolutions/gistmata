import "server-only";

import { getFeedBundle } from "@/lib/server/store";

export async function fetchFeedBundle(input: {
  viewerId: string;
  level: "my-street" | "my-area" | "state" | "nigeria" | "hot";
  tag: string;
  sort?: "smart" | "recent";
}) {
  return getFeedBundle(input);
}
