import chroma from "chroma-js";

export type PrismDimension = "tw" | "rd" | "gf" | "ml";

export type PrismScores = Record<PrismDimension, number>;

export const DIMENSION_GRADIENTS = {
  tw: { from: "#1E3A5F", to: "#C4A060" },
  rd: { from: "#5A7A7A", to: "#9A6B72" },
  gf: { from: "#C8C4BC", to: "#2A4A3A" },
  ml: { from: "#7A6A8A", to: "#A07A4A" },
} as const satisfies Record<PrismDimension, { from: string; to: string }>;

export function getDimensionColor(
  dimension: PrismDimension,
  score: number,
): string {
  const gradient = DIMENSION_GRADIENTS[dimension];
  const position = clampScore(score) / 100;

  return chroma.scale([gradient.from, gradient.to]).mode("lab")(position).hex();
}

export function getPersonalPrismColor(scores: PrismScores): string {
  const dimensionColors = (Object.keys(DIMENSION_GRADIENTS) as PrismDimension[]).map(
    (dimension) => getDimensionColor(dimension, scores[dimension]),
  );

  return chroma.average(dimensionColors, "lab").hex();
}

function clampScore(score: number): number {
  return Math.min(Math.max(score, 0), 100);
}
