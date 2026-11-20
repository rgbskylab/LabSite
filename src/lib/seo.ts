import type { Metadata } from "next";
import type { Lang } from "./types";
import { LANGS } from "./types";
import { BASE_PATH } from "./base-path";

/** 배포 도메인 — 바뀌면 여기만 고치면 sitemap·robots·hreflang 이 모두 따라갑니다. */
export const SITE_ORIGIN = "https://rgbskylab.github.io";

/** 사이트 최상위 주소 (도메인 + 하위 경로, 예: https://rgbskylab.github.io/LabSite) */
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

/** 언어 접두사를 붙인 절대 URL (next.config.ts 의 trailingSlash 에 맞춰 / 로 끝남) */
export function absUrl(lang: Lang, path = ""): string {
  return `${SITE_URL}/${lang}${path}/`;
}

/** 페이지별 메타데이터 + 언어 대체 링크(hreflang) */
export function pageMetadata(opts: {
  lang: Lang;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const { lang, path, title, description } = opts;
  const languages = Object.fromEntries([
    ...LANGS.map((l) => [l, absUrl(l, path)]),
    ["x-default", absUrl("ko", path)],
  ]);
  return {
    title,
    description,
    alternates: { canonical: absUrl(lang, path), languages },
    openGraph: { title, description, url: absUrl(lang, path), type: "website" },
  };
}
