import { describe, it, expect } from "vitest";

import { getLocationProviderInfo, resolveLocation } from "@/lib/server/location";

describe("resolveLocation", () => {
  it("falls back to viewer state when coords are missing", async () => {
    const location = await resolveLocation({ homeState: "Kano" });
    expect(location.stateName).toBe("Kano");
    expect(location.provider).toBe("mock");
  });

  it("returns a known location for coordinates", async () => {
    const location = await resolveLocation({
      latitude: 6.5152,
      longitude: 3.3768,
    });
    expect(location.displayLocality).toBe("Yaba");
  });

  it("switches provider info when google placeholder is configured", async () => {
    const previous = process.env.LOCATION_PROVIDER;
    process.env.LOCATION_PROVIDER = "google";

    const info = getLocationProviderInfo();
    const location = await resolveLocation({ homeState: "FCT" });

    expect(info.key).toBe("google");
    expect(location.provider).toBe("google-placeholder");

    process.env.LOCATION_PROVIDER = previous;
  });
});
