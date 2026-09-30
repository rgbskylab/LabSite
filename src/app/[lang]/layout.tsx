import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDict } from "@/lib/i18n";
import { getMembers, getSite } from "@/lib/data";
import { LANGS, type Lang } from "@/lib/types";
import { SITE_URL, absUrl } from "@/lib/seo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// 폰트는 하나만 씁니다 — 한글·영문 모두 커버하는 Noto Sans KR
const sans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans-var",
  display: "swap",
});

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const site = getSite();
  const l = (lang === "en" ? "en" : "ko") as Lang;
  const languages = Object.fromEntries([
    ...LANGS.map((x) => [x, absUrl(x)]),
    ["x-default", absUrl("ko")],
  ]);
  return {
    title: {
      default: `${site.fullName[l]} · ${site.affiliation[l]}`,
      template: `%s · ${site.name[l]}`,
    },
    description: site.about[l],
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: absUrl(l), languages },
    openGraph: {
      title: site.fullName[l],
      description: site.about[l],
      url: absUrl(l),
      siteName: site.name[l],
      locale: l === "ko" ? "ko_KR" : "en_US",
      type: "website",
    },
  };
}

// 다크모드 깜빡임 방지: 페인트 전에 클래스 설정
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "ko" && lang !== "en") notFound();
  const l = lang as Lang;
  const site = getSite();
  const t = getDict(l);
  const pi = getMembers().find((m) => m.role === "professor");

  // 검색엔진용 구조화 데이터 (연구실 = 조직, 지도교수 = 소속 구성원)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: site.fullName[l],
    alternateName: site.name[l],
    description: site.about[l],
    url: absUrl(l),
    parentOrganization: { "@type": "CollegeOrUniversity", name: site.affiliation[l] },
    ...(site.contact.email ? { email: site.contact.email } : {}),
    ...(site.contact.address ? { address: site.contact.address[l] } : {}),
    ...(pi ? { employee: { "@type": "Person", name: pi.name[l], jobTitle: l === "ko" ? "지도교수" : "Principal Investigator" } } : {}),
  };

  return (
    <html lang={l} className={`${sans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Header lang={l} siteName={site.name[l]} affiliation={site.affiliation[l]} nav={t.nav} />
        <main className="flex-1">{children}</main>
        <Footer lang={l} site={site} />
      </body>
    </html>
  );
}
