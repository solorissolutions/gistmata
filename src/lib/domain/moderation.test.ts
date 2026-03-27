import { describe, it, expect } from "vitest";

import { detectPersonalData } from "@/lib/domain/moderation";

describe("detectPersonalData", () => {
  it("blocks phone numbers", () => {
    const result = detectPersonalData("Call me on 08031234567 make I explain.");
    expect(result.blocked).toBe(true);
    expect(result.hits.includes("phone")).toBe(true);
  });

  it("blocks obvious addresses", () => {
    const result = detectPersonalData("House 14 for Palm avenue no sleep since last night.");
    expect(result.blocked).toBe(true);
    expect(result.hits.includes("address")).toBe(true);
  });

  it("allows ordinary gist", () => {
    const result = detectPersonalData("The transformer for this street don hum since dawn.");
    expect(result.blocked).toBe(false);
  });
});
