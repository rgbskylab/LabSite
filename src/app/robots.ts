import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// 정적 export(output: "export")에서는 빌드 때 한 번 생성해 파일로 저장하도록 명시해야 함
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
