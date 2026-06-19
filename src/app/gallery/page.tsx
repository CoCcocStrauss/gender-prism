"use client";

import { genderTypes } from "@/data/types";
import { getTypeSymbolsFromCode } from "@/lib/scoring";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

type FilterValue =
  | "all"
  | "T"
  | "W"
  | "R"
  | "D"
  | "G"
  | "F"
  | "M"
  | "L";

const orderedCodes = [
  "TRFL",
  "WRFL",
  "TRFM",
  "TRGL",
  "WRGL",
  "TRGM",
  "WRGM",
  "WDGM",
  "TDGM",
  "TDGL",
  "WRFM",
  "WDGL",
  "TDFL",
  "WDFL",
  "TDFM",
  "WDFM",
];

const filterGroups: { value: FilterValue; label: string }[][] = [
  [{ value: "all", label: "全部" }],
  [
    { value: "T", label: "T 独行" },
    { value: "W", label: "W 织网" },
  ],
  [
    { value: "R", label: "R 共鸣" },
    { value: "D", label: "D 异响" },
  ],
  [
    { value: "G", label: "G 底色" },
    { value: "F", label: "F 前景" },
  ],
  [
    { value: "M", label: "M 棱镜" },
    { value: "L", label: "L 激光" },
  ],
];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const shouldReduceMotion = useReducedMotion();
  const orderedTypes = useMemo(
    () =>
      orderedCodes
        .map((code) => genderTypes.find((type) => type.code === code))
        .filter((type): type is (typeof genderTypes)[number] => Boolean(type)),
    [],
  );

  return (
    <motion.main
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-background px-6 text-foreground"
    >
      <div className="mx-auto max-w-5xl py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm leading-6 text-foreground transition-colors duration-200 hover:text-muted"
        >
          ← 返回
        </Link>

        <header className="mt-8">
          <h1 className="font-serif-display text-[28px] italic leading-none text-foreground">
            Sixteen Types
          </h1>
          <p className="mt-4 text-base leading-[1.8] text-muted">
            十六种与性别共处的方式
          </p>
        </header>

        <section className="mt-12 overflow-x-auto whitespace-nowrap no-scrollbar" aria-label="筛选类型">
          <div className="inline-flex items-center gap-x-2 text-sm leading-6">
            {filterGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="flex items-center gap-2">
                {groupIndex > 0 ? <span className="text-muted">·</span> : null}
                {group.map((filter, filterIndex) => (
                  <div key={filter.value} className="flex items-center gap-2">
                    {filterIndex > 0 ? <span className="text-muted">/</span> : null}
                    <button
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
                      className={`inline-flex min-h-11 items-center underline-offset-4 transition hover:text-foreground ${
                        activeFilter === filter.value
                          ? "text-foreground underline"
                          : "text-muted"
                      }`}
                    >
                      {filter.label}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="grid grid-cols-2 border-l border-t border-border md:grid-cols-4">
            {orderedTypes.map((type) => {
              const matched = matchesFilter(type.code, activeFilter);

              return (
                <Link
                  key={type.code}
                  href={`/result/${type.code}`}
                  className="group flex min-h-[180px] flex-col items-center justify-center border-b border-r border-border px-6 py-7 text-center transition duration-200 hover:bg-[#f0f0ec]"
                >
                  <span
                    aria-hidden="true"
                    className="h-9 w-9 rounded-full transition-opacity duration-200 md:h-12 md:w-12"
                    style={{
                      backgroundColor: type.hex,
                      opacity: matched ? 1 : 0.25,
                    }}
                  />
                  <span
                    className={`mt-3 text-base leading-7 transition duration-200 ${
                      matched ? "text-foreground" : "text-[#d0d0d0]"
                    }`}
                  >
                    {type.nameZh}
                  </span>
                  <span
                    className={`mt-1 font-serif-display text-[13px] italic leading-5 transition duration-200 ${
                      matched ? "text-muted" : "text-[#d0d0d0]"
                    }`}
                  >
                    {type.nameEn}
                  </span>
                  <span
                    className={`mt-2 text-xs leading-none tracking-[0.25em] transition duration-200 ${
                      matched ? "text-muted" : "text-[#d0d0d0]"
                    }`}
                  >
                    {getTypeSymbolsFromCode(type.code)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="flex justify-center pb-20 pt-12">
          <Link
            href="/test"
            className="rounded-lg bg-accent px-8 py-4 text-sm font-medium leading-none text-background transition-opacity duration-200 hover:opacity-85"
          >
            参加测试 →
          </Link>
        </footer>
      </div>
    </motion.main>
  );
}

function matchesFilter(code: string, filter: FilterValue): boolean {
  if (filter === "all") {
    return true;
  }

  return code.includes(filter);
}
