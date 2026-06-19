import { genderTypes } from "@/data/types";
import { getResultTypeCodeFromCode } from "@/lib/scoring";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultPageClient } from "./ResultPageClient";

type ResultPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { code } = await params;
  const resultCode = code.toUpperCase();
  const canonicalCode = getResultTypeCodeFromCode(resultCode);
  const type = genderTypes.find((item) => item.code === canonicalCode);

  if (!type) {
    return {
      title: "Gender Prism",
    };
  }

  const title = `${type.nameZh} · ${type.nameEn} — Gender Prism`;
  const imageUrl = `/api/og/${type.code}`;

  return {
    title,
    description: type.tagline,
    openGraph: {
      title,
      description: type.tagline,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: type.tagline,
      images: [imageUrl],
    },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { code } = await params;
  const resultCode = code.toUpperCase();
  const canonicalCode = getResultTypeCodeFromCode(resultCode);
  const type = genderTypes.find((item) => item.code === canonicalCode);

  if (!type) {
    notFound();
  }

  return <ResultPageClient type={type} allTypes={genderTypes} resultCode={resultCode} />;
}
