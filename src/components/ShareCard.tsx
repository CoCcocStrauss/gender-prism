"use client";

import { genderTypes, type GenderType } from "@/data/types";
import { getTypeQuote, type TypeQuote } from "@/data/typeQuotes";
import {
  DIMENSION_GRADIENTS,
  type PrismDimension,
  type PrismScores,
  getDimensionColor,
  getPersonalPrismColor,
} from "@/lib/prismColor";
import { getTypeSymbols, getTypeSymbolsFromCode } from "@/lib/scoring";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import type { RefObject } from "react";

type ShareCardProps = {
  type: GenderType;
  scores?: PrismScores | null;
  hidden?: boolean;
};

const coordinateMeta: {
  dimension: PrismDimension;
  left: string;
  right: string;
  description: string;
}[] = [
  {
    dimension: "tw",
    left: "T",
    right: "W",
    description: "关系取向：独立行动 ↔ 寻求共振",
  },
  {
    dimension: "rd",
    left: "R",
    right: "D",
    description: "规范张力：和谐 ↔ 摩擦",
  },
  {
    dimension: "gf",
    left: "G",
    right: "F",
    description: "性别显著性：背景 ↔ 前景",
  },
  {
    dimension: "ml",
    left: "M",
    right: "L",
    description: "表达变化：多面折射 ↔ 始终如一",
  },
];

const qrCodeUrl = "https://gender-prism.vercel.app/";

export function ShareCard({ type, scores, hidden = true }: ShareCardProps) {
  return (
    <div
      aria-hidden={hidden}
      data-share-card-root
      className={hidden ? "pointer-events-none absolute left-[-9999px] top-0" : ""}
    >
      <ShareCardLayout type={type} scores={scores} />
    </div>
  );
}

export function useShareCard(
  cardRef: RefObject<HTMLElement | null>,
  code: string,
) {
  const createCardBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) {
      return null;
    }

    const target =
      cardRef.current.querySelector<HTMLElement>("[data-share-card]") ??
      cardRef.current;

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
      return null;
    }

    return blob;
  };

  const downloadCard = async () => {
    const blob = await createCardBlob();

    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gender-prism-${code}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { createCardBlob, downloadCard };
}

