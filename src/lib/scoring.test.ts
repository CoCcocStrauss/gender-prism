import { describe, expect, it } from "vitest";
import {
  type Answer,
  calculateScores,
  getResultTypeCode,
  getResultTypeCodeFromCode,
  getTypeCode,
  getTypeSymbols,
  getTypeSymbolsFromCode,
  validateAnswers,
} from "./scoring";

type TimedAnswers = Answer[] & {
  totalTimeSeconds?: number;
  elapsedSeconds?: number;
  startedAt?: number;
  completedAt?: number;
};

function makeAnswer(
  questionId: number,
  dimension: Answer["dimension"],
  value: number,
  reverse = false,
): Answer {
  return {
    questionId,
    dimension,
    value,
    reverse,
  };
}

function validAttentionAnswers(): Answer[] {
  return [
    makeAnswer(20, "RD", 4),
    makeAnswer(45, "ML", 3),
  ];
}

describe("calculateScores", () => {
  it("calculates 0-100 dimension scores from valid answers", () => {
    const scores = calculateScores([
      makeAnswer(1, "TW", 1),
      makeAnswer(2, "TW", 5),
      makeAnswer(13, "RD", 3),
      makeAnswer(14, "RD", 3),
      makeAnswer(25, "GF", 5),
      makeAnswer(26, "GF", 5),
      makeAnswer(37, "ML", 1),
      makeAnswer(38, "ML", 1),
    ]);

    expect(scores).toEqual({
      tw: 50,
      rd: 50,
      gf: 100,
      ml: 0,
    });
  });

  it("applies reverse scoring before calculating the average", () => {
    const scores = calculateScores([
      makeAnswer(3, "TW", 5, true),
      makeAnswer(7, "TW", 1, true),
    ]);

    expect(scores.tw).toBe(50);
  });

  it("excludes attention check questions from scores", () => {
    const scores = calculateScores([
      makeAnswer(20, "RD", 5),
      makeAnswer(45, "ML", 5),
    ]);

    expect(scores).toEqual({
      tw: 0,
      rd: 0,
      gf: 0,
      ml: 0,
    });
  });

  it("returns 0 for dimensions without valid answers", () => {
    const scores = calculateScores([makeAnswer(1, "TW", 5)]);

    expect(scores).toEqual({
      tw: 100,
      rd: 0,
      gf: 0,
      ml: 0,
    });
  });
});

describe("getTypeCode", () => {
  it("uses low boundary letters at 38 and below", () => {
    expect(getTypeCode({ tw: 38, rd: 0, gf: 38, ml: 1 })).toBe("TRGM");
  });

  it("uses middle boundary letters from 39 through 61", () => {
    expect(getTypeCode({ tw: 39, rd: 50, gf: 61, ml: 40 })).toBe("BHPV");
  });

  it("uses high boundary letters at 62 and above", () => {
    expect(getTypeCode({ tw: 62, rd: 100, gf: 62, ml: 99 })).toBe("WDFL");
  });
});

describe("result type routing code", () => {
  it("maps scores with no middle dimensions to one of the 16 core result pages", () => {
    expect(getResultTypeCode({ tw: 62, rd: 100, gf: 62, ml: 99 })).toBe("WDFL");
  });

  it("rounds a single middle dimension to the nearest core letter", () => {
    expect(getResultTypeCode({ tw: 45, rd: 25, gf: 25, ml: 75 })).toBe("TRGL");
    expect(getResultTypeCode({ tw: 55, rd: 25, gf: 25, ml: 75 })).toBe("WRGL");
  });

  it("maps two or more middle dimensions to hidden result types", () => {
    expect(getResultTypeCode({ tw: 50, rd: 50, gf: 50, ml: 50 })).toBe(
      "HIDDEN_DRIFT",
    );
    expect(getResultTypeCode({ tw: 50, rd: 50, gf: 50, ml: 75 })).toBe(
      "HIDDEN_TWILIGHT",
    );
    expect(getResultTypeCode({ tw: 50, rd: 50, gf: 25, ml: 25 })).toBe(
      "HIDDEN_SMOKE",
    );
    expect(getResultTypeCode({ tw: 25, rd: 25, gf: 50, ml: 50 })).toBe(
      "HIDDEN_DEW",
    );
    expect(getResultTypeCode({ tw: 50, rd: 25, gf: 50, ml: 75 })).toBe(
      "HIDDEN_RIDGE",
    );
  });

  it("maps middle-band code letters and hidden aliases to hidden result pages", () => {
    expect(getResultTypeCodeFromCode("BHPV")).toBe("HIDDEN_DRIFT");
    expect(getResultTypeCodeFromCode("BHGL")).toBe("HIDDEN_SMOKE");
    expect(getResultTypeCodeFromCode("TRPV")).toBe("HIDDEN_DEW");
    expect(getResultTypeCodeFromCode("BRPL")).toBe("HIDDEN_RIDGE");
    expect(getResultTypeCodeFromCode("drift")).toBe("HIDDEN_DRIFT");
    expect(getResultTypeCodeFromCode("WDHL")).toBe("WDGL");
  });
});

