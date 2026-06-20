"use client";

import { questions } from "@/data/questions";
import {
  type Answer,
  calculateScores,
  getResultTypeCode,
  getTypeCode,
} from "@/lib/scoring";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Step = "intro" | "test" | "complete";

type BasicInfo = {
  age?: string;
  genderIdentity?: string;
};

type TimedAnswer = Answer & {
  answeredAt: number;
  timeSpentMs: number;
};

const ageOptions = ["18以下", "18-24", "25-34", "35-44", "45+"];

const genderIdentityOptions = [
  "男性",
  "女性",
  "非二元",
  "性别流动",
  "其他",
  "不想回答",
];

const storageKey = "gender-prism:result";

export default function TestPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFinishedRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const [step, setStep] = useState<Step>("intro");
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, TimedAnswer>>({});
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [testStartedAt, setTestStartedAt] = useState<number | null>(null);
  const [resultCode, setResultCode] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const answeredQuestions = Object.keys(answers).length;

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  const startTest = useCallback(() => {
    const now = Date.now();

    clearAutoAdvanceTimer();
    setStep("test");
    setTestStartedAt(now);
    setQuestionStartedAt(now);
  }, [clearAutoAdvanceTimer]);

  const goToQuestion = useCallback(
    (index: number) => {
      clearAutoAdvanceTimer();
      setCurrentIndex(Math.min(Math.max(index, 0), questions.length - 1));
      setQuestionStartedAt(Date.now());
    },
    [clearAutoAdvanceTimer],
  );

  const finishTest = useCallback(
    (nextAnswers: Record<number, TimedAnswer>) => {
      if (hasFinishedRef.current) {
        console.log("[GenderPrism:test] finishTest skipped: already finished");
        return;
      }

      hasFinishedRef.current = true;
      const completedAt = Date.now();
      const orderedAnswers = questions
        .map((question) => nextAnswers[question.id])
        .filter((answer): answer is TimedAnswer => Boolean(answer));
      const scoringAnswers: Answer[] = orderedAnswers.map(
        ({ questionId, dimension, value, reverse }) => ({
          questionId,
          dimension,
          value,
          reverse,
        }),
      );
      const scores = calculateScores(scoringAnswers);
      const code = getTypeCode(scores);
      const resultCode = getResultTypeCode(scores);

      console.log("[GenderPrism:test] finishTest calculated", {
        code,
        resultCode,
        scores,
        answerCount: orderedAnswers.length,
      });

      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem("prismScores", JSON.stringify(scores));
          window.sessionStorage.setItem(
            storageKey,
            JSON.stringify({
              code,
              resultCode,
              scores,
              basicInfo,
              answers: orderedAnswers,
              startedAt: testStartedAt,
              completedAt,
              totalTimeSeconds:
                testStartedAt === null
                  ? undefined
                  : (completedAt - testStartedAt) / 1000,
            }),
          );
          console.log("[GenderPrism:test] sessionStorage written", {
            resultCode,
            storageKey,
          });
        } catch (error) {
          console.error("[GenderPrism:test] sessionStorage write failed", error);
        }
      } else {
        console.log("[GenderPrism:test] sessionStorage skipped: no window");
      }

      setResultCode(resultCode);
      setStep("complete");
      console.log("[GenderPrism:test] complete state set", { resultCode });
    },
    [basicInfo, testStartedAt],
  );

  const selectAnswer = useCallback(
    (value: number) => {
      clearAutoAdvanceTimer();

      const now = Date.now();
      const timedAnswer: TimedAnswer = {
        questionId: currentQuestion.id,
        dimension: currentQuestion.dimension,
        value,
        reverse: currentQuestion.reverse,
        answeredAt: now,
        timeSpentMs: Math.max(now - questionStartedAt, 0),
      };
      const nextAnswers = {
        ...answers,
        [currentQuestion.id]: timedAnswer,
      };

      setAnswers(nextAnswers);

      autoAdvanceTimer.current = setTimeout(() => {
        if (currentIndex === questions.length - 1) {
          finishTest(nextAnswers);
          return;
        }

        setCurrentIndex((index) => index + 1);
        setQuestionStartedAt(Date.now());
      }, 500);
    },
    [
      answers,
      clearAutoAdvanceTimer,
      currentIndex,
      currentQuestion,
      finishTest,
      questionStartedAt,
    ],
  );

  useEffect(() => {
    if (step !== "test") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key >= "1" && event.key <= "5") {
        selectAnswer(Number(event.key));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectAnswer, step]);

  useEffect(() => {
    if (step !== "complete" || !resultCode) {
      return;
    }

    const target = `/result/${resultCode}`;
    console.log("[GenderPrism:test] scheduling result navigation", { target });

    const timer = setTimeout(() => {
      if (hasNavigatedRef.current) {
        console.log("[GenderPrism:test] push skipped: already navigated");
        return;
      }

      hasNavigatedRef.current = true;
      console.log("[GenderPrism:test] pushing result route", { target });
      router.push(target);
    }, 2000);

    return () => {
      console.log("[GenderPrism:test] clearing result navigation timer", { target });
      clearTimeout(timer);
    };
  }, [resultCode, router, step]);

  useEffect(() => clearAutoAdvanceTimer, [clearAutoAdvanceTimer]);

  if (step === "intro") {
    return (
      <motion.main
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-screen bg-background px-6 text-foreground"
      >
        <section className="mx-auto flex min-h-screen max-w-[680px] flex-col justify-center py-24">
          <div>
            <p className="font-serif-display text-xl italic leading-none">
              Before we begin...
            </p>

            <div className="mt-14 space-y-12">
              <OptionGroup
                label="年龄段"
                options={ageOptions}
                value={basicInfo.age}
                onChange={(value) =>
                  setBasicInfo((info) => ({ ...info, age: value }))
                }
              />
              <OptionGroup
                label="性别认同"
                options={genderIdentityOptions}
                value={basicInfo.genderIdentity}
                onChange={(value) =>
                  setBasicInfo((info) => ({ ...info, genderIdentity: value }))
                }
              />
            </div>

            <p className="mt-12 text-[13px] leading-6 text-muted">
              这些信息仅用于匿名统计，不影响结果，全部可跳过。
            </p>

            <div className="mt-10 flex items-center gap-6">
              <button
                type="button"
                onClick={startTest}
                className="inline-flex min-h-11 items-center text-sm text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline"
              >
                跳过
              </button>
              <button
                type="button"
                onClick={startTest}
                className="rounded-lg bg-accent px-8 py-4 text-sm font-medium leading-none text-background transition-opacity duration-200 hover:opacity-85"
              >
                继续 →
              </button>
            </div>
          </div>
        </section>
      </motion.main>
    );
  }

  if (step === "complete") {
    return (
      <motion.main
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground"
      >
        <div>
          <p className="font-serif-display text-2xl italic leading-none">
            One moment...
          </p>
          <p className="mt-5 text-sm leading-6 text-muted">正在整理你的答案</p>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-background px-6 text-foreground"
    >
      <header className="sticky inset-x-0 top-0 z-10 bg-background/95 px-6">
        <div className="mx-auto flex max-w-[680px] items-center justify-between py-6 text-[13px] leading-6 text-muted">
          <span>
            {currentIndex + 1} / {questions.length}
          </span>
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => goToQuestion(currentIndex - 1)}
            className="inline-flex min-h-11 items-center text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline disabled:pointer-events-none disabled:opacity-35"
          >
            上一题
          </button>
        </div>
      </header>

      <section className="mx-auto flex min-h-screen max-w-[680px] flex-col justify-center py-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" },
              },
              exit: {
                opacity: 0,
                transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: "easeOut" },
              },
            }}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            exit="exit"
          >
            <QuestionPrompt text={currentQuestion.text} />

            <div className="mx-auto mt-10 max-w-lg space-y-3">
              {currentQuestion.options.map((option) => {
                const selected = currentAnswer?.value === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectAnswer(option.value)}
                    className="flex min-h-12 w-full items-center gap-3 text-left text-base leading-[1.7] text-muted transition-opacity duration-200 hover:opacity-85"
                  >
                    <span
                      aria-hidden="true"
                      className="w-5 shrink-0 text-center text-[15px] text-foreground"
                    >
                      {selected ? "●" : "○"}
                    </span>
                    <span className={selected ? "text-foreground" : undefined}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-12 text-center text-[13px] leading-6 text-muted">
              可按 1-5 选择
              {answeredQuestions > 0 ? ` · 已回答 ${answeredQuestions} 题` : ""}
            </p>
          </motion.div>
        </AnimatePresence>
      </section>
    </motion.main>
  );
}

function QuestionPrompt({ text }: { text: string }) {
  const prompt = formatQuestionPrompt(text);

  if (!prompt.options) {
    return (
      <p className="mx-auto max-w-[560px] text-center text-lg font-normal leading-[1.65] tracking-[-0.01em] text-foreground sm:text-[22px]">
        {text}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-[560px] text-center text-lg font-normal leading-[1.65] tracking-[-0.01em] text-foreground sm:text-[22px]">
      <p>{prompt.stem}：</p>
      <p className="mt-3">{prompt.options}</p>
    </div>
  );
}

function formatQuestionPrompt(
  text: string,
): { stem: string; options?: string } {
  const [stem, options] = text.split("：");

  if (!stem || !options) {
    return { stem: text };
  }

  return {
    stem,
    options,
  };
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-4 text-sm font-normal text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`min-h-11 rounded-full border border-border px-4 text-sm leading-none transition-opacity duration-200 hover:opacity-85 ${
                selected
                  ? "border-accent bg-accent text-background"
                  : "text-foreground"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
