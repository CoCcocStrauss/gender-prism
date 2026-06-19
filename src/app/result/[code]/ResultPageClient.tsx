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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type ResultPageClientProps = {
  type: GenderType;
  allTypes: GenderType[];
};

type SectionKey = "system" | "dialogues" | "theory";

const coordinateMeta: {
  dimension: PrismDimension;
  left: string;
  right: string;
}[] = [
  { dimension: "tw", left: "独行 T", right: "W 织网" },
  { dimension: "rd", left: "共鸣 R", right: "D 异响" },
  { dimension: "gf", left: "底色 G", right: "F 前景" },
  { dimension: "ml", left: "棱镜 M", right: "L 激光" },
];

export function ResultPageClient({ type, allTypes }: ResultPageClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const scores = useSyncExternalStore(
    subscribeToPrismScores,
    getPrismScoresSnapshot,
    getPrismScoresServerSnapshot,
  );
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [openCoordinate, setOpenCoordinate] = useState<PrismDimension | null>(
    null,
  );
  const [hasTriggeredCoordinateHint, setHasTriggeredCoordinateHint] =
    useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [showCoordinateHint, setShowCoordinateHint] = useState(false);
  const [hasInteractedWithCoordinate, setHasInteractedWithCoordinate] =
    useState(false);
  const [copied, setCopied] = useState<"tagline" | "link" | null>(null);
  const coordinatesRef = useRef<HTMLElement | null>(null);
  const coordinateHintTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(null), 1600);

    return () => clearTimeout(timer);
  }, [copied]);

  const displayedScores = useMemo(
    () => scores ?? getDefaultScoresFromCode(type.code),
    [scores, type.code],
  );
  const symbols = scores ? getTypeSymbols(scores) : getTypeSymbolsFromCode(type.code);
  const prismColor = scores ? getPersonalPrismColor(scores) : type.hex;
  const circleNeedsBorder = isLowContrastOnPaper(prismColor);
  const dialogueTypeByCode = useMemo(
    () => new Map(allTypes.map((item) => [item.code, item])),
    [allTypes],
  );

  const copyText = async (text: string, copiedKey: "tagline" | "link") => {
    await navigator.clipboard.writeText(text);
    setCopied(copiedKey);
  };

  useEffect(() => {
    if (
      hasTriggeredCoordinateHint ||
      hasInteractedWithCoordinate ||
      !coordinatesRef.current
    ) {
      return;
    }

    const target = coordinatesRef.current;
    const clearHintTimers = () => {
      for (const timer of coordinateHintTimers.current) {
        clearTimeout(timer);
      }

      coordinateHintTimers.current = [];
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setHasTriggeredCoordinateHint(true);

        const startTimer = setTimeout(() => {
          if (!shouldReduceMotion) {
            setIsPulseActive(true);
          }

          const hintTimer = setTimeout(
            () => {
              setIsPulseActive(false);
              setShowCoordinateHint(true);

              const hideTimer = setTimeout(() => {
                setShowCoordinateHint(false);
              }, 3000);
              coordinateHintTimers.current.push(hideTimer);
            },
            shouldReduceMotion ? 0 : 800,
          );
          coordinateHintTimers.current.push(hintTimer);
        }, 800);
        coordinateHintTimers.current.push(startTimer);

        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      clearHintTimers();
    };
  }, [hasInteractedWithCoordinate, hasTriggeredCoordinateHint, shouldReduceMotion]);

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
        <section ref={coordinatesRef} className="pb-16">
          <h2 className="text-sm font-normal uppercase tracking-[0.15em] text-muted">
            YOUR COORDINATES
          </h2>
          <div className="mt-6 space-y-9">
            {coordinateMeta.map((item, index) => (
              <CoordinateLine
                key={item.dimension}
                dimension={item.dimension}
                score={displayedScores[item.dimension]}
                left={item.left}
                right={item.right}
                hasScores={Boolean(scores)}
                open={openCoordinate === item.dimension}
                onToggle={() =>
                  {
                    setHasInteractedWithCoordinate(true);
                    setShowCoordinateHint(false);
                    setIsPulseActive(false);
                    setOpenCoordinate((dimension) =>
                      dimension === item.dimension ? null : item.dimension,
                    );
                  }
                }
                shouldReduceMotion={shouldReduceMotion ?? false}
                pulse={index === 0 && isPulseActive}
              />
            ))}
          </div>
          <AnimatePresence>
            {showCoordinateHint && !hasInteractedWithCoordinate ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                className="mt-5 text-center text-[13px] leading-6 text-[#aaaaaa]"
              >
                轻触圆点，了解每条线
              </motion.p>
            ) : null}
          </AnimatePresence>
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
            <p className="font-serif-display text-lg italic leading-[1.7] text-foreground">
              {type.tagline}
            </p>
            <button
              type="button"
              onClick={() => copyText(type.tagline, "tagline")}
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
              onClick={() => window.print()}
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
    </main>
  );
}

