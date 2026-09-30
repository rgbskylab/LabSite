import Link from "next/link";
import type { Lang } from "@/lib/types";
import { getSite, getPublications, getNotices } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { PublicationItem } from "@/components/PublicationItem";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const site = getSite();
  const t = getDict(l);
  const pubs = getPublications().slice(0, 5);
  const notices = getNotices().slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* 연구실 이름과 소속만 — 홍보 문구 없음 */}
      <section className="py-14">
        <h1 className="text-4xl font-bold tracking-tight">{site.fullName[l]}</h1>
        <p className="mt-2 text-muted">{site.affiliation[l]}</p>
        <p className="mt-5">
          <Link href={`/${l}/contact`} className="underline underline-offset-4">
            {t.home.recruiting}
          </Link>
        </p>
      </section>

      {/* 공지 — 연구실 홈페이지 관례대로 2열 */}
      {notices.length > 0 && (
        <Section title={t.home.news} href={`/${l}/notices`} viewAll={t.home.viewAll}>
          <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {notices.map((n) => {
              const external = Boolean(n.link);
              const inner = (
                <>
                  <span className="hover:underline underline-offset-2">{n.title[l]}</span>
                  {external && " ↗"}
                </>
              );
              return (
                <li key={n.id}>
                  <time className="text-sm tabular-nums text-muted">{n.date.replace(/-/g, ".")}</time>
                  <p className="mt-0.5 font-medium leading-snug">
                    {external ? (
                      <a href={n.link} target="_blank" rel="noreferrer">
                        {inner}
                      </a>
                    ) : (
                      <Link href={`/${l}/notices/${n.id}`}>{inner}</Link>
                    )}
                  </p>
                  {n.summary && (
                    <p className="mt-1 text-sm leading-relaxed text-muted">{n.summary[l]}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* 연구 분야 */}
      {site.research.length > 0 && (
        <Section title={t.home.researchAreas} href={`/${l}/research`} viewAll={t.home.viewAll}>
          <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-3">
            {site.research.map((r, i) => (
              <li key={i}>
                <h3 className="font-medium leading-snug">{r.title[l]}</h3>
                {r.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.description[l]}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 최근 논문 */}
      <Section title={t.home.latestPubs} href={`/${l}/publications`} viewAll={t.home.viewAll}>
        <ul>
          {pubs.map((p) => (
            <PublicationItem key={p.key} pub={p} lang={l} />
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  href,
  viewAll,
  children,
}: {
  title: string;
  href: string;
  viewAll: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
        <Link href={href} className="text-sm text-muted hover:text-foreground">
          {viewAll}
        </Link>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
