import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAFAF8",
          color: "#1a1a1a",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: 80,
        }}
      >
        <div
          style={{
            fontFamily: "serif",
            fontStyle: "italic",
            fontSize: 72,
            lineHeight: 1,
            color: "#1a1a1a",
          }}
        >
          Gender Prism
        </div>
        <div
          style={{
            marginTop: 28,
            maxWidth: 760,
            fontSize: 28,
            lineHeight: 1.5,
            color: "#8a8a8a",
          }}
        >
          你和性别之间，是什么关系？
        </div>
        <div
          style={{
            marginTop: 24,
            width: 180,
            height: 1,
            backgroundColor: "#e8e8e4",
          }}
        />
        <div
          style={{
            marginTop: 24,
            maxWidth: 760,
            fontSize: 22,
            lineHeight: 1.6,
            color: "#8a8a8a",
          }}
        >
          四个维度，十六种类型。你是如何&apos;做&apos;你的性别的？
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
