import type { MetadataRoute } from "next";
import { getNotices } from "@/lib/data";
import { absUrl } from "@/lib/seo";
import { LANGS } from "@/lib/types";

// 정적 export(output: "export")에서는 빌드 때 한 번 생성해 파일로 저장하도록 명시해야 함
export const dynamic = "force-static";

/** 검색엔진용 사이트맵 — 페이지가 늘면 PATHS 에 경로만 추가하세요. */
const PATHS = [
  { path: "", priority: 1 },
  { path: "/research", priority: 0.9 },
  { path: "/publications", priority: 0.9 },
  { path: "/members", priority: 0.8 },
  { path: "/projects", priority: 0.7 },
  { path: "/notices", priority: 0.6 },
  { path: "/photos", priority: 0.4 },
  { path: "/contact", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const notices = getNotices();
  const newest = notices[0]?.date;
  const lastModified = newest ? new Date(newest) : new Date();

  const pages = LANGS.flatMap((lang) =>
    PATHS.map(({ path, priority }) => ({
      url: absUrl(lang, path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(LANGS.map((l) => [l, absUrl(l, path)])),
      },
    })),
  );

  const noticePages = LANGS.flatMap((lang) =>
    notices.map((n) => ({
      url: absUrl(lang, `/notices/${n.id}`),
      lastModified: n.date ? new Date(n.date) : lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  );

  return [...pages, ...noticePages];
}
