import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const nextConfig: NextConfig = {
  // 홈 디렉토리의 다른 lockfile을 루트로 오인하지 않도록 이 프로젝트를 루트로 고정
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
