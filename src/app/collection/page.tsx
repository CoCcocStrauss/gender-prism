"use client";

import { getGenderTypeByCode, readFriends, type StoredFriend } from "@/lib/prism-social";
import Link from "next/link";
import { useState } from "react";

function readInitialCollectionState(): {
  myType: string | null;
  friends: StoredFriend[];
} {
  if (typeof window === "undefined") {
    return { myType: null, friends: [] };
  }

  return {
    myType: window.localStorage.getItem("myType"),
    friends: readFriends(),
  };
}

export default function CollectionPage() {
  const [{ myType, friends }] = useState(readInitialCollectionState);

  if (!myType) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center bg-[#FAFAF8] px-6 text-center">
        <p className="text-[16px] text-[#1a1a1a]">你还没有做过测试。</p>
        <Link
          href="/test"
          className="mt-6 rounded-lg bg-[#1a1a1a] px-8 py-3.5 text-[14px] font-medium leading-none text-white transition-opacity hover:opacity-85"
        >
          去做测试 →
        </Link>
      </main>
    );
  }

  const myTypeData = getGenderTypeByCode(myType);

  return (
    <main className="mx-auto max-w-[640px] bg-[#FAFAF8] px-6 py-10 text-[#1a1a1a]">
      <Link
        href={`/result/${myType}`}
        className="text-[14px] text-[#8a8a8a] underline-offset-4 transition-colors hover:text-[#1a1a1a] hover:underline"
      >
        ← 返回
      </Link>

      <div className="mt-12">
        <h1 className="font-serif-display text-[24px] italic leading-none">
          我的棱镜集
        </h1>

        {myTypeData ? (
          <div className="mt-2 flex items-center gap-2 text-[14px] text-[#8a8a8a]">
            <span
              className="inline-block h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: myTypeData.hex }}
              aria-hidden="true"
            />
            <span>{myTypeData.nameZh}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        {friends.length === 0 ? (
          <>
            <p className="text-[16px] text-[#8a8a8a]">还没有收藏任何朋友的棱镜。</p>
            <p className="mt-4 text-[14px] text-[#8a8a8a]">
              把你的结果分享给朋友，扫码即可互相收集。
            </p>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-[#e8e8e4]">
            {friends.map((friend) => {
              const friendType = getGenderTypeByCode(friend.type);

              if (!friendType) {
                return null;
              }

              return (
                <Link
                  key={`${friend.type}-${friend.addedAt}`}
                  href={`/compare?me=${encodeURIComponent(myType)}&friend=${encodeURIComponent(friend.type)}`}
                  className="flex flex-col items-center bg-[#FAFAF8] px-5 py-5 text-center transition-colors hover:bg-[#f0f0ec]"
                >
                  <div
                    className="h-12 w-12 rounded-full"
                    style={{ backgroundColor: friendType.hex }}
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-[16px] text-[#1a1a1a]">{friend.nickname}</p>
                  <p className="mt-1 text-[13px] text-[#8a8a8a]">{friendType.nameZh}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-10 text-center text-[12px] leading-[1.6] text-[#aaaaaa]">
        你的棱镜集保存在当前浏览器中。更换浏览器或清除数据后将无法恢复。
      </p>
    </main>
  );
}