function ShareCardLayout({
  type,
  scores,
}: {
  type: GenderType;
  scores?: PrismScores | null;
}) {
  const prismColor = scores ? getPersonalPrismColor(scores) : type.hex;
  const symbols = scores ? getTypeSymbols(scores) : getTypeSymbolsFromCode(type.code);
  const quote = getTypeQuote(type.code);
  const typeByCode = new Map(genderTypes.map((item) => [item.code, item]));

  return (
    <article
      data-share-card
      className="flex flex-col items-center bg-[#FAFAF8] text-center text-[#1a1a1a]"
      style={{
        width: 1080,
        height: 2400,
        paddingTop: 60,
        paddingBottom: 60,
      }}
    >
      <p className="font-serif-display text-[24px] italic leading-none text-[#8a8a8a]">
        Gender Prism
      </p>

      <div style={{ height: 36 }} />

      <div
        className="rounded-full"
        style={{
          width: 140,
          height: 140,
          backgroundColor: prismColor,
          border: isLowContrastOnPaper(prismColor) ? "1px solid #e8e8e4" : "none",
        }}
      />

      <div style={{ height: 20 }} />

      <h1 className="text-[32px] font-light leading-none tracking-[-0.02em] text-[#1a1a1a]">
        {type.nameZh}
      </h1>

      <div style={{ height: 6 }} />

      <p className="font-serif-display text-[18px] italic leading-none text-[#8a8a8a]">
        {type.nameEn}
      </p>

      <div style={{ height: 6 }} />

      <p className="text-[14px] leading-none tracking-[0.3em] text-[#8a8a8a]">
        {symbols}
      </p>

      <div style={{ height: 32 }} />

      <div className="flex w-[700px] flex-col gap-5">
        {coordinateMeta.map((item) => (
          <MiniCoordinateLine
            key={item.dimension}
            dimension={item.dimension}
            score={
              scores?.[item.dimension] ?? getDefaultPosition(type.code, item.dimension)
            }
            left={item.left}
            right={item.right}
            description={item.description}
          />
        ))}
      </div>

      <div style={{ height: 32 }} />

      <Divider />

      <div style={{ height: 24 }} />

      <p className="max-w-[75%] whitespace-pre-line text-center text-[16px] leading-[1.7] text-[#1a1a1a]">
        {type.portrait}
      </p>

      <div style={{ height: 32 }} />

      <Divider />

      <div style={{ height: 24 }} />

      <p className="text-[14px] leading-none text-[#8a8a8a]">你与系统</p>

      <div style={{ height: 12 }} />

      <p className="max-w-[75%] text-center text-[15px] leading-[1.6] text-[#1a1a1a]">
        {type.systemInsight}
      </p>

      <div style={{ height: 32 }} />

      <Divider />

      <div style={{ height: 24 }} />

      <p className="text-[14px] leading-none text-[#8a8a8a]">对话地图</p>

      <div style={{ height: 16 }} />

      <div className="flex max-w-[75%] flex-col gap-4 text-left">
        {type.dialogues.map((dialogue) => {
          const withType = typeByCode.get(dialogue.withCode);

          return (
            <div
              key={dialogue.withCode}
              className="text-[14px] leading-[1.5] text-[#1a1a1a]"
            >
              <span
                aria-hidden="true"
                className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                style={{ backgroundColor: withType?.hex ?? "#8a8a8a" }}
              />
              <span className="font-medium">
                {withType?.nameZh ?? dialogue.withCode}
              </span>
              <span>：{dialogue.description}</span>
            </div>
          );
        })}
      </div>

      <div style={{ height: 32 }} />

      <Divider />

      <div style={{ height: 20 }} />

      {quote ? (
        <ShareCardQuote quote={quote} />
      ) : (
        <p className="max-w-[75%] font-serif-display text-[16px] italic leading-[1.55] text-[#1a1a1a]">
          {type.tagline}
        </p>
      )}

      <div style={{ height: 40 }} />

      <QRCodeSVG
        value={qrCodeUrl}
        size={120}
        fgColor="#1a1a1a"
        bgColor="transparent"
      />

      <div style={{ height: 16 }} />

      <p className="text-[14px] leading-none text-[#8a8a8a]">
        扫码测试你的性别棱镜
      </p>
    </article>
  );
}

function Divider() {
  return <div className="h-px w-[30%] bg-[#e8e8e4]" />;
}

function ShareCardQuote({ quote }: { quote: TypeQuote }) {
  if (quote.translation) {
    return (
      <div className="max-w-[75%] text-center">
        <p className="font-serif-display text-[14px] italic leading-[1.55] text-[#8a8a8a]">
          {quote.original}
        </p>
        <div style={{ height: 4 }} />
        <p className="text-[16px] leading-[1.55] text-[#1a1a1a]">
          {quote.translation}
        </p>
        <div style={{ height: 6 }} />
        <p className="text-[12px] leading-none text-[#8a8a8a]">{quote.source}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[75%] text-center">
      <p className="font-serif-display text-[16px] italic leading-[1.55] text-[#1a1a1a]">
        {quote.original}
      </p>
      <div style={{ height: 6 }} />
      <p className="text-[12px] leading-none text-[#8a8a8a]">{quote.source}</p>
    </div>
  );
}

function MiniCoordinateLine({
  dimension,
  score,
  left,
  right,
  description,
}: {
  dimension: PrismDimension;
  score: number;
  left: string;
  right: string;
  description: string;
}) {
  const gradient = DIMENSION_GRADIENTS[dimension];
  const position = clampScore(score);

  return (
    <div>
      <div className="grid grid-cols-[36px_1fr_36px] items-center gap-4">
        <span className="text-[14px] leading-none text-[#8a8a8a]">{left}</span>
        <div className="relative h-[14px]">
          <div
            className="absolute left-0 top-1/2 w-full -translate-y-1/2"
            style={{
              height: 3,
              background: `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
            }}
          />
          <span
            className="absolute top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${position}%`,
              backgroundColor: getDimensionColor(dimension, position),
            }}
          />
        </div>
        <span className="text-[14px] leading-none text-[#8a8a8a]">{right}</span>
      </div>
      <p className="mt-1.5 text-center text-[12px] leading-none text-[#aaaaaa]">
        {description}
      </p>
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
