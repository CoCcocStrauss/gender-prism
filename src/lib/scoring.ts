import { questions } from "@/data/questions";

export type Dimension = "TW" | "RD" | "GF" | "ML";

export type Answer = {
  questionId: number;
  dimension: Dimension;
  value: number;
  reverse: boolean;
};

export type Scores = {
  tw: number;
  rd: number;
  gf: number;
  ml: number;
};

type ScoreDimension = keyof Scores;

export type ValidationIssue = "attention_failed" | "too_fast" | "all_same";

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

type TimedAnswers = Answer[] & {
  totalTimeSeconds?: number;
  elapsedSeconds?: number;
  startedAt?: number;
  completedAt?: number;
};

const attentionAnswerValues = new Map<number, number>([
  [20, 4],
  [45, 3],
]);

const attentionQuestionIds = new Set(
  questions
    .filter((question) => question.attentionCheck)
    .map((question) => question.id),
);

export function calculateScores(answers: Answer[]): Scores {
  const totals: Record<Dimension, { sum: number; count: number }> = {
    TW: { sum: 0, count: 0 },
    RD: { sum: 0, count: 0 },
    GF: { sum: 0, count: 0 },
    ML: { sum: 0, count: 0 },
  };

  for (const answer of answers) {
    if (attentionQuestionIds.has(answer.questionId)) {
      continue;
    }

    const value = normalizeAnswerValue(answer);
    totals[answer.dimension].sum += value;
    totals[answer.dimension].count += 1;
  }

  return {
    tw: calculateDimensionScore(totals.TW),
    rd: calculateDimensionScore(totals.RD),
    gf: calculateDimensionScore(totals.GF),
    ml: calculateDimensionScore(totals.ML),
  };
}

export function getTypeCode(scores: Scores): string {
  return [
    getBandLetter(scores.tw, "T", "B", "W"),
    getBandLetter(scores.rd, "R", "H", "D"),
    getBandLetter(scores.gf, "G", "P", "F"),
    getBandLetter(scores.ml, "M", "V", "L"),
  ].join("");
}

export function getResultTypeCode(scores: Scores): string {
  const hiddenTypeCode = getHiddenTypeCodeFromMiddleDimensions(
    getMiddleDimensionsFromScores(scores),
  );

  if (hiddenTypeCode) {
    return hiddenTypeCode;
  }

  return [
    getResultLetter(scores.tw, "T", "W"),
    getResultLetter(scores.rd, "R", "D"),
    getResultLetter(scores.gf, "G", "F"),
    getResultLetter(scores.ml, "M", "L"),
  ].join("");
}

export function getResultTypeCodeFromCode(typeCode: string): string {
  const normalizedCode = typeCode.toUpperCase();
  const hiddenAlias = getHiddenAliasCode(normalizedCode);

  if (hiddenAlias) {
    return hiddenAlias;
  }

  const hiddenTypeCode = getHiddenTypeCodeFromMiddleDimensions(
    getMiddleDimensionsFromCode(normalizedCode),
  );

  if (hiddenTypeCode) {
    return hiddenTypeCode;
  }

  const [tw = "T", rd = "R", gf = "G", ml = "M"] = normalizedCode;

  return [
    getCanonicalCodeLetter(tw, "T", "W"),
    getCanonicalCodeLetter(rd, "R", "D"),
    getCanonicalCodeLetter(gf, "G", "F"),
    getCanonicalCodeLetter(ml, "M", "L"),
  ].join("");
}

export function getTypeSymbols(scores: Scores): string {
  return [scores.tw, scores.rd, scores.gf, scores.ml]
    .map(getScoreSymbol)
    .join(" ");
}

export function getTypeSymbolsFromCode(typeCode: string): string {
  const hiddenCode = getHiddenAliasCode(typeCode.toUpperCase());

  if (hiddenCode) {
    return getHiddenTypeSymbols(hiddenCode);
  }

  return typeCode
    .toUpperCase()
    .split("")
    .map(getCodeSymbol)
    .join(" ");
}

export function isMiddleScore(score: number): boolean {
  return score > 38 && score < 62;
}

function getMiddleDimensionsFromScores(scores: Scores): ScoreDimension[] {
  return (["tw", "rd", "gf", "ml"] satisfies ScoreDimension[]).filter(
    (dimension) => isMiddleScore(scores[dimension]),
  );
}

