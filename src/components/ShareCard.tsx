"use client";

import { type GenderType, type TypeQuote } from "@/data/types";
import { type ScoreDimension, type Scores } from "@/lib/scoring";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import type { RefObject } from "react";

type ShareCardProps = {
  type: GenderType;
  scores?: Scores | null;
  hidden?: boolean;
};

const coordinateMeta: {
  dimension: ScoreDimension;
  left: string;
  right: string;
  description: string;
}[] = [
  {
    dimension: "s",
    left: "s",
    right: "S",
    description: "性别感知",
  },
  {
    dimension: "r",
    left: "r",
    right: "R",
    description: "性别反思",
  },
  {
    dimension: "d",
    left: "d",
    right: "D",
    description: "淡化 ↔ 强化",
  },
  {
    dimension: "c",
    left: "c",
    right: "C",
    description: "跨场合一致性",
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
  scores?: Scores | null;
}) {
  const prismColor = type.hex;
  const displayedScores = scores ?? getDefaultScoresFromCode(type.code);
  const quote = type.quote;

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
      <p className="font-serif-display text-[44px] italic leading-none text-[#8a8a8a]">
        Gender Prism
      </p>

      <div style={{ height: 60 }} />

      <div
        className="rounded-full"
        style={{
          width: 168,
          height: 168,
          backgroundColor: prismColor,
          border: isLowContrastOnPaper(prismColor) ? "1px solid #e8e8e4" : "none",
        }}
      />

      <div style={{ height: 22 }} />

      <h1 className="text-[66px] font-extralight leading-[1.08] tracking-[-0.04em] text-[#1a1a1a]">
        {type.nameZh}
      </h1>

      <div style={{ height: 24 }} />

      <p className="font-serif-display text-[36px] italic leading-none text-[#8a8a8a]">
        {type.nameEn}
      </p>

      <div style={{ height: 72 }} />

      <div className="flex w-[850px] flex-col gap-7">
        {coordinateMeta.map((item) => (
          <MiniCoordinateLine
            key={item.dimension}
            score={displayedScores[item.dimension]}
            left={item.left}
            right={item.right}
            description={item.description}
          />
        ))}
      </div>

      <div style={{ height: 68 }} />

      <Divider />

      <div style={{ height: 44 }} />

      <p className="max-w-[85%] whitespace-pre-line text-center text-[30px] leading-[1.6] text-[#1a1a1a]">
        {type.portrait}
      </p>

      <div style={{ height: 68 }} />

      <Divider />

      <div style={{ height: 44 }} />

      <ShareCardQuote quote={quote} />

      <div style={{ height: 72 }} />

      <QRCodeSVG
        value={qrCodeUrl}
        size={180}
        fgColor="#1a1a1a"
        bgColor="transparent"
      />

      <div style={{ height: 28 }} />

      <p className="text-[24px] leading-none text-[#8a8a8a]">
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
      <div className="max-w-[85%] text-center">
        <p className="font-serif-display text-[30px] italic leading-[1.5] text-[#8a8a8a]">
          {quote.original}
        </p>
        <div style={{ height: 12 }} />
        <p className="text-[36px] leading-[1.5] text-[#1a1a1a]">
          {quote.translation}
        </p>
        <div style={{ height: 16 }} />
        <p className="text-[22px] leading-none text-[#8a8a8a]">{quote.source}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[85%] text-center">
      <p className="font-serif-display text-[30px] italic leading-[1.5] text-[#1a1a1a]">
        {quote.original}
      </p>
      <div style={{ height: 16 }} />
      <p className="text-[22px] leading-none text-[#8a8a8a]">{quote.source}</p>
    </div>
  );
}

function MiniCoordinateLine({
  score,
  left,
  right,
  description,
}: {
  score: number;
  left: string;
  right: string;
  description: string;
}) {
  const position = clampScore(score);

  return (
    <div>
      <div className="grid grid-cols-[52px_1fr_52px_78px] gap-x-5">
        <p className="col-start-2 text-center text-[22px] leading-none text-[#8a8a8a]">
          {description}
        </p>
      </div>
      <div className="mt-[20px] grid grid-cols-[52px_1fr_52px_78px] items-center gap-5">
        <span className="text-[28px] font-medium leading-none text-[#1a1a1a]">
          {left}
        </span>
        <div className="relative h-[18px]">
          <div
            className="absolute left-0 top-1/2 w-full -translate-y-1/2"
            style={{
              height: 4,
              background: "linear-gradient(90deg, #e8e8e4 0%, #8a8a8a 100%)",
            }}
          />
          <span
            className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${position}%`,
              backgroundColor: "#1a1a1a",
            }}
          />
        </div>
        <span className="text-right text-[28px] font-medium leading-none text-[#1a1a1a]">
          {right}
        </span>
        <span className="text-right text-[24px] leading-none text-[#8a8a8a]">
          {Math.round(position)}%
        </span>
      </div>
    </div>
  );
}

function getDefaultScoresFromCode(code: string): Scores {
  return {
    s: getDefaultPosition(code[0], "s", "S"),
    r: getDefaultPosition(code[1], "r", "R"),
    d: getDefaultPosition(code[2], "d", "D"),
    c: getDefaultPosition(code[3], "c", "C"),
  };
}

function getDefaultPosition(letter: string | undefined, low: string, high: string) {
  if (letter === low) {
    return 25;
  }

  if (letter === high) {
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
