import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createFollowUpRecord, fetchMatterBundle } = vi.hoisted(() => ({
  createFollowUpRecord: vi.fn(),
  fetchMatterBundle: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/server/repositories/matter-repository", () => ({
  createFollowUpRecord,
  fetchMatterBundle,
}));

import { createFollowUpGist } from "@/lib/server/services/matter";

describe("matter service Gemini first pass", () => {
  beforeEach(() => {
    createFollowUpRecord.mockReset();
    createFollowUpRecord.mockResolvedValue("gst_followup");
    fetchMatterBundle.mockReset();
    fetchMatterBundle.mockResolvedValue({
      gist: {
        id: "parent_1",
        body: "Light blink four times for this side this morning.",
        tag: "NEPA",
      },
      followUps: [],
      comments: [],
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
  });

  it("quietly upgrades a generic follow-up relation when Gemini is confident", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    block: false,
                    blockConfidence: 0.03,
                    blockReason: null,
                    suggestedTag: "NEPA",
                    tagConfidence: 0.88,
                    suggestedRelationType: "confirm",
                    relationConfidence: 0.84,
                  }),
                },
              ],
            },
          },
        ],
      }),
    } as Response);

    await createFollowUpGist(
      {
        parentGistId: "parent_1",
        relationType: "follow-up",
        body: "Same thing happen for my side too. Light no hold at all.",
        tag: "NEPA",
        location: {
          displayLocality: "Yaba",
          areaBucket: "yaba",
          admin2Name: "Lagos Mainland",
          admin2Type: "LGA",
          stateName: "Lagos",
          confidenceScore: 0.84,
        },
      },
      {
        id: "usr_2",
        username: "replyer",
        tier: "New Member",
        pointsBalance: 20,
        homeState: "Lagos",
        isOga: false,
        comotTagged: false,
        location: null,
      },
    );

    expect(createFollowUpRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        relationType: "confirm",
      }),
    );
  });
});
