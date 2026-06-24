"use client";

import { type GenderType } from "@/data/types";
import {
  getGenderTypeByCode,
  getPresetScoresForGenderType,
  searchGenderTypes,
} from "@/lib/prism-social";
import { type ScoreDimension, type Scores } from "@/lib/scoring";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

type InvitePageClientProps = {
  code: string;
};

const dimensionSliders: {
  key: ScoreDimension;
  left: string;
  right: string;
  gradient: string;
}[] = [
  {
    key: "s",
    left: "s",
    right: "S",
    gradient: "linear-gradient(90deg, #1E3A5F 0%, #C4A060 100%)",
  },
  {
    key: "r",
    left: "r",
    right: "R",
    gradient: "linear-gradient(90deg, #5A7A7A 0%, #9A6B72 100%)",
  },
  {
    key: "d",
    left: "d",
    right: "D",
    gradient: "linear-gradient(90deg, #C8C4BC 0%, #2A4A3A 100%)",
  },
  {
    key: "c",
    left: "c",
    right: "C",
    gradient: "linear-gradient(90deg, #7A6A8A 0%, #A07A4A 100%)",
  },
];

function subscribeToStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function readMyTypeSnapshot() {
  return window.localStorage.getItem("myType");
}

export function InvitePageClient({ code }: InvitePageClientProps) {
  const router = useRouter();
  const friendType = getGenderTypeByCode(code);
  const myType = useSyncExternalStore(
    subscribeToStorage,
    readMyTypeSnapshot,
    () => null,
  );
  const [showExistingPanel, setShowExistingPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<GenderType | null>(null);
  const [draftScores, setDraftScores] = useState<Scores | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const searchResults = useMemo(
    () => searchGenderTypes(searchQuery, 5),
    [searchQuery],
  );

  useEffect(() => {
    if (!myType) {
      return;
    }

    router.replace(
      `/compare?me=${encodeURIComponent(myType)}&friend=${encodeURIComponent(code)}`,
    );
  }, [code, myType, router]);

  const startTest = () => {
    window.sessionStorage.setItem("pendingFriend", code);
    router.push("/test");
  };

  const beginScoreConfirm = (type: GenderType) => {
    setSelectedType(type);
    setDraftScores(getPresetScoresForGenderType(type));
  };

  const updateScore = (dimension: ScoreDimension, value: number) => {
    setDraftScores((current) =>
      current ? { ...current, [dimension]: value } : current,
    );
  };

  const confirmScores = () => {
    if (!selectedType || !draftScores) {
      return;
    }

    window.localStorage.setItem("myType", selectedType.code);
    window.localStorage.setItem("myScores", JSON.stringify(draftScores));
    window.localStorage.setItem("myScoresApproximate", "true");
    router.push(
      `/compare?me=${encodeURIComponent(selectedType.code)}&friend=${encodeURIComponent(code)}`,
    );
  };

  const openExistingPanel = () => {
    setShowExistingPanel(true);
    setSelectedType(null);
    setDraftScores(null);
    setSearchQuery("");

    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeExistingPanel = () => {
    setShowExistingPanel(false);
    setSelectedType(null);
    setDraftScores(null);
    setSearchQuery("");
  };

  if (myType) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6">
        <p className="text-[14px] text-[#8a8a8a]">加载中...</p>
      </main>
    );
  }

  if (!friendType) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center bg-[#FAFAF8] px-6 text-center">
        <p className="text-[16px] text-[#1a1a1a]">这个链接好像有问题</p>
        <Link
          href="/"
          className="mt-6 text-[14px] text-[#8a8a8a] underline-offset-4 transition-colors hover:text-[#1a1a1a] hover:underline"
        >
          去首页看看 →
        </Link>
      </main>
    );
  }

  return (
    <main
      className={`mx-auto flex min-h-screen max-w-[640px] flex-col items-center bg-[#FAFAF8] px-6 text-center ${
        showExistingPanel ? "justify-start py-10" : "justify-center py-10"
      }`}
    >
      <div
        className="h-[100px] w-[100px] rounded-full"
        style={{ backgroundColor: friendType.hex }}
        aria-hidden="true"
      />

      <p className="mt-4 text-[20px] text-[#1a1a1a]">你的朋友是{friendType.nameZh}</p>

      <p className="mt-2 font-serif-display text-[16px] italic text-[#8a8a8a]">
        {friendType.nameEn}
      </p>

      <p className="mt-8 text-[16px] text-[#8a8a8a]">想知道你们之间会怎样互动吗？</p>

      <button
        type="button"
        onClick={startTest}
        className="mt-6 rounded-lg bg-[#1a1a1a] px-8 py-3.5 text-[14px] font-medium leading-none text-white transition-opacity hover:opacity-85"
      >
        先来看看你自己 →
      </button>

      <button
        type="button"
        onClick={openExistingPanel}
        className="mt-4 inline-flex min-h-11 items-center px-3 text-[14px] text-[#8a8a8a] underline-offset-4 transition-colors hover:text-[#1a1a1a] hover:underline"
      >
        已经做过测试？
      </button>

      {showExistingPanel && selectedType && draftScores ? (
        <div
          ref={panelRef}
          className="mt-6 flex w-full max-w-[320px] flex-col items-center text-left"
        >
          <p className="w-full text-center text-[13px] text-[#8a8a8a]">
            还记得你的分数吗？（可选）
          </p>
          <p className="mt-1 w-full text-center text-[12px] text-[#aaaaaa]">
            不记得的话直接点确认就行
          </p>

          <div className="mt-5 w-full space-y-4">
            {dimensionSliders.map((item) => (
              <ScoreSliderRow
                key={item.key}
                left={item.left}
                right={item.right}
                gradient={item.gradient}
                value={draftScores[item.key]}
                onChange={(value) => updateScore(item.key, value)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={confirmScores}
            className="mt-6 rounded-lg bg-[#1a1a1a] px-8 py-3.5 text-[14px] font-medium leading-none text-white transition-opacity hover:opacity-85"
          >
            确认 →
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType(null);
              setDraftScores(null);
            }}
            className="mt-3 text-[13px] text-[#8a8a8a] underline-offset-4 transition-colors hover:text-[#1a1a1a] hover:underline"
          >
            ← 重新选择
          </button>
        </div>
      ) : showExistingPanel ? (
        <div ref={panelRef} className="mt-6 flex w-full flex-col items-center">
          <p className="text-[13px] text-[#8a8a8a]">选择你的类型</p>

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="输入名称搜索，如：露、Dew、sRdc"
            className="mt-3 w-full max-w-[280px] rounded-lg border border-[#e8e8e4] bg-white px-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none focus:border-[#8a8a8a]"
          />

          {searchQuery.trim() ? (
            searchResults.length > 0 ? (
              <ul className="mt-3 w-full max-w-[280px] text-left">
                {searchResults.map((type) => (
                  <li key={type.code}>
                    <button
                      type="button"
                      onClick={() => beginScoreConfirm(type)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-[#f0f0ec]"
                    >
                      <span
                        className="h-6 w-6 shrink-0 rounded-full"
                        style={{ backgroundColor: type.hex }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] text-[#1a1a1a]">
                          {type.nameZh}
                        </span>
                        <span className="mt-0.5 block font-serif-display text-[13px] italic text-[#8a8a8a]">
                          {type.nameEn}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[13px] text-[#8a8a8a]">没有找到匹配的类型</p>
            )
          ) : null}

          <button
            type="button"
            onClick={closeExistingPanel}
            className="mt-4 inline-flex min-h-11 items-center text-[13px] text-[#8a8a8a] underline-offset-4 transition-colors hover:text-[#1a1a1a] hover:underline"
          >
            收起
          </button>
        </div>
      ) : null}
    </main>
  );
}

function ScoreSliderRow({
  left,
  right,
  gradient,
  value,
  onChange,
}: {
  left: string;
  right: string;
  gradient: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-[20px_1fr_20px_40px] items-center gap-2">
      <span className="text-[14px] font-medium text-[#1a1a1a]">{left}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="score-slider w-full"
        style={{ background: gradient }}
        aria-label={`${left} 到 ${right} 维度分数`}
      />
      <span className="text-right text-[14px] font-medium text-[#1a1a1a]">{right}</span>
      <span className="text-right text-[14px] text-[#8a8a8a]">{value}%</span>
    </div>
  );
}
