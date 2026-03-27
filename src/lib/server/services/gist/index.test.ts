import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createGistRecord } = vi.hoisted(() => ({
  createGistRecord: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/server/repositories/gist-repository", () => ({
  createGistRecord,
  fetchGistBundle: vi.fn(),
  fetchLockerBundle: vi.fn(),
}));

import { createGist } from "@/lib/server/services/gist";

describe("gist service Gemini first pass", () => {
  beforeEach(() => {
    createGistRecord.mockReset();
    createGistRecord.mockResolvedValue("gst_new");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
  });

  it("quietly upgrades a General tag when Gemini strongly suggests a better one", async () => {
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
                    blockConfidence: 0.01,
                    blockReason: null,
                    suggestedTag: "Road",
                    tagConfidence: 0.89,
                  }),
                },
              ],
            },
          },
        ],
      }),
    } as Response);

    await createGist(
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
      {
        id: "usr_1",
        username: "writer",
        tier: "New Member",
        pointsBalance: 12,
        homeState: "Oyo",
        isOga: false,
        comotTagged: false,
        location: null,
      },
    );

    expect(createGistRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: "Road",
      }),
    );
  });

  it("blocks publish when Gemini returns a strong safety signal", async () => {
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
                    block: true,
                    blockConfidence: 0.92,
                    blockReason: "Remove the direct identifying detail and repost.",
                    suggestedTag: "General",
                    tagConfidence: 0.4,
                  }),
                },
              ],
            },
          },
        ],
      }),
    } as Response);

    await expect(
      createGist(
        {
          body: "That woman for the blue kiosk behind the junction is the one.",
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
        {
          id: "usr_1",
          username: "writer",
          tier: "New Member",
          pointsBalance: 12,
          homeState: "Oyo",
          isOga: false,
          comotTagged: false,
          location: null,
        },
      ),
    ).rejects.toThrow("Remove the direct identifying detail and repost.");

    expect(createGistRecord).not.toHaveBeenCalled();
  });
});
