import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const nextConfig: NextConfig = {
  // GitHub Pages(정적 호스팅) 배포용: `next build` 시 out/ 폴더에 HTML 파일로 내보냄
  output: "export",
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
