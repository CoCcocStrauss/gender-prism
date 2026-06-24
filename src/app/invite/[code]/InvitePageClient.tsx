"use client";

import { getGenderTypeByCode } from "@/lib/prism-social";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type InvitePageClientProps = {
  code: string;
};

export function InvitePageClient({ code }: InvitePageClientProps) {
  const router = useRouter();
  const friendType = getGenderTypeByCode(code);
  const myType =
    typeof window !== "undefined" ? window.localStorage.getItem("myType") : null;

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
    <main className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center bg-[#FAFAF8] px-6 text-center">
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
    </main>
  );
}
