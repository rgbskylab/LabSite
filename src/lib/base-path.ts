/** next.config.ts 의 basePath (예: "/LabSite"). 도메인 루트에 배포하면 "" */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * public/ 폴더 파일 경로("/members/a.jpg")에 basePath 를 붙입니다.
 * next/link 는 basePath 를 자동으로 붙이지만 <img src>, <a href>, three.js 로더는 그렇지 않기 때문입니다.
 * 외부 URL("https://…", "//…"), 상대 경로, 이미 basePath 가 붙은 경로는 그대로 둡니다.
 */
export function withBasePath(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}
