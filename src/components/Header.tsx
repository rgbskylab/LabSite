"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/types";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  href: string;
  label: string;
}

export function Header({
  lang,
  siteName,
  affiliation,
  nav,
}: {
  lang: Lang;
  siteName: string;
  affiliation: string;
  nav: {
    home: string;
    research: string;
    members: string;
    publications: string;
    projects: string;
    notices: string;
    photos: string;
    alumni: string;
    contact: string;
  };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 핵심 6개만 상단에 노출 (연구=홈에 포함, 갤러리=푸터, 졸업생=구성원에 통합)
  const items: NavItem[] = [
    { href: `/${lang}`, label: nav.home },
    { href: `/${lang}/members`, label: nav.members },
    { href: `/${lang}/publications`, label: nav.publications },
    { href: `/${lang}/projects`, label: nav.projects },
    { href: `/${lang}/notices`, label: nav.notices },
    { href: `/${lang}/contact`, label: nav.contact },
  ];

  // trailingSlash 설정으로 경로가 "/ko/" 처럼 / 로 끝나므로 비교 전에 끝의 / 를 뗍니다
  const current = pathname.replace(/\/+$/, "") || "/";
  const isActive = (href: string) =>
    href === `/${lang}` ? current === href : current === href || current.startsWith(`${href}/`);

  // 현재 경로에서 언어만 바꾼 대상 경로
  const otherLang: Lang = lang === "ko" ? "en" : "ko";
  const rest = pathname.replace(/^\/(ko|en)/, "") || "";
  const switchHref = `/${otherLang}${rest}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={`/${lang}`} className="leading-tight" onClick={() => setOpen(false)}>
          <span className="block font-bold tracking-tight">{siteName}</span>
          <span className="block text-xs text-muted">{affiliation}</span>
        </Link>

        {/* 데스크톱 네비 */}
        <nav className="hidden items-center gap-5 md:flex">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`text-sm ${
                isActive(it.href) ? "font-medium text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {it.label}
            </Link>
          ))}
          <Link href={switchHref} className="text-sm text-muted hover:text-foreground" aria-label="Switch language">
            {otherLang.toUpperCase()}
          </Link>
          <ThemeToggle />
        </nav>

        {/* 모바일 컨트롤 */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href={switchHref} className="text-sm text-muted" aria-label="Switch language">
            {otherLang.toUpperCase()}
          </Link>
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1 text-muted hover:text-foreground"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <nav className="border-t border-border md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`py-2.5 text-sm ${isActive(it.href) ? "font-medium text-foreground" : "text-muted"}`}
              >
                {it.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
