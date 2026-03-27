import { describe, it, expect } from "vitest";

import { getFeedBundle, mutateStore, readStore, resetDemoStore } from "@/lib/server/store";

describe("getFeedBundle", () => {
  it("does not crash when pinnedGists is missing from stored JSON", async () => {
    await resetDemoStore();

    // Simulate an older/malformed store file that doesn't have pinnedGists.
    await mutateStore((store) => {
      // @ts-expect-error intentional corruption
      delete store.pinnedGists;
    });

    const storeAfter = await readStore();
    const viewer = storeAfter.users.find((user) => !user.isOga);
    expect(viewer).toBeTruthy();
    if (!viewer) return;

    const bundle = await getFeedBundle({
      viewerId: viewer.id,
      level: "state",
      tag: "All",
      sort: "smart",
    });

    expect(Array.isArray(bundle.gists)).toBe(true);
    expect(Array.isArray(bundle.pinnedGists)).toBe(true);
  });
});
