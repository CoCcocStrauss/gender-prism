import type { Metadata } from "next";
import { HomePageClient } from "./HomePageClient";

export const metadata: Metadata = {
  title: "Gender Prism — 你和性别之间，是什么关系？",
  description:
    "四个维度，十六种类型。你是如何'做'你的性别的？",
  openGraph: {
    title: "Gender Prism — 你和性别之间，是什么关系？",
    description:
      "四个维度，十六种类型。你是如何'做'你的性别的？",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Gender Prism",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gender Prism — 你和性别之间，是什么关系？",
    description:
      "四个维度，十六种类型。你是如何'做'你的性别的？",
    images: ["/api/og"],
  },
};

export default function Home() {
  return <HomePageClient />;
}
