import type { Lang } from "@/lib/types";
import { getGallery } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { Gallery } from "@/components/Gallery";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).photos;
  return pageMetadata({ lang: l, path: "/photos", title: t.title, description: t.subtitle });
}

export default async function PhotosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).photos;
  const photos = getGallery();

  return (
    <div>
      <PageHeader title={t.title} />
      <div className="mx-auto max-w-6xl px-6 pb-16">
        {photos.length === 0 ? (
          <p className="text-muted">{t.empty}</p>
        ) : (
          <Gallery photos={photos} lang={l} />
        )}
      </div>
    </div>
  );
}
