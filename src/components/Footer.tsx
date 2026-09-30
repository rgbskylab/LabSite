import Link from "next/link";
import type { Lang, SiteConfig } from "@/lib/types";

export function Footer({ lang, site }: { lang: Lang; site: SiteConfig }) {
  const year = 2026; // 빌드시 고정 (원하면 site.yml 로 옮길 수 있음)
  const c = site.contact;
  return (
    <footer className="mt-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium">{site.name[lang]}</p>
          <p className="mt-1 text-sm text-muted">{site.affiliation[lang]}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
          <Link href={`/${lang}/research`} className="hover:text-foreground">
            {lang === "ko" ? "연구" : "Research"}
          </Link>
          <Link href={`/${lang}/photos`} className="hover:text-foreground">
            {lang === "ko" ? "갤러리" : "Photos"}
          </Link>
          <Link href={`/${lang}/contact`} className="hover:text-foreground">
            {lang === "ko" ? "연락처" : "Contact"}
          </Link>
          {c.email && (
            <a href={`mailto:${c.email}`} className="hover:text-foreground">
              {c.email}
            </a>
          )}
          {c.github && (
            <a href={c.github} target="_blank" rel="noreferrer" className="hover:text-foreground">
              GitHub
            </a>
          )}
          {c.scholar && (
            <a href={c.scholar} target="_blank" rel="noreferrer" className="hover:text-foreground">
              Scholar
            </a>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-8 text-xs text-muted">
        © {year} {site.name[lang]}
      </div>
    </footer>
  );
}
