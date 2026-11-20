import type { Lang, Publication } from "@/lib/types";
import { LAB_AUTHORS } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { CopyBibtex } from "./CopyBibtex";

function isLabAuthor(author: string): boolean {
  const family = author.trim().split(/\s+/).pop()?.toLowerCase() ?? "";
  return LAB_AUTHORS.includes(family);
}

/** arXiv ID면 abs URL로, 이미 URL이면 그대로 */
function arxivUrl(v: string): string {
  return /^https?:\/\//.test(v) ? v : `https://arxiv.org/abs/${v}`;
}

/**
 * 논문 항목:
 *   연도 · 게재처
 *   제목 (세리프)
 *   저자 (연구실 저자 강조)
 *   PDF ↗  DOI ↗  BibTeX 복사
 * showYear=false 면 연도를 뺍니다 (연도별로 묶인 논문 페이지용).
 */
export function PublicationItem({
  pub,
  lang,
  showYear = true,
  className = "",
}: {
  pub: Publication;
  lang: Lang;
  showYear?: boolean;
  className?: string;
}) {
  const t = getDict(lang).pubs;
  const primary =
    pub.url ||
    pub.pdf ||
    (pub.arxiv ? arxivUrl(pub.arxiv) : undefined) ||
    (pub.doi ? `https://doi.org/${pub.doi}` : undefined);
  const meta = [showYear && pub.year > 0 ? String(pub.year) : "", pub.venue, pub.award ?? ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <li
      className={`border-t border-border py-6 lg:py-7 ${
        pub.image ? "grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[168px_1fr]" : ""
      } ${className}`}
    >
      {pub.image && (
        <a href={primary} target={primary ? "_blank" : undefined} rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pub.image}
            alt=""
            className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
            loading="lazy"
          />
        </a>
      )}

      <div className="flex min-w-0 flex-col gap-2">
        {meta && <span className="text-[13px] text-muted">{meta}</span>}
        <h3 className="font-serif text-xl leading-[1.4] font-normal lg:text-[23px]">
          {primary ? (
            <a href={primary} target="_blank" rel="noreferrer" className="hover:text-accent">
              {pub.title}
            </a>
          ) : (
            pub.title
          )}
        </h3>

        <p className="text-[13px] leading-relaxed text-muted lg:text-sm">
          {pub.authors.map((a, i) => (
            <span key={i}>
              <span className={isLabAuthor(a) ? "font-semibold text-foreground" : ""}>{a}</span>
              {i < pub.authors.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>

        <p className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1 text-sm">
          {pub.pdf && <Tag href={pub.pdf} label={t.pdf} />}
          {pub.arxiv && <Tag href={arxivUrl(pub.arxiv)} label={t.arxiv} />}
          {pub.url && <Tag href={pub.url} label={t.link} />}
          {pub.code && <Tag href={pub.code} label={t.code} />}
          {pub.doi && <Tag href={`https://doi.org/${pub.doi}`} label={t.doi} />}
          {pub.slides && <Tag href={pub.slides} label={t.slides} />}
          {pub.video && <Tag href={pub.video} label={t.video} />}
          <CopyBibtex bibtex={pub.bibtex} label={t.copyBib} copiedLabel={t.copied} />
        </p>
      </div>
    </li>
  );
}

function Tag({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-accent hover:underline underline-offset-4">
      {label} ↗
    </a>
  );
}
