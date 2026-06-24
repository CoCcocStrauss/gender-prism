"use client";

import { likertOptions, orderedQuestions } from "@/data/questions";
import {
  type Answer,
  calculateScores,
  getTypeCode,
} from "@/lib/scoring";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Step = "instruction" | "test" | "complete";

type TimedAnswer = Answer & {
  answeredAt: number;
  timeSpentMs: number;
};

export default function TestPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFinishedRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const [step, setStep] = useState<Step>("instruction");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, TimedAnswer>>({});
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [resultCode, setResultCode] = useState<string | null>(null);

  const currentQuestion = orderedQuestions[currentIndex];
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
    setQuestionStartedAt(now);
  }, [clearAutoAdvanceTimer]);

  const goToQuestion = useCallback(
    (index: number) => {
      clearAutoAdvanceTimer();
      setCurrentIndex(Math.min(Math.max(index, 0), orderedQuestions.length - 1));
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
      const orderedAnswers = orderedQuestions
        .map((question) => nextAnswers[question.id])
        .filter((answer): answer is TimedAnswer => Boolean(answer));
      const scoringAnswers: Answer[] = orderedAnswers.map(
        ({
          questionId,
          dimension,
          value,
          reverse,
          primaryWeight,
          secondaryDimension,
          secondaryWeight,
          tier,
        }) => ({
          questionId,
          dimension,
          value,
          reverse,
          primaryWeight,
          secondaryDimension,
          secondaryWeight,
          tier,
        }),
      );
      const scores = calculateScores(scoringAnswers);
      const code = getTypeCode(scores);
      const resultCode = code;

      console.log("[GenderPrism:test] finishTest calculated", {
        code,
        resultCode,
        scores,
        answerCount: orderedAnswers.length,
      });

      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem("prismScores", JSON.stringify(scores));
          console.log("[GenderPrism:test] sessionStorage written", {
            resultCode,
            scores,
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
    [],
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
        primaryWeight: currentQuestion.primaryWeight,
        secondaryDimension: currentQuestion.secondaryDimension,
        secondaryWeight: currentQuestion.secondaryWeight,
        tier: currentQuestion.tier,
        answeredAt: now,
        timeSpentMs: Math.max(now - questionStartedAt, 0),
      };
      const nextAnswers = {
        ...answers,
        [currentQuestion.id]: timedAnswer,
      };

      setAnswers(nextAnswers);

      autoAdvanceTimer.current = setTimeout(() => {
        if (currentIndex === orderedQuestions.length - 1) {
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

  if (step === "instruction") {
    return (
      <motion.main
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-screen bg-[#FAFAF8] px-6 text-foreground"
      >
        <section className="mx-auto max-w-[640px] pb-14 pt-12 sm:pb-[60px] sm:pt-[60px]">
          <p className="font-serif-display text-[20px] italic leading-none sm:text-[24px]">
            Before You Begin
          </p>

          <div className="mt-8 space-y-6 text-[15px] leading-[1.8] text-[#1a1a1a] sm:text-base">
            <p>
              这不是一个测试你「是男是女」或者「有多男性化多女性化」的工具。
            </p>
            <p>
              性别是人类社会最古老的分类系统之一。从你出生的那一刻起，这个系统就已经在运作了——它影响你如何被对待、如何被期待、如何理解自己和他人。
            </p>
            <p>
              我们关心的不是这个系统给你贴了什么标签。我们关心的是你和这个系统之间的互动方式。
            </p>
            <p>
              比如：当一个陌生人走进房间时，你会在多快的时间内注意到他们的性别？你是否曾经意识到自己的某个习惯其实来自性别规范？你的存在是让周围的性别氛围变得更浓，还是更淡？你在不同的场合里，是同一个你吗？
            </p>
            <p>
              这些问题没有正确答案。每种互动模式都有它的逻辑和来源。我们不会告诉你哪种模式更好或更进步。
            </p>
          </div>

          <div className="mt-10 h-px w-full bg-border sm:mt-12" />

          <section className="mt-6">
            <h2 className="text-sm font-normal tracking-widest text-[#8a8a8a]">
              HOW IT WORKS
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-[1.8] text-[#1a1a1a] sm:text-base">
              <p>接下来你将回答 72 道题目。每道题使用 1-5 分量表：</p>
              <p>1 = 完全不符合&nbsp;&nbsp;&nbsp;&nbsp;5 = 完全符合</p>
              <p>
                请尽量按照第一直觉回答。如果实在不确定，可以选 3（中立），但尽量少选——你的倾向比你以为的更清晰。
              </p>
              <p>测试大约需要 10 分钟。</p>
            </div>
          </section>

          <div className="mt-10 sm:mt-12">
            <button
              type="button"
              onClick={startTest}
              className="min-h-11 w-full rounded-lg bg-accent px-8 py-4 text-sm font-medium leading-none text-background transition-opacity duration-200 hover:opacity-85 sm:w-auto"
            >
              开始测试 →
            </button>
            <p className="mt-4 text-[13px] leading-6 text-[#8a8a8a]">
              结果是一张快照——下次做，你的颜色可能不同。
            </p>
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
            {currentIndex + 1} / {orderedQuestions.length}
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
              {likertOptions.map((option) => {
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

            {answeredQuestions > 0 ? (
              <p className="mt-12 text-center text-[13px] leading-6 text-muted">
                已回答 {answeredQuestions} 题
              </p>
            ) : null}
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

