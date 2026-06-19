"use client";

import type { GenderType } from "@/data/types";
import {
  DIMENSION_GRADIENTS,
  type PrismDimension,
  type PrismScores,
  getDimensionColor,
  getPersonalPrismColor,
} from "@/lib/prismColor";
import { getTypeSymbols, getTypeSymbolsFromCode } from "@/lib/scoring";
import html2canvas from "html2canvas";
import type { RefObject } from "react";

export type ShareCardFormat = "tall" | "square";

type ShareCardProps = {
  type: GenderType;
  scores?: PrismScores | null;
  format?: ShareCardFormat;
  hidden?: boolean;
};

const coordinateMeta: {
  dimension: PrismDimension;
  left: string;
  right: string;
}[] = [
  { dimension: "tw", left: "T", right: "W" },
  { dimension: "rd", left: "R", right: "D" },
  { dimension: "gf", left: "G", right: "F" },
  { dimension: "ml", left: "M", right: "L" },
];

export function ShareCard({
  type,
  scores,
  format = "tall",
  hidden = true,
}: ShareCardProps) {
  return (
    <div
      aria-hidden={hidden}
      data-share-card-root
      className={hidden ? "pointer-events-none absolute left-[-9999px] top-0" : ""}
    >
      {hidden ? (
        <>
          <ShareCardLayout type={type} scores={scores} format="tall" />
          <ShareCardLayout type={type} scores={scores} format="square" />
        </>
      ) : (
        <ShareCardLayout type={type} scores={scores} format={format} />
      )}
    </div>
  );
}

export function useShareCard(
  cardRef: RefObject<HTMLElement | null>,
  code: string,
) {
  const downloadCard = async (format: ShareCardFormat) => {
    if (!cardRef.current) {
      return;
    }

    const target =
      cardRef.current.querySelector<HTMLElement>(
        `[data-share-card-format="${format}"]`,
      ) ?? cardRef.current;

    const canvas = await html2canvas(target, {
      backgroundColor: "#FAFAF8",
      scale: 1,
      useCORS: true,
      logging: false,
    });
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );

    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gender-prism-${code.toLowerCase()}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { downloadCard };
}

function ShareCardLayout({
  type,
  scores,
  format,
}: {
  type: GenderType;
  scores?: PrismScores | null;
  format: ShareCardFormat;
}) {
  const prismColor = scores ? getPersonalPrismColor(scores) : type.hex;
  const symbols = scores ? getTypeSymbols(scores) : getTypeSymbolsFromCode(type.code);
  const isTall = format === "tall";

  return (
    <article
      data-share-card-format={format}
      className="flex flex-col items-center bg-[#FAFAF8] text-center text-[#1a1a1a]"
      style={{
        width: 1080,
        height: isTall ? 1350 : 1080,
        paddingTop: isTall ? 140 : 110,
        paddingBottom: isTall ? 40 : 72,
      }}
    >
      <p className="font-serif-display text-[28px] italic leading-none text-[#8a8a8a]">
        Gender Prism
      </p>

      <div style={{ height: isTall ? 60 : 76 }} />

      <div
        className="rounded-full"
        style={{
          width: 200,
          height: 200,
          backgroundColor: prismColor,
          border: isLowContrastOnPaper(prismColor) ? "1px solid #e8e8e4" : "none",
        }}
      />

      <div style={{ height: 32 }} />

      <h1 className="text-[36px] font-light leading-[1.3] tracking-[-0.02em]">
        {type.nameZh}
      </h1>

      <div style={{ height: 8 }} />

      <p className="font-serif-display text-[20px] italic leading-none text-[#8a8a8a]">
        {type.nameEn}
      </p>

      {isTall ? (
        <>
          <div style={{ height: 20 }} />
          <p className="text-[16px] leading-none tracking-[0.3em] text-[#8a8a8a]">
            {symbols}
          </p>
          <div style={{ height: 28 }} />
          <div className="flex w-[400px] flex-col gap-5">
            {coordinateMeta.map((item) => (
              <MiniCoordinateLine
                key={item.dimension}
                dimension={item.dimension}
                score={
                  scores?.[item.dimension] ??
                  getDefaultPosition(type.code, item.dimension)
                }
                left={item.left}
                right={item.right}
              />
            ))}
          </div>
          <div style={{ height: 48 }} />
        </>
      ) : (
        <div style={{ height: 70 }} />
      )}

      <div className="h-px w-[30%] bg-[#e8e8e4]" />

      <div style={{ height: 24 }} />

      <p className="max-w-[65%] font-serif-display text-[20px] italic leading-[1.55] text-[#1a1a1a]">
        {type.tagline}
      </p>

      <div className="flex-1" />

      <div className="text-center">
        <p className="text-[16px] leading-[1.8] text-[#8a8a8a]">
          来看看你是什么类型
        </p>
        <p className="text-[14px] leading-[1.8] text-[#8a8a8a]">
          genderprism.app
        </p>
      </div>
    </article>
  );
}

function MiniCoordinateLine({
  dimension,
  score,
  left,
  right,
}: {
  dimension: PrismDimension;
  score: number;
  left: string;
  right: string;
}) {
  const gradient = DIMENSION_GRADIENTS[dimension];
  const position = clampScore(score);

  return (
    <div className="grid grid-cols-[24px_1fr_24px] items-center gap-3">
      <span className="text-[12px] leading-none text-[#8a8a8a]">{left}</span>
      <div className="relative h-2">
        <div
          className="absolute left-0 top-1/2 w-full -translate-y-1/2"
          style={{
            height: 1.5,
            background: `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          }}
        />
        <span
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${position}%`,
            backgroundColor: getDimensionColor(dimension, position),
          }}
        />
      </div>
      <span className="text-[12px] leading-none text-[#8a8a8a]">{right}</span>
    </div>
  );
}

function getDefaultPosition(code: string, dimension: PrismDimension): number {
  const indexByDimension: Record<PrismDimension, number> = {
    tw: 0,
    rd: 1,
    gf: 2,
    ml: 3,
  };
  const lowByDimension: Record<PrismDimension, string> = {
    tw: "T",
    rd: "R",
    gf: "G",
    ml: "M",
  };
  const highByDimension: Record<PrismDimension, string> = {
    tw: "W",
    rd: "D",
    gf: "F",
    ml: "L",
  };
  const letter = code[indexByDimension[dimension]];

  if (letter === lowByDimension[dimension]) {
    return 25;
  }

  if (letter === highByDimension[dimension]) {
    return 75;
  }

  return 50;
}

function isLowContrastOnPaper(hex: string): boolean {
  const [red, green, blue] = hexToRgb(hex);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 190;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function clampScore(score: number): number {
  return Math.min(Math.max(score, 0), 100);
}
