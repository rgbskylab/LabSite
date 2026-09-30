import type { Lang } from "@/lib/types";
import { getSite } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).contact;
  return pageMetadata({ lang: l, path: "/contact", title: t.title, description: t.subtitle });
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).contact;
  const site = getSite();
  const c = site.contact;

  return (
    <div>
      <PageHeader title={t.title} />
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <dl className="space-y-5">
          {c.email && (
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
              <dt className="w-24 shrink-0 text-muted">{t.email}</dt>
              <dd>
                <a href={`mailto:${c.email}`} className="underline underline-offset-2">
                  {c.email}
                </a>
              </dd>
            </div>
          )}
          {c.address && (
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
              <dt className="w-24 shrink-0 text-muted">{t.address}</dt>
              <dd className="leading-relaxed">{c.address[l]}</dd>
            </div>
          )}
        </dl>

        <section className="mt-14">
          <h2 className="font-bold">{t.join}</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted">{t.joinDesc}</p>
          {c.email && (
            <p className="mt-3">
              <a href={`mailto:${c.email}`} className="underline underline-offset-2">
                {c.email}
              </a>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
