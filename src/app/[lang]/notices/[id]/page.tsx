import Link from "next/link";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/types";
import { getNotices, getNotice } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getNotices()
    .filter((n) => !n.link) // 외부 링크 공지는 상세 페이지 없음
    .map((n) => ({ id: n.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const l = lang as Lang;
  const notice = getNotice(id);
  const t = getDict(l).notices;
  return pageMetadata({
    lang: l,
    path: `/notices/${id}`,
    title: notice?.title[l] ?? t.title,
    description: notice?.summary?.[l] ?? notice?.body?.[l]?.slice(0, 150) ?? t.subtitle,
  });
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const l = lang as Lang;
  const t = getDict(l).notices;
  const notice = getNotice(id);
  if (!notice) notFound();

  const paragraphs = (notice.body?.[l] ?? "").split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link href={`/${l}/notices`} className="text-sm text-muted hover:text-foreground">
        ← {t.back}
      </Link>
      <time className="mt-8 block text-sm tabular-nums text-muted">
        {notice.date}
        {notice.pinned && ` · ${t.pinned}`}
      </time>
      <h1 className="mt-1 text-2xl font-bold leading-snug tracking-tight">{notice.title[l]}</h1>
      <div className="mt-8 space-y-4 leading-relaxed text-foreground/90">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          notice.summary && <p>{notice.summary[l]}</p>
        )}
      </div>
    </article>
  );
}
