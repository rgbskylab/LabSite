import Link from "next/link";
import type { Lang } from "@/lib/types";
import { getNotices } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).notices;
  return pageMetadata({ lang: l, path: "/notices", title: t.title, description: t.subtitle });
}

export default async function NoticesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).notices;
  const notices = getNotices();

  return (
    <div>
      <PageHeader title={t.title} />
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pb-16">
        {notices.length === 0 && <p className="text-muted">{t.empty}</p>}
        <ul>
          {notices.map((n) => {
            const href = n.link ?? `/${l}/notices/${n.id}`;
            const external = Boolean(n.link);
            const Inner = (
              <>
                <time className="text-sm tabular-nums text-muted">
                  {n.date}
                  {n.pinned && ` · ${t.pinned}`}
                </time>
                <h2 className="mt-0.5 font-medium leading-snug">
                  {n.title[l]}
                  {external && " ↗"}
                </h2>
                {n.summary && <p className="mt-1 text-muted">{n.summary[l]}</p>}
              </>
            );
            return (
              <li key={n.id} className="py-4">
                {external ? (
                  <a href={n.link} target="_blank" rel="noreferrer" className="block">
                    {Inner}
                  </a>
                ) : (
                  <Link href={href} className="block">
                    {Inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
