"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/types";
import type { Dict } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LogoMark } from "./LogoMark";

interface NavItem {
  href: string;
  label: string;
}

export function Header({ lang, siteName, nav }: { lang: Lang; siteName: string; nav: Dict["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 홈은 로고로 갑니다. 갤러리·졸업생은 푸터/구성원 페이지에서 연결합니다.
  const items: NavItem[] = [
    { href: `/${lang}/research`, label: nav.research },
    { href: `/${lang}/members`, label: nav.members },
    { href: `/${lang}/publications`, label: nav.publications },
    { href: `/${lang}/projects`, label: nav.projects },
    { href: `/${lang}/notices`, label: nav.notices },
    { href: `/${lang}/contact`, label: nav.contact },
  ];

  // trailingSlash 설정으로 경로가 "/ko/" 처럼 / 로 끝나므로 비교 전에 끝의 / 를 뗍니다
  const current = pathname.replace(/\/+$/, "") || "/";
  const isActive = (href: string) => current === href || current.startsWith(`${href}/`);

  // 현재 경로에서 언어만 바꾼 대상 경로
  const otherLang: Lang = lang === "ko" ? "en" : "ko";
  const rest = pathname.replace(/^\/(ko|en)/, "") || "";
  const switchHref = `/${otherLang}${rest}`;
  const joinHref = `/${lang}/contact`;
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 py-2 pr-2 pl-5 sm:px-8 lg:min-h-[72px] lg:px-12">
        <Link href={`/${lang}`} className="flex items-center gap-2.5" onClick={close}>
          <LogoMark />
          <span className="font-serif text-xl font-medium tracking-tight lg:text-[21px]">{siteName}</span>
        </Link>

        {/* 데스크톱 네비 */}
        <nav aria-label={nav.menu} className="hidden items-center gap-x-6 lg:flex">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={isActive(it.href) ? "page" : undefined}
              className={`text-[15px] transition-colors hover:text-accent ${
                isActive(it.href) ? "font-medium text-accent" : "text-foreground"
              }`}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={switchHref}
            lang={otherLang}
            hrefLang={otherLang}
            className="px-2 py-2 text-sm text-muted hover:text-foreground"
            aria-label={otherLang === "en" ? "Switch to English" : "한국어로 보기"}
          >
            {otherLang.toUpperCase()}
          </Link>
          <ThemeToggle />
          <Link
            href={joinHref}
            className="go ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[15px] font-medium text-background"
          >
            {nav.join} <span className="arrow" aria-hidden>→</span>
          </Link>
        </div>

        {/* 모바일 컨트롤 */}
        <div className="flex items-center gap-1 lg:hidden">
          <Link
            href={joinHref}
            onClick={close}
            className="inline-flex min-h-10 items-center rounded-full bg-foreground px-3.5 text-sm font-medium text-background"
          >
            {nav.join}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center text-foreground"
            aria-label={nav.menu}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <nav id="mobile-menu" aria-label={nav.menu} className="border-t border-border lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-5 py-2 sm:px-8">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={close}
                aria-current={isActive(it.href) ? "page" : undefined}
                className={`py-3 text-base ${isActive(it.href) ? "font-medium text-accent" : "text-foreground"}`}
              >
                {it.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <Link
                href={switchHref}
                lang={otherLang}
                hrefLang={otherLang}
                onClick={close}
                className="py-3 text-sm text-muted"
                aria-label={otherLang === "en" ? "Switch to English" : "한국어로 보기"}
              >
                {otherLang === "en" ? "English" : "한국어"}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
