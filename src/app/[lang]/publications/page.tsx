import type { Lang } from "@/lib/types";
import { getPublications, getPatents } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { PublicationItem } from "@/components/PublicationItem";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).pubs;
  return pageMetadata({ lang: l, path: "/publications", title: t.title, description: t.subtitle });
}

export default async function PublicationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).pubs;
  const pubs = getPublications();
  const patents = getPatents();

  // 연도별 그룹 (이미 연도 내림차순 정렬됨)
  const years = Array.from(new Set(pubs.map((p) => p.year))).sort((a, b) => b - a);

  return (
    <div>
      <PageHeader title={t.title} />
      <div className="mx-auto max-w-6xl px-6 pb-16">
        {years.map((year) => (
          <section key={year} className="mb-12 last:mb-0">
            <h2 className="text-sm font-bold uppercase tracking-widest tabular-nums">
              {year || "—"}
            </h2>
            <ul className="mt-4">
              {pubs
                .filter((p) => p.year === year)
                .map((p) => (
                  <PublicationItem key={p.key} pub={p} lang={l} />
                ))}
            </ul>
          </section>
        ))}

        {/* 특허 */}
        {patents.length > 0 && (
          <section className="mt-14">
            <h2 className="flex items-baseline gap-2 text-sm font-bold uppercase tracking-widest">
              {t.patents}
              <span className="font-normal normal-case tracking-normal text-muted">
                {t.patentCount(patents.length)}
              </span>
            </h2>
            <ul className="mt-4">
              {patents.map((p) => (
                <li key={p.number} className="py-3">
                  <h3 className="leading-snug">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    <span className="tabular-nums">{p.year}</span>
                    {p.inventors.length > 0 && ` · ${p.inventors.join(", ")}`}
                    {p.number && (
                      <span className="tabular-nums">
                        {" "}
                        · {t.patentNo} {p.number}
                      </span>
                    )}
                    {p.country && ` · ${p.country}`}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