function CoordinateLine({
  dimension,
  score,
  left,
  right,
  hasScores,
  open,
  onToggle,
  shouldReduceMotion,
  pulse,
}: {
  dimension: PrismDimension;
  score: number;
  left: string;
  right: string;
  hasScores: boolean;
  open: boolean;
  onToggle: () => void;
  shouldReduceMotion: boolean;
  pulse: boolean;
}) {
  const gradient = DIMENSION_GRADIENTS[dimension];
  const position = clampScore(score);
  const note = getCoordinateNote(dimension, hasScores ? position : null);

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
        <button
          type="button"
          aria-expanded={open}
          aria-label={`展开${left}到${right}的说明`}
          onClick={onToggle}
          className="group absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          style={{ left: `${position}%` }}
        >
          <motion.span
            aria-hidden="true"
            className="h-3 w-3 rounded-full"
            animate={
              pulse && !shouldReduceMotion
                ? { scale: [1, 1.6, 1], opacity: [1, 0.6, 1] }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              backgroundColor: getDimensionColor(dimension, position),
            }}
          />
        </button>
      </div>
      <div className="col-span-2 sm:col-span-1 sm:col-start-2">
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" },
                opacity: {
                  duration: shouldReduceMotion ? 0 : 0.2,
                  ease: "easeOut",
                },
              }}
              className="overflow-hidden"
            >
              <div className="pt-3 text-[13px] leading-[1.6] text-muted">
                <p>{note.explanation}</p>
                {note.interpretation ? <p>{note.interpretation}</p> : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
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

function subscribeToPrismScores(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);

  return () => window.removeEventListener("storage", onStoreChange);
}

function getPrismScoresSnapshot(): PrismScores | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStoredScores(sessionStorage.getItem("prismScores"));
}

function getPrismScoresServerSnapshot(): PrismScores | null {
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

function getCoordinateNote(
  dimension: PrismDimension,
  score: number | null,
): { explanation: string; interpretation?: string } {
  const notes: Record<
    PrismDimension,
    {
      explanation: string;
      low: string;
      middle: string;
      high: string;
    }
  > = {
    tw: {
      explanation:
        "这条线测量你的关系取向——你倾向于独立行动，还是在关系中寻求共振。",
      low: "你更倾向于独立判断和自主行动，在关系中保持清晰的边界。",
      middle: "你在独立与共融之间灵活切换，取决于情境和对象。",
      high: "你更倾向于集体协商和共情行动，重视关系中的连接感。",
    },
    rd: {
      explanation:
        "这条线测量你与社会性别规范之间的张力——和谐，还是摩擦。",
      low: "你与社会对你性别的期待之间感到自然的和谐。这可以是未经反思的，也可以是深思熟虑后的选择。",
      middle: "你与性别规范的关系比较复杂——有些部分和谐，有些部分有摩擦。",
      high: "你与社会性别期待之间存在明显的摩擦。这不一定是主动的反抗，也可能只是'那些规范跟我不合'。",
    },
    gf: {
      explanation:
        "这条线测量性别在你生活中的显著程度——它是背景，还是前景。",
      low: "性别对你来说更像是生活的背景色——它在那里，但你很少主动去想它。",
      middle: "性别在你的意识中时隐时现，有些时候特别明显，有些时候完全不在意。",
      high: "性别是你经常思考的议题，它深刻地影响着你对自己和世界的理解。",
    },
    ml: {
      explanation: "这条线测量你的性别表达在不同场合中的变化幅度。",
      low: "你在不同场合展现出明显不同的面向——像棱镜折射出不同的光。",
      middle: "你的表达有一定的情境变化，但核心气质保持一致。",
      high: "你在任何场合都是同一个你——像激光，始终是同一束光。",
    },
  };
  const note = notes[dimension];

  if (score === null) {
    return { explanation: note.explanation };
  }

  if (score <= 38) {
    return { explanation: note.explanation, interpretation: note.low };
  }

  if (score >= 62) {
    return { explanation: note.explanation, interpretation: note.high };
  }

  return { explanation: note.explanation, interpretation: note.middle };
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
