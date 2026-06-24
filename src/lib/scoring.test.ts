import { describe, expect, it } from "vitest";
import {
  type Answer,
  calculateScores,
  getResultTypeCodeFromCode,
  getTypeCode,
  getTypeSymbols,
  getTypeSymbolsFromCode,
} from "./scoring";

function makeAnswer(
  overrides: Partial<Answer> & {
    questionId: number;
    dimension: Answer["dimension"];
    value: number;
  },
): Answer {
  return {
    reverse: false,
    primaryWeight: 1,
    tier: "X",
    ...overrides,
  };
}

describe("calculateScores", () => {
  it("normalizes weighted answers to 0-100 scores", () => {
    const scores = calculateScores([
      makeAnswer({ questionId: 1, dimension: "S", value: 1 }),
      makeAnswer({ questionId: 2, dimension: "S", value: 5 }),
      makeAnswer({ questionId: 3, dimension: "R", value: 3 }),
      makeAnswer({ questionId: 4, dimension: "D", value: 5 }),
      makeAnswer({ questionId: 5, dimension: "C", value: 1 }),
    ]);

    expect(scores).toEqual({
      s: 50,
      r: 50,
      d: 100,
      c: 0,
    });
  });

  it("applies reverse scoring before accumulating contributions", () => {
    const scores = calculateScores([
      makeAnswer({ questionId: 1, dimension: "S", value: 5, reverse: true }),
    ]);

    expect(scores.s).toBe(0);
  });

  it("applies secondary-dimension contributions", () => {
    const scores = calculateScores([
      makeAnswer({
        questionId: 1,
        dimension: "S",
        value: 5,
        primaryWeight: 1,
        secondaryDimension: "R",
        secondaryWeight: 0.5,
      }),
    ]);

    expect(scores.s).toBe(100);
    expect(scores.r).toBe(100);
  });

  it("keeps tier discounts in both actual and theoretical ranges", () => {
    const scores = calculateScores([
      makeAnswer({
        questionId: 1,
        dimension: "S",
        value: 5,
        primaryWeight: 1,
        tier: "U",
      }),
    ]);

    expect(scores.s).toBe(100);
  });

  it("returns 0 for dimensions without answered items", () => {
    const scores = calculateScores([
      makeAnswer({ questionId: 1, dimension: "S", value: 5 }),
    ]);

    expect(scores).toEqual({
      s: 100,
      r: 0,
      d: 0,
      c: 0,
    });
  });
});

describe("getTypeCode", () => {
  it("uses low and high boundary letters at 35 and 65", () => {
    expect(getTypeCode({ s: 35, r: 0, d: 35, c: 0 })).toBe("srdc");
    expect(getTypeCode({ s: 65, r: 100, d: 65, c: 100 })).toBe("SRDC");
  });

  it("rounds a single middle dimension to the nearest extreme", () => {
    expect(getTypeCode({ s: 45, r: 20, d: 20, c: 80 })).toBe("srdC");
    expect(getTypeCode({ s: 55, r: 20, d: 20, c: 80 })).toBe("SrdC");
  });

  it("maps two or more middle dimensions to hidden result types", () => {
    expect(getTypeCode({ s: 50, r: 50, d: 50, c: 50 })).toBe("HIDDEN_DRIFT");
    expect(getTypeCode({ s: 50, r: 50, d: 50, c: 80 })).toBe(
      "HIDDEN_TWILIGHT",
    );
    expect(getTypeCode({ s: 50, r: 50, d: 20, c: 20 })).toBe("HIDDEN_SMOKE");
    expect(getTypeCode({ s: 20, r: 20, d: 50, c: 50 })).toBe("HIDDEN_DEW");
    expect(getTypeCode({ s: 50, r: 20, d: 50, c: 80 })).toBe("HIDDEN_RIDGE");
  });
});

describe("type symbols", () => {
  it("maps score bands to filled, half, and empty circles", () => {
    expect(getTypeSymbols({ s: 35, r: 36, d: 64, c: 65 })).toBe("● ◐ ◐ ◯");
  });

  it("infers symbols from type code letters", () => {
    expect(getTypeSymbolsFromCode("sRdc")).toBe("● ◯ ● ●");
    expect(getTypeSymbolsFromCode("mmmm")).toBe("◐ ◐ ◐ ◐");
    expect(getTypeSymbolsFromCode("smoke")).toBe("◐ ◐ ● ●");
  });
});

describe("getResultTypeCodeFromCode", () => {
  it("preserves core type code case while normalizing hidden aliases", () => {
    expect(getResultTypeCodeFromCode("srdc")).toBe("srdc");
    expect(getResultTypeCodeFromCode("SRDC")).toBe("SRDC");
    expect(getResultTypeCodeFromCode("smoke")).toBe("HIDDEN_SMOKE");
  });
});
