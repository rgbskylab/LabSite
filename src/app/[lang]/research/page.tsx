import type { Lang } from "@/lib/types";
import { getSite } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { MeshViewerLazy } from "@/components/MeshViewerLazy";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  return pageMetadata({
    lang: l,
    path: "/research",
    title: getDict(l).nav.research,
    description: getSite().about[l],
  });
}

export default async function ResearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l);
  const site = getSite();

  return (
    <div>
      <PageHeader title={t.nav.research} />
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pb-16">
        {site.research.map((r, i) => (
          <section key={i} id={`area-${i + 1}`} className="mb-16 scroll-mt-24 last:mb-0">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </h2>
            <h3 className="mt-2 text-xl font-bold leading-snug">{r.title[l]}</h3>
            {r.description && (
              <p className="mt-2 max-w-3xl leading-relaxed text-muted">{r.description[l]}</p>
            )}
            {r.model && (
              <figure className="mt-6">
                <MeshViewerLazy src={r.model === "body" ? undefined : r.model} lang={l} />
                {r.modelCaption && (
                  <figcaption className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                    {r.modelCaption[l]}
                  </figcaption>
                )}
              </figure>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
