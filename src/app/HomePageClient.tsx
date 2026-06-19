"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const introItems = [
  {
    title: "WHAT WE MEASURE",
    text: "你与社会性别系统的互动方式，不是你'是'什么性别。",
  },
  {
    title: "HOW IT WORKS",
    text: "四个维度，十六种类型。没有更好的答案，只有更真实的描述。",
  },
  {
    title: "WHERE IT COMES FROM",
    text: "基于 Butler、Connell、Crenshaw 等学者的性别研究文献。",
  },
];

export function HomePageClient() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.main
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-background px-6 text-foreground"
    >
      <section className="mx-auto flex min-h-screen max-w-[680px] flex-col justify-center py-24">
        <p className="font-serif-display text-xl italic leading-none text-foreground">
          Gender Prism
        </p>

        <h1 className="mt-10 max-w-[620px] text-[28px] font-light leading-[1.3] tracking-[-0.03em] text-foreground sm:text-4xl">
          你和性别之间，是什么关系？
        </h1>

        <p className="mt-4 max-w-[560px] text-base leading-[1.8] text-muted">
          不是测你「是」什么性别 —— 而是测你如何「做」你的性别
        </p>

        <div className="mt-10">
          <Link
            href="/test"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-8 py-4 text-sm font-medium leading-none text-background transition-opacity duration-200 hover:opacity-85 sm:w-auto"
          >
            开始测试 →
          </Link>
          <p className="mt-4 text-[13px] leading-6 text-muted">
            48 题 · 约 4 分钟 · 无需注册
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[680px] border-t border-border py-24 sm:py-28">
        <div>
          <h2 className="text-[32px] font-light leading-[1.3] tracking-[-0.03em] text-foreground sm:text-4xl">
            这不是又一个性别测试
          </h2>

          <div className="mt-16 space-y-12">
            {introItems.map((item) => (
              <article key={item.title}>
                <h3 className="text-sm font-normal uppercase tracking-widest text-muted">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-[1.8] text-foreground">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[680px] border-t border-border py-10">
        <div className="flex gap-6 text-[13px] leading-6 text-muted">
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline"
          >
            学术基础
          </Link>
          <Link
            href="/disclaimer"
            className="inline-flex min-h-11 items-center text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline"
          >
            免责声明
          </Link>
        </div>
        <p className="mt-10 text-xs leading-6 text-muted">© Gender Prism 2026</p>
      </footer>
    </motion.main>
  );
}
