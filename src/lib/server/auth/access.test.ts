import { describe, it, expect } from "vitest";

import { evaluateOgaAccess } from "@/lib/server/auth/access";

describe("evaluateOgaAccess", () => {
  it("blocks anonymous viewers", () => {
    const result = evaluateOgaAccess(null);

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("anonymous");
      expect(result.redirectTo).toBe("/locker/recovery");
    }
  });

  it("blocks regular members from oga routes", () => {
    const result = evaluateOgaAccess({
      id: "usr_regular",
      username: "StreetVoice",
      tier: "Area Voice",
      pointsBalance: 140,
      homeState: "Oyo",
      isOga: false,
      comotTagged: false,
      location: null,
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("not-oga");
      expect(result.redirectTo).toBe("/403?reason=oga-only");
    }
  });

  it("allows the oga viewer", () => {
    const result = evaluateOgaAccess({
      id: "usr_oga",
      username: "oga",
      tier: "Area Legend",
      pointsBalance: 999,
      homeState: "FCT",
      isOga: true,
      comotTagged: false,
      location: null,
    });

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.viewer.username).toBe("oga");
      expect(result.viewer.isOga).toBe(true);
    }
  });
});
