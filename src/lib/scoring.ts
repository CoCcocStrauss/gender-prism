export type Dimension = "S" | "R" | "D" | "C";
export type ScoreDimension = "s" | "r" | "d" | "c";
export type Tier = "U" | "D" | "X";

export type Answer = {
  questionId: number;
  dimension: Dimension;
  value: number;
  reverse: boolean;
  primaryWeight: number;
  secondaryDimension?: Dimension;
  secondaryWeight?: number;
  tier: Tier;
};

export type Scores = {
  s: number;
  r: number;
  d: number;
  c: number;
};

type LegacyScores = {
  tw: number;
  rd: number;
  gf: number;
  ml: number;
};

type DimensionTotals = {
  actual: number;
  min: number;
  max: number;
};

const scoreDimensions = ["s", "r", "d", "c"] as const satisfies ScoreDimension[];

const scoreKeyByDimension: Record<Dimension, ScoreDimension> = {
  S: "s",
  R: "r",
  D: "d",
  C: "c",
};

const middleLetterByDimension: Record<ScoreDimension, string> = {
  s: "m",
  r: "m",
  d: "m",
  c: "m",
};

const lowLetterByDimension: Record<ScoreDimension, string> = {
  s: "s",
  r: "r",
  d: "d",
  c: "c",
};

const highLetterByDimension: Record<ScoreDimension, string> = {
  s: "S",
  r: "R",
  d: "D",
  c: "C",
};

export function calculateScores(answers: Answer[]): Scores {
  const totals: Record<ScoreDimension, DimensionTotals> = {
    s: { actual: 0, min: 0, max: 0 },
    r: { actual: 0, min: 0, max: 0 },
    d: { actual: 0, min: 0, max: 0 },
    c: { actual: 0, min: 0, max: 0 },
  };

  for (const answer of answers) {
    const value = normalizeAnswerValue(answer);
    const tierDiscount = answer.tier === "U" ? 0.85 : 1;

    addContribution(
      totals[scoreKeyByDimension[answer.dimension]],
      value,
      answer.primaryWeight * tierDiscount,
    );

    if (answer.secondaryDimension && answer.secondaryWeight !== undefined) {
      addContribution(
        totals[scoreKeyByDimension[answer.secondaryDimension]],
        value,
        answer.secondaryWeight * tierDiscount,
      );
    }
  }

  return {
    s: normalizeDimensionScore(totals.s),
    r: normalizeDimensionScore(totals.r),
    d: normalizeDimensionScore(totals.d),
    c: normalizeDimensionScore(totals.c),
  };
}

export function getTypeCode(scores: Scores): string {
  const rawLetters = scoreDimensions.map((dimension) =>
    getBandLetter(scores[dimension], dimension),
  );
  const middleDimensions = scoreDimensions.filter(
    (_dimension, index) => rawLetters[index] === "m",
  );

  if (middleDimensions.length === 0) {
    return rawLetters.join("");
  }

  if (middleDimensions.length === 1) {
    return scoreDimensions
      .map((dimension, index) =>
        rawLetters[index] === "m"
          ? getRoundedExtremeLetter(scores[dimension], dimension)
          : rawLetters[index],
      )
      .join("");
  }

  return getHiddenTypeCodeFromMiddleDimensions(middleDimensions);
}

export function getResultTypeCode(scores: Scores): string {
  return getTypeCode(scores);
}

export function getResultTypeCodeFromCode(typeCode: string): string {
  const hiddenAlias = getHiddenAliasCode(typeCode);

  if (hiddenAlias) {
    return hiddenAlias;
  }

  const middleDimensions = getMiddleDimensionsFromCode(typeCode);

  if (middleDimensions.length >= 2) {
    return getHiddenTypeCodeFromMiddleDimensions(middleDimensions);
  }

  if (middleDimensions.length === 1) {
    return scoreDimensions
      .map((dimension, index) => {
        const letter = typeCode[index];

        if (letter === "m") {
          return lowLetterByDimension[dimension];
        }

        return isHighLetter(letter, dimension)
          ? highLetterByDimension[dimension]
          : lowLetterByDimension[dimension];
      })
      .join("");
  }

  return scoreDimensions
    .map((dimension, index) =>
      isHighLetter(typeCode[index], dimension)
        ? highLetterByDimension[dimension]
        : lowLetterByDimension[dimension],
    )
    .join("");
}

export function getTypeSymbols(scores: Scores | LegacyScores): string {
  if (isLegacyScores(scores)) {
    return [scores.tw, scores.rd, scores.gf, scores.ml].map(getScoreSymbol).join(" ");
  }

  return scoreDimensions.map((dimension) => getScoreSymbol(scores[dimension])).join(" ");
}

