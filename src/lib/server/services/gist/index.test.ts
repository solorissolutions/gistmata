import type { Viewer } from "@/lib/domain/types";
import { createGist } from "@/lib/server/services/gist";
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

describe("gist service first pass", () => {
  beforeEach(async () => {
    await resetDemoStore();
    delete process.env.GEMINI_API_KEY;
  });

  it("persists the selected tag when the draft passes safety checks", async () => {
    const before = await readStore();
    const viewerRecord = before.users.find((user) => !user.isOga);

    expect(viewerRecord).toBeTruthy();
    if (!viewerRecord) {
      return;
    }

    const gistId = await createGist(
      {
        body: "That junction pothole don open again after small rain.",
        tag: "General",
        location: {
          displayLocality: "Bodija",
          areaBucket: "bodija",
          admin2Name: "Ibadan North",
          admin2Type: "LGA",
          stateName: "Oyo",
          confidenceScore: 0.9,
        },
      },
      toViewer(viewerRecord),
    );

    const after = await readStore();
    const saved = after.gists.find((gist) => gist.id === gistId);

    expect(saved).toBeTruthy();
    expect(saved?.tag).toBe("General");
  });

  it("blocks publish when the local safety pass detects personal data", async () => {
    const before = await readStore();
    const viewerRecord = before.users.find((user) => !user.isOga);

    expect(viewerRecord).toBeTruthy();
    if (!viewerRecord) {
      return;
    }

    await expect(
      createGist(
        {
          body: "Call me on 08031234567 make I explain the full gist.",
          tag: "General",
          location: {
            displayLocality: "Bodija",
            areaBucket: "bodija",
            admin2Name: "Ibadan North",
            admin2Type: "LGA",
            stateName: "Oyo",
            confidenceScore: 0.9,
          },
        },
        toViewer(viewerRecord),
      ),
    ).rejects.toThrow();

    const after = await readStore();
    expect(after.gists).toHaveLength(before.gists.length);
  });
});
