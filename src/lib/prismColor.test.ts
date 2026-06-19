import { describe, expect, it } from "vitest";
import { getDimensionColor, getPersonalPrismColor } from "./prismColor";

describe("getDimensionColor", () => {
  it("returns the gradient endpoints at 0 and 100", () => {
    expect(getDimensionColor("tw", 0)).toBe("#1e3a5f");
    expect(getDimensionColor("tw", 100)).toBe("#c4a060");
  });

  it("clamps scores outside the 0-100 range", () => {
    expect(getDimensionColor("gf", -10)).toBe("#c8c4bc");
    expect(getDimensionColor("gf", 120)).toBe("#2a4a3a");
  });
});

describe("getPersonalPrismColor", () => {
  it("mixes four dimension colors into a hex color", () => {
    expect(
      getPersonalPrismColor({
        tw: 25,
        rd: 50,
        gf: 75,
        ml: 100,
      }),
    ).toMatch(/^#[0-9a-f]{6}$/);
  });
});
