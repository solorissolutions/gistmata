import type { Viewer } from "@/lib/domain/types";
import { createFollowUpGist } from "@/lib/server/services/matter";
import { readStore, resetDemoStore } from "@/lib/server/store";

function toViewer(user: Awaited<ReturnType<typeof readStore>>["users"][number]): Viewer {
  return {
    id: user.id,
    username: user.username,
    tier: user.tier,
    pointsBalance: user.pointsBalance,
    homeState: user.homeState,
    isOga: user.isOga,
    comotTagged: user.comotTagged,
    location: null,
  };
}

describe("matter service first pass", () => {
  beforeEach(async () => {
    await resetDemoStore();
    delete process.env.GEMINI_API_KEY;
  });

  it("persists the submitted follow-up relation when the draft passes safety checks", async () => {
    const before = await readStore();
    const viewerRecord = before.users.find((user) => !user.isOga);
    const parentGist = before.gists.find((gist) => gist.status === "active");

    expect(viewerRecord).toBeTruthy();
    expect(parentGist).toBeTruthy();
    if (!viewerRecord || !parentGist) {
      return;
    }

    const childGistId = await createFollowUpGist(
      {
        parentGistId: parentGist.id,
        relationType: "follow-up",
        body: "Same thing happen for my side too. Light no hold at all.",
        tag: parentGist.tag,
        location: {
          displayLocality: "Yaba",
          areaBucket: "yaba",
          admin2Name: "Lagos Mainland",
          admin2Type: "LGA",
          stateName: "Lagos",
          confidenceScore: 0.84,
        },
      },
      toViewer(viewerRecord),
    );

    const after = await readStore();
    const savedChild = after.gists.find((gist) => gist.id === childGistId);
    const relation = after.gistRelations.find((entry) => entry.childGistId === childGistId);

    expect(savedChild).toBeTruthy();
    expect(relation?.relationType).toBe("follow-up");
  });
});