function getMiddleDimensionsFromCode(typeCode: string): ScoreDimension[] {
  const middleLetterByDimension: Record<ScoreDimension, string> = {
    tw: "B",
    rd: "H",
    gf: "P",
    ml: "V",
  };

  return (["tw", "rd", "gf", "ml"] satisfies ScoreDimension[]).filter(
    (dimension, index) => typeCode[index] === middleLetterByDimension[dimension],
  );
}

function getHiddenTypeCodeFromMiddleDimensions(
  middleDimensions: ScoreDimension[],
): string | null {
  if (middleDimensions.length < 2) {
    return null;
  }

  if (middleDimensions.length === 4) {
    return "HIDDEN_DRIFT";
  }

  if (middleDimensions.length === 3) {
    return "HIDDEN_TWILIGHT";
  }

  const middleDimensionKey = middleDimensions.join(",");

  if (middleDimensionKey === "tw,rd") {
    return "HIDDEN_SMOKE";
  }

  if (middleDimensionKey === "gf,ml") {
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

  return hiddenAliasByCode[typeCode] ?? null;
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

export function validateAnswers(answers: Answer[]): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (hasFailedAttentionCheck(answers)) {
    issues.push("attention_failed");
  }

  if (isTooFast(answers)) {
    issues.push("too_fast");
  }

  if (hasAllSameAnswers(answers)) {
    issues.push("all_same");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function normalizeAnswerValue(answer: Answer): number {
  return answer.reverse ? 6 - answer.value : answer.value;
}

function calculateDimensionScore(total: { sum: number; count: number }): number {
  if (total.count === 0) {
    return 0;
  }

  return ((total.sum - total.count) / (total.count * 4)) * 100;
}

function getBandLetter(
  score: number,
  lowLetter: string,
  middleLetter: string,
  highLetter: string,
): string {
  if (score <= 38) {
    return lowLetter;
  }

  if (score >= 62) {
    return highLetter;
  }

  return middleLetter;
}

function getResultLetter(
  score: number,
  lowLetter: string,
  highLetter: string,
): string {
  return score <= 50 ? lowLetter : highLetter;
}

function getCanonicalCodeLetter(
  letter: string,
  lowLetter: string,
  highLetter: string,
): string {
  if (letter === highLetter) {
    return highLetter;
  }

  return lowLetter;
}

function getScoreSymbol(score: number): string {
  if (score <= 38) {
    return "●";
  }

  if (score >= 62) {
    return "◯";
  }

  return "◐";
}

function getCodeSymbol(letter: string): string {
  if (["T", "R", "G", "M"].includes(letter)) {
    return "●";
  }

  if (["W", "D", "F", "L"].includes(letter)) {
    return "◯";
  }

  return "◐";
}

function hasFailedAttentionCheck(answers: Answer[]): boolean {
  const answerByQuestionId = new Map(
    answers.map((answer) => [answer.questionId, answer.value]),
  );

  for (const [questionId, expectedValue] of attentionAnswerValues) {
    if (answerByQuestionId.get(questionId) !== expectedValue) {
      return true;
    }
  }

  return false;
}

function isTooFast(answers: Answer[]): boolean {
  const totalTimeSeconds = getTotalTimeSeconds(answers);

  return totalTimeSeconds !== undefined && totalTimeSeconds < 90;
}

function getTotalTimeSeconds(answers: Answer[]): number | undefined {
  const timedAnswers = answers as TimedAnswers;

  if (typeof timedAnswers.totalTimeSeconds === "number") {
    return timedAnswers.totalTimeSeconds;
  }

  if (typeof timedAnswers.elapsedSeconds === "number") {
    return timedAnswers.elapsedSeconds;
  }

  if (
    typeof timedAnswers.startedAt === "number" &&
    typeof timedAnswers.completedAt === "number"
  ) {
    return (timedAnswers.completedAt - timedAnswers.startedAt) / 1000;
  }

  return undefined;
}

function hasAllSameAnswers(answers: Answer[]): boolean {
  if (answers.length < 2) {
    return false;
  }

  return answers.every((answer) => answer.value === answers[0].value);
}
