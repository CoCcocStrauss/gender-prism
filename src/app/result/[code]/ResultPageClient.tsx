"use client";

import type { GenderType } from "@/data/types";
import {
  formatTypeQuoteForCopy,
  getTypeQuote,
  type TypeQuote,
} from "@/data/typeQuotes";
import {
  DIMENSION_GRADIENTS,
  type PrismDimension,
  type PrismScores,
  getDimensionColor,
  getPersonalPrismColor,
} from "@/lib/prismColor";
import { getTypeSymbols, getTypeSymbolsFromCode, isMiddleScore } from "@/lib/scoring";
import { ShareCard, useShareCard } from "@/components/ShareCard";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ResultPageClientProps = {
  type: GenderType;
  allTypes: GenderType[];
  resultCode: string;
};

type SectionKey = "system" | "dialogues" | "theory";

const coordinateMeta: {
  dimension: PrismDimension;
  name: string;
  left: string;
  right: string;
}[] = [
  { dimension: "tw", name: "关系取向", left: "独行 T", right: "W 织网" },
  { dimension: "rd", name: "规范张力", left: "共鸣 R", right: "D 异响" },
  { dimension: "gf", name: "性别显著性", left: "底色 G", right: "F 前景" },
  { dimension: "ml", name: "表达一致性", left: "棱镜 M", right: "L 激光" },
];