export function getTypeSymbolsFromCode(typeCode: string): string {
  const hiddenCode = getHiddenAliasCode(typeCode);

  if (hiddenCode) {
    return getHiddenTypeSymbols(hiddenCode);
  }

  return typeCode
    .split("")
    .slice(0, 4)
    .map(getCodeSymbol)
    .join(" ");
}

export function isMiddleScore(score: number): boolean {
  return score > 35 && score < 65;
}

function addContribution(total: DimensionTotals, value: number, weight: number) {
  total.actual += value * weight;
  total.min += 1 * weight;
  total.max += 5 * weight;
}

function normalizeAnswerValue(answer: Answer): number {
  return answer.reverse ? 6 - answer.value : answer.value;
}

function normalizeDimensionScore(total: DimensionTotals): number {
  if (total.max === total.min) {
    return 0;
  }

  return ((total.actual - total.min) / (total.max - total.min)) * 100;
}

function getBandLetter(score: number, dimension: ScoreDimension): string {
  if (score <= 35) {
    return lowLetterByDimension[dimension];
  }

  if (score >= 65) {
    return highLetterByDimension[dimension];
  }

  return middleLetterByDimension[dimension];
}

function getRoundedExtremeLetter(score: number, dimension: ScoreDimension): string {
  return score < 50
    ? lowLetterByDimension[dimension]
    : highLetterByDimension[dimension];
}

function getMiddleDimensionsFromCode(typeCode: string): ScoreDimension[] {
  return scoreDimensions.filter((dimension, index) => {
    const letter = typeCode[index];

    return letter === middleLetterByDimension[dimension];
  });
}

function getHiddenTypeCodeFromMiddleDimensions(
  middleDimensions: ScoreDimension[],
): string {
  if (middleDimensions.length === 4) {
    return "HIDDEN_DRIFT";
  }

  if (middleDimensions.length === 3) {
    return "HIDDEN_TWILIGHT";
  }

  const middleDimensionKey = middleDimensions.join(",");

  if (middleDimensionKey === "s,r") {
    return "HIDDEN_SMOKE";
  }

  if (middleDimensionKey === "d,c") {
    return "HIDDEN_DEW";
  }

  return "HIDDEN_RIDGE";
}

function getHiddenAliasCode(typeCode: string): string | null {
  const hiddenAliasByCode: Record<string, string> = {
    DRIFT: "HIDDEN_DRIFT",
    SUSPENDED: "HIDDEN_DRIFT",
    HIDDEN_DRIFT: "HIDDEN_DRIFT",
    DUSK: "HIDDEN_TWILIGHT",
    TWILIGHT: "HIDDEN_TWILIGHT",
    HIDDEN_TWILIGHT: "HIDDEN_TWILIGHT",
    SMOKE: "HIDDEN_SMOKE",
    HIDDEN_SMOKE: "HIDDEN_SMOKE",
    DEW: "HIDDEN_DEW",
    HIDDEN_DEW: "HIDDEN_DEW",
    RIDGE: "HIDDEN_RIDGE",
    HIDDEN_RIDGE: "HIDDEN_RIDGE",
  };

  return hiddenAliasByCode[typeCode.toUpperCase()] ?? null;
}

function getHiddenTypeSymbols(typeCode: string): string {
  const symbolsByTypeCode: Record<string, string> = {
    HIDDEN_DRIFT: "◐ ◐ ◐ ◐",
    HIDDEN_TWILIGHT: "● ◐ ◐ ◐",
    HIDDEN_SMOKE: "◐ ◐ ● ●",
    HIDDEN_DEW: "● ● ◐ ◐",
    HIDDEN_RIDGE: "◐ ● ◐ ●",
  };

  return symbolsByTypeCode[typeCode] ?? "◐ ◐ ◐ ◐";
}

function getScoreSymbol(score: number): string {
  if (score <= 35) {
    return "●";
  }

  if (score >= 65) {
    return "◯";
  }

  return "◐";
}

function isLegacyScores(scores: Scores | LegacyScores): scores is LegacyScores {
  return "tw" in scores;
}

function getCodeSymbol(letter: string): string {
  if (["s", "r", "d", "c"].includes(letter)) {
    return "●";
  }

  if (["S", "R", "D", "C"].includes(letter)) {
    return "◯";
  }

  return "◐";
}

function isHighLetter(
  letter: string | undefined,
  dimension: ScoreDimension,
): boolean {
  return letter === highLetterByDimension[dimension];
}
