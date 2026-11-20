import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 사이트가 열리는 하위 경로. GitHub Pages 는 리포 이름(LabSite) 아래인
// https://rgbskylab.github.io/LabSite/ 에서 열리므로 모든 경로 앞에 /LabSite 를 붙입니다.
// 나중에 도메인 루트(예: 직접 산 도메인)로 옮기면 "" 로 바꾸고 src/lib/seo.ts 의 SITE_ORIGIN 만 고치면 됩니다.
const basePath = "/LabSite";

const nextConfig: NextConfig = {
  // GitHub Pages(정적 호스팅) 배포용: `next build` 시 out/ 폴더에 HTML 파일로 내보냄
  output: "export",
  // next/link·_next 정적 파일에는 자동 적용. <img src> 등 public/ 파일 경로는 src/lib/base-path.ts 에서 붙임
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // /ko/members → /ko/members/index.html 형태로 생성 (정적 호스팅에서 경로가 안정적으로 열리도록)
  trailingSlash: true,
  // Tailscale IP로 접속할 때 개발 서버의 JS/HMR 요청이 차단되지 않도록 허용
  allowedDevOrigins: ["100.66.136.17"],
  // 홈 디렉토리의 다른 lockfile을 루트로 오인하지 않도록 이 프로젝트를 루트로 고정
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
