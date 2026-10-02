import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["ko", "en"];
const DEFAULT_LOCALE = "ko";

/** 로케일 접두사가 없는 경로를 기본 언어로 리다이렉트 (Next 16 proxy 규칙) */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return;

  // 브라우저 선호 언어로 기본값 결정 (한국어면 ko, 그 외 en, 헤더가 없으면 기본 언어)
  const accept = request.headers.get("accept-language");
  const preferred = !accept
    ? DEFAULT_LOCALE
    : accept.toLowerCase().startsWith("ko")
      ? "ko"
      : "en";

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // _next, api, 정적 파일(확장자 포함)은 제외
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
