import Link from "next/link";
import type { Lang, SiteConfig } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { LogoMark } from "./LogoMark";

export function Footer({ lang, site }: { lang: Lang; site: SiteConfig }) {
  const year = 2026; // 빌드시 고정 (원하면 site.yml 로 옮길 수 있음)
  const c = site.contact;
  const t = getDict(lang);
  const groups: { label: string; links: { href: string; label: string }[] }[] = [
    {
      label: t.footer.lab,
      links: [
        { href: `/${lang}/research`, label: t.nav.research },
        { href: `/${lang}/members`, label: t.nav.members },
        { href: `/${lang}/photos`, label: t.nav.photos },
      ],
    },
    {
      label: t.footer.output,
      links: [
        { href: `/${lang}/publications`, label: t.nav.publications },
        { href: `/${lang}/projects`, label: t.nav.projects },
      ],
    },
    {
      label: t.footer.news,
      links: [
        { href: `/${lang}/notices`, label: t.nav.notices },
        { href: `/${lang}/contact`, label: t.nav.contact },
      ],
    },
  ];
  const external = [
    c.github && { href: c.github, label: "GitHub" },
    c.scholar && { href: c.scholar, label: "Google Scholar" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="mx-auto mt-24 w-full max-w-7xl px-5 pt-16 pb-8 sm:px-8 lg:mt-32 lg:px-12 lg:pt-24 lg:pb-10">
      <div className="flex flex-col gap-10 pb-10 lg:flex-row lg:justify-between lg:gap-14 lg:pb-12">
        <div className="flex flex-col gap-2.5 lg:max-w-md">
          <span className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-serif text-[22px] font-medium">{site.name[lang]}</span>
          </span>
          <span className="text-[15px]">
            {site.fullName[lang]} · {site.affiliation[lang]}
          </span>
          {(c.address || c.email) && (
            <address className="text-sm leading-relaxed text-muted not-italic">
              {c.address && <span className="block">{c.address[lang]}</span>}
              {c.email && (
                <a href={`mailto:${c.email}`} className="text-foreground hover:text-accent">
                  {c.email}
                </a>
              )}
            </address>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 sm:gap-14 lg:flex">
          {groups.map((g) => (
            <nav key={g.label} aria-label={g.label} className="flex flex-col text-[15px] lg:min-w-28">
              <span className="pb-1 text-[13px] font-bold text-muted">{g.label}</span>
              {g.links.map((ln) => (
                <Link key={ln.href} href={ln.href} className="py-2 hover:text-accent">
                  {ln.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-border pt-5 text-[13px] text-muted">
        <span>
          © {year} {site.name[lang]}
        </span>
        {external.length > 0 && (
          <span className="flex gap-4">
            {external.map((x) => (
              <a key={x.href} href={x.href} target="_blank" rel="noreferrer" className="hover:text-foreground">
                {x.label} ↗
              </a>
            ))}
          </span>
        )}
      </div>
    </footer>
  );
}
