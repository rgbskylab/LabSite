import { ImageResponse } from "next/og";
import { getSite } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";
import { LANGS } from "@/lib/types";

/**
 * 카카오톡·슬랙·트위터 등에 링크를 붙여넣을 때 뜨는 미리보기 카드.
 * 번들에 한글 폰트를 넣지 않으려고 영문 표기를 사용합니다.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SKY LAB";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params; // 카드 내용은 두 언어 공통(영문 표기)입니다
  const site = getSite();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#6b6b6b",
              fontWeight: 700,
            }}
          >
            {site.name.en}
          </div>
          <div style={{ fontSize: 62, fontWeight: 700, color: "#141414", lineHeight: 1.15 }}>
            {site.fullName.en}
          </div>
          <div style={{ fontSize: 32, color: "#6b6b6b", lineHeight: 1.35 }}>{site.tagline.en}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 2, background: "#141414" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#6b6b6b" }}>
            {`${site.affiliation.en}  ·  ${SITE_URL.replace(/^https?:\/\//, "")}`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
