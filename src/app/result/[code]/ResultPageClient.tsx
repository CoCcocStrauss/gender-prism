"use client";

import { type GenderType, type TypeQuote } from "@/data/types";
import { type ScoreDimension, type Scores } from "@/lib/scoring";
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

export function ResultPageClient({
  type,
  resultCode,
}: ResultPageClientProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [scores, setScores] = useState<Scores | null>(null);
  const [copied, setCopied] = useState<"link" | null>(null);
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
  const prismColor = type.hex;
  const circleNeedsBorder = isLowContrastOnPaper(prismColor);
  const quote = type.quote;
  const srCouplingText = scores ? getSrCouplingText(scores) : null;
  const { createCardBlob, downloadCard } = useShareCard(shareCardRef, type.code);

  const copyText = async (text: string, copiedKey: "link") => {
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
    <main className="h-[100dvh] snap-y snap-mandatory overflow-y-scroll bg-background px-6 text-foreground">
      <section className="relative mx-auto flex min-h-[100dvh] max-w-[640px] snap-start flex-col justify-center px-5 py-10">
        <Link
          href={`/about?from=${encodeURIComponent(`/result/${resultCode}`)}`}
          className="absolute right-5 top-6 max-w-[160px] text-right text-[12px] leading-[1.5] text-muted underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
        >
          点击查看维度分类的学术基础
        </Link>
        <div className="flex flex-col items-center text-center">
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
          className="mt-3 h-16 w-16 rounded-full sm:h-20 sm:w-20"
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
          className="mt-3"
        >
          <h1 className="text-[22px] font-light leading-[1.3] tracking-[-0.02em] sm:text-2xl">
            {type.nameZh}
          </h1>
          <p className="mt-1.5 font-serif-display text-base italic leading-none text-muted">
            {type.nameEn}
          </p>
        </motion.div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.4,
            ease: "easeOut",
            delay: shouldReduceMotion ? 0 : 0.5,
          }}
          className="mt-5"
        >
          <h2 className="text-sm font-normal uppercase tracking-[0.15em] text-muted">
            YOUR COORDINATES
          </h2>
          <div className="mt-4 space-y-4">
            {coordinateMeta.map((item) => (
              <CoordinateLine
                key={item.dimension}
                score={displayedScores[item.dimension]}
                left={item.left}
                right={item.right}
                description={item.description}
              />
            ))}
          </div>

          {srCouplingText ? (
            <div className="mt-6">
              <h2 className="text-xs font-normal tracking-widest text-[#aaaaaa]">
                S-R COUPLING
              </h2>
              <p className="mt-3 text-[13px] leading-[1.6] text-[#8a8a8a]">
                {srCouplingText}
              </p>
            </div>
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
        <section className="snap-start px-5 py-10 sm:flex sm:min-h-[100dvh] sm:flex-col sm:justify-center">
          {splitPortrait(type.portrait).map((paragraph) => (
            <p
              key={paragraph}
              className="mb-6 text-base leading-[1.8] text-foreground last:mb-0"
            >
              {paragraph}
            </p>
          ))}

          <div className="mt-8 border-t border-border pt-6">
            <TypeQuoteBlock quote={quote} />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={saveShareCard}
                className="rounded-lg bg-accent px-7 py-3.5 text-sm font-medium leading-none text-background transition-opacity duration-200 hover:opacity-85"
              >
                保存棱镜卡
              </button>
              <button
                type="button"
                onClick={() => copyText(window.location.href, "link")}
                className="inline-flex min-h-11 items-center justify-center text-sm leading-6 text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline"
              >
                {copied === "link" ? "链接已复制" : "复制链接"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/collection"
                className="text-[14px] text-[#8a8a8a] underline-offset-4 transition-colors duration-200 hover:text-[#1a1a1a] hover:underline"
              >
                我的棱镜集 →
              </Link>
            </div>

            <footer className="mt-5 text-center">
              <p className="mx-auto max-w-[520px] text-[13px] leading-[1.7] text-muted">
                本测试为自我探索工具。你的颜色会随着生活经历而微妙变化，这完全正常。
              </p>
              <Link
                href="/disclaimer"
                className="mt-2 inline-flex min-h-11 items-center text-[13px] leading-6 text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline"
              >
                免责声明
              </Link>
            </footer>
          </div>
        </section>

        <div className="hidden">
          <AccordionItem
            title="你与系统"
            open={false}
            onToggle={() => undefined}
            shouldReduceMotion={shouldReduceMotion}
          >
            <p>{type.systemInsight}</p>
          </AccordionItem>
          <AccordionItem
            title="对话地图"
            open={false}
            onToggle={() => undefined}
            shouldReduceMotion={shouldReduceMotion}
          >
            <div />
          </AccordionItem>
        </div>
      </motion.div>
      <div ref={shareCardRef}>
        <ShareCard type={type} scores={displayedScores} inviteCode={resultCode} />
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
          className="h-auto w-[95vw] max-w-none"
        />
      </div>
    </div>
  );
}

function TypeQuoteBlock({ quote }: { quote: TypeQuote }) {
  if (quote.translation) {
    return (
      <div className="text-center">
        <p className="font-serif-display text-[15px] italic leading-[1.55] text-[#8a8a8a]">
          {quote.original}
        </p>
        <p className="mt-1 text-[17px] font-light leading-[1.55] text-[#1a1a1a]">
          {quote.translation}
        </p>
        <p className="mt-2 text-[12px] leading-5 text-[#8a8a8a]">
          {quote.source}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="font-serif-display text-[17px] italic leading-[1.55] text-[#1a1a1a]">
        {quote.original}
      </p>
      <p className="mt-2 text-[12px] leading-5 text-[#8a8a8a]">
        {quote.source}
      </p>
    </div>
  );
}

function CoordinateLine({
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
      <p className="text-center text-[13px] leading-none text-[#8a8a8a]">
        {description}
      </p>
      <div className="mt-[6px] grid grid-cols-[24px_1fr_24px_48px] items-center gap-3">
        <span className="text-[16px] font-medium leading-none text-[#1a1a1a]">
          {left}
        </span>
        <div className="relative h-[14px]">
        <div
          className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2"
          style={{
            height: "3px",
            background: "linear-gradient(90deg, #e8e8e4 0%, #8a8a8a 100%)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${position}%`,
            backgroundColor: "#1a1a1a",
          }}
        />
        </div>
        <span className="text-right text-[16px] font-medium leading-none text-[#1a1a1a]">
          {right}
        </span>
        <span className="text-right text-[14px] leading-none text-[#8a8a8a]">
          {Math.round(position)}%
        </span>
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

function parseStoredScores(value: string | null): Scores | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<Scores>;

    if (
      typeof parsed.s === "number" &&
      typeof parsed.r === "number" &&
      typeof parsed.d === "number" &&
      typeof parsed.c === "number"
    ) {
      return {
        s: clampScore(parsed.s),
        r: clampScore(parsed.r),
        d: clampScore(parsed.d),
        c: clampScore(parsed.c),
      };
    }
  } catch {
    return null;
  }

  return null;
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

function getSrCouplingText(scores: Scores): string | null {
  if (scores.s > 60 && scores.r > 60) {
    return "你对性别的感知和你的反思是正向耦合的——你很自然地按性别来理解世界，同时你也清楚地意识到自己在这样做。这种双重状态意味着你对性别的处理既深入又自觉。";
  }

  if (scores.s > 60 && scores.r < 40) {
    return "你对性别的感知强烈，但你对此很少反思——性别对你来说更接近一种自然事实，而非需要被分析的东西。你按性别组织世界的方式运行得很流畅，不产生摩擦。";
  }

  if (scores.s < 40 && scores.r > 60) {
    return "你不太自然地按性别来分类世界，但你对性别系统有很高的意识——你的性别认知更多来自学习和经历，而非本能。你的'看到'性别更多是因为你训练自己去看。";
  }

  if (scores.s < 40 && scores.r < 40) {
    return "性别在你的感知中既不突出也不被分析——它在你生活中的存在感很低。你和性别系统之间的摩擦小到你不太需要去注意它。";
  }

  return null;
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