describe("type symbols", () => {
  it("maps score bands to filled, half, and empty circles", () => {
    expect(getTypeSymbols({ tw: 38, rd: 39, gf: 61, ml: 62 })).toBe(
      "● ◐ ◐ ◯",
    );
  });

  it("infers symbols from type code letters", () => {
    expect(getTypeSymbolsFromCode("TDGL")).toBe("● ◯ ● ◯");
    expect(getTypeSymbolsFromCode("BHPV")).toBe("◐ ◐ ◐ ◐");
    expect(getTypeSymbolsFromCode("smoke")).toBe("◐ ◐ ● ●");
  });
});

describe("validateAnswers", () => {
  it("passes when attention checks are correct and no risk signal is present", () => {
    const answers = [
      makeAnswer(1, "TW", 1),
      makeAnswer(2, "TW", 2),
      makeAnswer(13, "RD", 3),
      makeAnswer(25, "GF", 4),
      ...validAttentionAnswers(),
    ];

    expect(validateAnswers(answers)).toEqual({
      valid: true,
      issues: [],
    });
  });

  it("flags attention_failed when either attention answer is missing or wrong", () => {
    const answers = [
      makeAnswer(20, "RD", 5),
      makeAnswer(45, "ML", 3),
    ];

    expect(validateAnswers(answers)).toEqual({
      valid: false,
      issues: ["attention_failed"],
    });
  });

  it("flags too_fast from totalTimeSeconds metadata", () => {
    const answers: TimedAnswers = [...validAttentionAnswers()];
    answers.totalTimeSeconds = 89;

    expect(validateAnswers(answers)).toEqual({
      valid: false,
      issues: ["too_fast"],
    });
  });

  it("flags too_fast from startedAt and completedAt metadata", () => {
    const answers: TimedAnswers = [...validAttentionAnswers()];
    answers.startedAt = 1_000;
    answers.completedAt = 90_999;

    expect(validateAnswers(answers).issues).toContain("too_fast");
  });

  it("does not flag too_fast at exactly 90 seconds", () => {
    const answers: TimedAnswers = [...validAttentionAnswers()];
    answers.totalTimeSeconds = 90;

    expect(validateAnswers(answers)).toEqual({
      valid: true,
      issues: [],
    });
  });

  it("flags all_same when every answer uses the same value", () => {
    const answers = [
      makeAnswer(1, "TW", 3),
      makeAnswer(13, "RD", 3),
      makeAnswer(25, "GF", 3),
      makeAnswer(45, "ML", 3),
    ];

    expect(validateAnswers(answers).issues).toContain("all_same");
  });

  it("can report multiple validation issues together", () => {
    const answers: TimedAnswers = [
      makeAnswer(1, "TW", 5),
      makeAnswer(20, "RD", 5),
      makeAnswer(45, "ML", 5),
    ];
    answers.elapsedSeconds = 30;

    expect(validateAnswers(answers)).toEqual({
      valid: false,
      issues: ["attention_failed", "too_fast", "all_same"],
    });
  });
});
