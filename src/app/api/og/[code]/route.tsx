import { genderTypes } from "@/data/types";
import { getTypeQuote, getTypeQuotePreview } from "@/data/typeQuotes";
import { getResultTypeCodeFromCode } from "@/lib/scoring";
import { ImageResponse } from "next/og";

export const runtime = "edge";

type OgRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_request: Request, { params }: OgRouteProps) {
  const { code } = await params;
  const resultCode = code.toUpperCase();
  const canonicalCode = getResultTypeCodeFromCode(resultCode);
  const type = genderTypes.find((item) => item.code === canonicalCode);

  if (!type) {
    return new Response("Not found", { status: 404 });
  }

  const quote = getTypeQuote(type.code);
  const preview = truncate(quote ? getTypeQuotePreview(quote) : type.tagline, 30);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#FAFAF8",
          color: "#1a1a1a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "35%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 240,
              height: 240,
              borderRadius: 999,
              backgroundColor: type.hex,
            }}
          />
        </div>

        <div
          style={{
            width: "65%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: 96,
          }}
        >
          <div
            style={{
              fontSize: 48,
              lineHeight: 1.25,
              fontWeight: 300,
              color: "#1a1a1a",
            }}
          >
            {type.nameZh}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 24,
              lineHeight: 1.25,
              fontStyle: "italic",
              color: "#8a8a8a",
              fontFamily: "serif",
            }}
          >
            {type.nameEn}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 18,
              lineHeight: 1.6,
              color: "#8a8a8a",
            }}
          >
            {preview}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 64,
            bottom: 48,
            fontSize: 14,
            lineHeight: 1,
            color: "#8a8a8a",
          }}
        >
          Gender Prism · genderprism.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}