export function ResultPageClient({
  type,
  allTypes,
  resultCode,
}: ResultPageClientProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [scores, setScores] = useState<PrismScores | null>(null);
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [copied, setCopied] = useState<"tagline" | "link" | null>(null);
  const [sharePreviewUrl, setSharePreviewUrl] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(null), 1600);

    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateScoresFromStorage = () => {
      setScores(parseStoredScores(window.sessionStorage.getItem("prismScores")));
    };

    updateScoresFromStorage();
    window.addEventListener("storage", updateScoresFromStorage);

    return () => window.removeEventListener("storage", updateScoresFromStorage);
  }, []);

  const displayedScores = useMemo(
    () => scores ?? getDefaultScoresFromCode(type.code),
    [scores, type.code],
  );
  const symbols = scores ? getTypeSymbols(scores) : getTypeSymbolsFromCode(resultCode);
  const prismColor = scores ? getPersonalPrismColor(scores) : type.hex;
  const circleNeedsBorder = isLowContrastOnPaper(prismColor);
  const quote = getTypeQuote(type.code);
  const copyQuoteText = quote ? formatTypeQuoteForCopy(quote) : type.tagline;
  const middleDimensions = scores
    ? coordinateMeta.filter((item) => isMiddleScore(scores[item.dimension]))
    : [];
  const singleMiddleDimension =
    middleDimensions.length === 1 ? middleDimensions[0] : null;
  const dialogueTypeByCode = useMemo(
    () => new Map(allTypes.map((item) => [item.code, item])),
    [allTypes],
  );
  const { createCardBlob, downloadCard } = useShareCard(shareCardRef, type.code);

  const copyText = async (text: string, copiedKey: "tagline" | "link") => {
    await navigator.clipboard.writeText(text);
    setCopied(copiedKey);
  };

  const closeSharePreview = () => {
    if (sharePreviewUrl) {
      URL.revokeObjectURL(sharePreviewUrl);
    }

    setSharePreviewUrl(null);
  };

  const saveShareCard = async () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const blob = await createCardBlob();

      if (!blob) {
        return;
      }

      if (sharePreviewUrl) {
        URL.revokeObjectURL(sharePreviewUrl);
      }

      setSharePreviewUrl(URL.createObjectURL(blob));
      return;
    }

    await downloadCard();
  };

  useEffect(() => {
    return () => {
      if (sharePreviewUrl) {
        URL.revokeObjectURL(sharePreviewUrl);
      }
    };
  }, [sharePreviewUrl]);

  return (
    <main className="min-h-screen bg-background px-6 text-foreground">
      <section className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center pt-20 text-center">
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
          className="font-serif-display text-sm italic leading-none text-muted"
        >
          Your Gender Prism
        </motion.p>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" }}
          className="mt-6 h-24 w-24 rounded-full sm:h-[120px] sm:w-[120px]"
          style={{
            backgroundColor: prismColor,
            border: circleNeedsBorder ? "1px solid #e8e8e4" : "none",
          }}
          aria-label={`你的个人棱镜色 ${prismColor}`}
        />

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.4,
            ease: "easeOut",
            delay: shouldReduceMotion ? 0 : 0.3,
          }}
          className="mt-6"
        >
          <h1 className="text-[22px] font-light leading-[1.3] tracking-[-0.02em] sm:text-2xl">
            {type.nameZh}
          </h1>
          <p className="mt-2 font-serif-display text-base italic leading-none text-muted">
            {type.nameEn}
          </p>
          <p className="mt-3 text-base tracking-[0.3em] text-muted">{symbols}</p>
          {singleMiddleDimension ? (
            <p className="mx-auto mt-4 max-w-[420px] text-[13px] leading-6 text-muted">
              你在{singleMiddleDimension.name}
              上接近中间地带，这个结果未必能完全概括你。
            </p>
          ) : null}
        </motion.div>
      </section>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.4,
          ease: "easeOut",
          delay: shouldReduceMotion ? 0 : 0.5,
        }}
        className="mx-auto max-w-[640px]"
      >
        <section className="pb-16">
          <h2 className="text-sm font-normal uppercase tracking-[0.15em] text-muted">
            YOUR COORDINATES
          </h2>
          <div className="mt-6 space-y-7">
            {coordinateMeta.map((item) => (
              <CoordinateLine
                key={item.dimension}
                dimension={item.dimension}
                score={displayedScores[item.dimension]}
                left={item.left}
                right={item.right}
              />
            ))}
          </div>
        </section>

        <section className="pb-12">
          {splitPortrait(type.portrait).map((paragraph) => (
            <p
              key={paragraph}
              className="mb-6 text-base leading-[1.8] text-foreground last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </section>

        <section className="border-t border-border pb-12 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {quote ? <TypeQuoteBlock quote={quote} /> : (
              <p className="font-serif-display text-lg italic leading-[1.7] text-foreground">
                {type.tagline}
              </p>
            )}
            <button
              type="button"
              onClick={() => copyText(copyQuoteText, "tagline")}
              className="inline-flex min-h-11 shrink-0 items-center text-left text-sm leading-6 text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline"
            >
              {copied === "tagline" ? "已复制" : "复制"}
            </button>
          </div>
        </section>

        <section className="pb-12">
          <AccordionItem
            title="你与系统"
            open={openSection === "system"}
            onToggle={() =>
              setOpenSection((section) => (section === "system" ? null : "system"))
            }
            shouldReduceMotion={shouldReduceMotion}
          >
            <p>{type.systemInsight}</p>
          </AccordionItem>

          <AccordionItem
            title="对话地图"
            open={openSection === "dialogues"}
            onToggle={() =>
              setOpenSection((section) =>
                section === "dialogues" ? null : "dialogues",
              )
            }
            shouldReduceMotion={shouldReduceMotion}
          >
            <div className="space-y-5">
              {type.dialogues.map((dialogue) => {
                const withType = dialogueTypeByCode.get(dialogue.withCode);

                return (
                  <div key={dialogue.withCode} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[0.62em] h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: withType?.hex ?? "#8a8a8a" }}
                    />
                    <p>
                      <span className="text-foreground">
                        {withType?.nameZh ?? dialogue.withCode}
                      </span>
                      ：{dialogue.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </AccordionItem>

          <AccordionItem
            title="理论注脚"
            open={openSection === "theory"}
            onToggle={() =>
              setOpenSection((section) => (section === "theory" ? null : "theory"))
            }
            shouldReduceMotion={shouldReduceMotion}
          >
            <p>{type.theoryNote}</p>
          </AccordionItem>
        </section>

        <section className="border-t border-border pb-12 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={saveShareCard}
              className="rounded-lg bg-accent px-7 py-3.5 text-sm font-medium leading-none text-background transition-opacity duration-200 hover:opacity-85"
            >
              保存棱镜卡
            </button>
            <Link
              href="/gallery"
              className="rounded-lg border border-foreground px-7 py-3.5 text-center text-sm font-medium leading-none text-foreground transition-opacity duration-200 hover:opacity-85"
            >
              查看全部类型
            </Link>
          </div>
          <button
            type="button"
            onClick={() => copyText(window.location.href, "link")}
            className="mt-4 inline-flex min-h-11 items-center text-sm leading-6 text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline"
          >
            {copied === "link" ? "链接已复制" : "复制链接"}
          </button>
        </section>

        <footer className="pb-20 text-center">
          <p className="mx-auto max-w-[520px] text-[13px] leading-[1.8] text-muted">
            本测试为自我探索工具。你的颜色会随着生活经历而微妙变化——这完全正常。
          </p>
          <Link
            href="/disclaimer"
            className="mt-3 inline-flex min-h-11 items-center text-[13px] leading-6 text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline"
          >
            免责声明
          </Link>
        </footer>
      </motion.div>
      <div ref={shareCardRef}>
        <ShareCard type={type} scores={scores} />
      </div>
      {sharePreviewUrl ? (
        <ShareCardPreviewOverlay
          imageUrl={sharePreviewUrl}
          onClose={closeSharePreview}
        />
      ) : null}
    </main>
  );
}

function ShareCardPreviewOverlay({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(0,0,0,0.85)] px-5 pb-8">
      <div className="sticky top-0 z-10 bg-[rgba(0,0,0,0.85)] pt-4">
        <p className="text-center text-[14px] leading-6 text-white">
          长按图片保存到相册
        </p>
        <button
          type="button"
          aria-label="关闭分享卡预览"
          onClick={onClose}
          className="absolute right-0 top-2 flex h-11 w-11 items-center justify-center text-[24px] leading-none text-white"
        >
          ×
        </button>
      </div>
      <div className="flex justify-center py-6">
        <Image
          src={imageUrl}
          alt="性别棱镜分享卡"
          width={1080}
          height={2400}
          unoptimized
          className="h-auto w-[90vw] max-w-none"
        />
      </div>
    </div>
  );
}

function TypeQuoteBlock({ quote }: { quote: TypeQuote }) {
  if (quote.translation) {
    return (
      <div className="text-center sm:flex-1">
        <p className="font-serif-display text-base italic leading-[1.7] text-[#8a8a8a]">
          {quote.original}
        </p>
        <p className="mt-1 text-lg font-light leading-[1.7] text-[#1a1a1a]">
          {quote.translation}
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[#8a8a8a]">
          {quote.source}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center sm:flex-1">
      <p className="font-serif-display text-lg italic leading-[1.7] text-[#1a1a1a]">
        {quote.original}
      </p>
      <p className="mt-2 text-[13px] leading-6 text-[#8a8a8a]">
        {quote.source}
      </p>
    </div>
  );
}

function CoordinateLine({
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
  const note = getCoordinateNote(dimension);

  return (
    <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-[72px_1fr_72px]">
      <span className="self-center text-sm leading-6 text-muted">{left}</span>
      <span className="self-center text-right text-sm leading-6 text-muted sm:col-start-3">
        {right}
      </span>
      <div className="relative col-span-2 mt-1 h-11 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:mt-0">
        <div
          className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2"
          style={{
            height: "2px",
            background: `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${position}%`,
            backgroundColor: getDimensionColor(dimension, position),
          }}
        />
      </div>
      <p className="col-span-2 mt-2 text-[13px] leading-[1.4] text-[#aaaaaa] sm:col-span-1 sm:col-start-2">
        {note.explanation}
      </p>
    </div>
  );
}

function AccordionItem({
  title,
  open,
  onToggle,
  children,
  shouldReduceMotion,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  shouldReduceMotion: boolean;
}) {
  return (
    <div className="border-t border-border py-5 last:border-b">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-base leading-7 text-foreground"
      >
        <span>{title}</span>
        <span aria-hidden="true">{open ? "↑" : "↓"}</span>
      </button>
      <div
        className="grid transition-all duration-300 ease-out"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transitionDuration: shouldReduceMotion ? "0ms" : "300ms",
        }}
      >
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.2,
                ease: "easeOut",
              }}
              className="overflow-hidden"
            >
              <div className="pt-4 text-base leading-[1.8] text-muted">{children}</div>
            </motion.div>
          ) : (
            <div className="overflow-hidden" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function parseStoredScores(value: string | null): PrismScores | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<PrismScores>;

    if (
      typeof parsed.tw === "number" &&
      typeof parsed.rd === "number" &&
      typeof parsed.gf === "number" &&
      typeof parsed.ml === "number"
    ) {
      return {
        tw: clampScore(parsed.tw),
        rd: clampScore(parsed.rd),
        gf: clampScore(parsed.gf),
        ml: clampScore(parsed.ml),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function getDefaultScoresFromCode(code: string): PrismScores {
  return {
    tw: getDefaultPosition(code[0], "T", "W"),
    rd: getDefaultPosition(code[1], "R", "D"),
    gf: getDefaultPosition(code[2], "G", "F"),
    ml: getDefaultPosition(code[3], "M", "L"),
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

function getCoordinateNote(dimension: PrismDimension): { explanation: string } {
  const notes: Record<PrismDimension, { explanation: string }> = {
    tw: {
      explanation:
        "这条线测量你的关系取向——你倾向于独立行动，还是在关系中寻求共振。",
    },
    rd: {
      explanation:
        "这条线测量你与社会性别规范之间的张力——和谐，还是摩擦。",
    },
    gf: {
      explanation:
        "这条线测量性别在你生活中的显著程度——它是背景，还是前景。",
    },
    ml: {
      explanation: "这条线测量你的性别表达在不同场合中的变化幅度。",
    },
  };

  return notes[dimension];
}

function splitPortrait(portrait: string): string[] {
  const sentences = portrait.match(/[^。]+。?/g) ?? [portrait];
  const paragraphs: string[] = [];

  for (let index = 0; index < sentences.length; index += 2) {
    paragraphs.push(sentences.slice(index, index + 2).join(""));
  }

  return paragraphs;
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
