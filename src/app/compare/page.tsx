"use client";

import {
  getCompareCacheKey,
  getDefaultScoresFromTypeCode,
  getGenderTypeByCode,
  isFriendSaved,
  readCompareCache,
  readStoredScores,
  writeCompareCache,
  type StoredFriend,
} from "@/lib/prism-social";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ComparePageContent() {
  const searchParams = useSearchParams();
  const meCode = searchParams.get("me") ?? "";
  const friendCode = searchParams.get("friend") ?? "";
  const meType = getGenderTypeByCode(meCode);
  const friendType = getGenderTypeByCode(friendCode);
  const isValid = Boolean(meCode && friendCode && meType && friendType);
  const cacheKey = isValid ? getCompareCacheKey(meCode, friendCode) : "";

  const [analysisText, setAnalysisText] = useState<string | null>(() => {
    if (!cacheKey || typeof window === "undefined") {
      return null;
    }

    return readCompareCache(cacheKey);
  });
  const [loading, setLoading] = useState(() => {
    if (!isValid) {
      return false;
    }

    if (typeof window === "undefined") {
      return true;
    }

    return !readCompareCache(cacheKey);
  });
  const [saved, setSaved] = useState(() =>
    friendCode && typeof window !== "undefined" ? isFriendSaved(friendCode) : false,
  );
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (!isValid || !loading || !meType || !friendType) {
      return;
    }

    let cancelled = false;

    const loadAnalysis = async () => {
      const typeA = { nameZh: meType.nameZh, code: meType.code };
      const typeB = { nameZh: friendType.nameZh, code: friendType.code };
      const scoresA = readStoredScores() ?? getDefaultScoresFromTypeCode(meCode);
      const scoresB = getDefaultScoresFromTypeCode(friendCode);

      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ typeA, typeB, scoresA, scoresB }),
        });

        const { text } = (await response.json()) as { text?: string };
        const analysis =
          text ||
          "两个不同的棱镜折射出不同的光。你们之间的互动模式很难被简单概括，但差异本身就是对话的起点。";

        writeCompareCache(cacheKey, analysis);

        if (!cancelled) {
          setAnalysisText(analysis);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAnalysisText(
            "两个不同的棱镜折射出不同的光。你们之间的互动模式很难被简单概括，但差异本身就是对话的起点。",
          );
          setLoading(false);
        }
      }
    };

    void loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, friendCode, friendType, isValid, loading, meCode, meType]);

  const saveFriend = () => {
    if (!friendType || saved) {
      return;
    }

    const friends = JSON.parse(
      window.localStorage.getItem("friends") || "[]",
    ) as StoredFriend[];

    friends.push({
      type: friendCode,
      nickname: nickname.trim() || friendType.nameZh,
      addedAt: new Date().toISOString(),
    });

    window.localStorage.setItem("friends", JSON.stringify(friends));
    setSaved(true);
    setShowSaveForm(false);
  };

  if (!isValid) {
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
    <main className="mx-auto max-w-[640px] bg-[#FAFAF8] px-6 pb-[60px] pt-[60px] text-[#1a1a1a]">
      <div className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          <div
            className="h-20 w-20 rounded-full"
            style={{ backgroundColor: meType!.hex }}
            aria-hidden="true"
          />
          <p className="mt-3 text-[16px]">{meType!.nameZh}</p>
        </div>

        <span className="text-[16px] text-[#8a8a8a]">×</span>

        <div className="flex flex-col items-center">
          <div
            className="h-20 w-20 rounded-full"
            style={{ backgroundColor: friendType!.hex }}
            aria-hidden="true"
          />
          <p className="mt-3 text-[16px]">{friendType!.nameZh}</p>
        </div>
      </div>

      <div className="mt-12">
        {loading ? (
          <div className="text-center">
            <LoadingDots />
            <p className="mt-4 text-[14px] text-[#8a8a8a]">
              正在分析你们之间的互动模式...
            </p>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[16px] leading-[1.8] text-[#1a1a1a]">
            {analysisText}
          </p>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center">
        {saved ? (
          <button
            type="button"
            disabled
            className="rounded-lg bg-[#1a1a1a] px-8 py-3.5 text-[14px] font-medium leading-none text-white opacity-60"
          >
            已收藏 ✓
          </button>
        ) : showSaveForm ? (
          <div className="flex w-full max-w-sm items-center gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="给朋友起个昵称（可选）"
              className="min-w-0 flex-1 rounded-lg border border-[#e8e8e4] bg-white px-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none focus:border-[#8a8a8a]"
            />
            <button
              type="button"
              onClick={saveFriend}
              className="shrink-0 rounded-lg bg-[#1a1a1a] px-4 py-2.5 text-[14px] font-medium leading-none text-white transition-opacity hover:opacity-85"
            >
              确定
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSaveForm(true)}
            className="rounded-lg bg-[#1a1a1a] px-8 py-3.5 text-[14px] font-medium leading-none text-white transition-opacity hover:opacity-85"
          >
            收藏这位朋友
          </button>
        )}

        <Link
          href={`/result/${meCode}`}
          className="mt-4 text-[14px] text-[#8a8a8a] underline-offset-4 transition-colors hover:text-[#1a1a1a] hover:underline"
        >
          查看我的结果 →
        </Link>

        <Link
          href={`/result/${meCode}`}
          className="mt-2 text-[14px] text-[#8a8a8a] underline-offset-4 transition-colors hover:text-[#1a1a1a] hover:underline"
        >
          邀请更多朋友 →
        </Link>
      </div>
    </main>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#8a8a8a]"
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6">
          <p className="text-[14px] text-[#8a8a8a]">加载中...</p>
        </main>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
