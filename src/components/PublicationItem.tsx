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
 * 연구실 홈페이지 표준 논문 항목:
 *   [티저 썸네일] 제목 / 저자(연구실 저자 강조) / 게재처 · 연도 [링크]
 */
export function PublicationItem({ pub, lang }: { pub: Publication; lang: Lang }) {
  const t = getDict(lang).pubs;
  const primary =
    pub.url ||
    pub.pdf ||
    (pub.arxiv ? arxivUrl(pub.arxiv) : undefined) ||
    (pub.doi ? `https://doi.org/${pub.doi}` : undefined);

  return (
    <li
      className={`py-4 ${
        pub.image ? "grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[168px_1fr]" : ""
      }`}
    >
      {pub.image && (
        <a href={primary} target={primary ? "_blank" : undefined} rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pub.image}
            alt=""
            className="aspect-[4/3] w-full border border-border object-cover"
            loading="lazy"
          />
        </a>
      )}

      <div className="min-w-0">
        <h3 className="font-medium leading-snug">
          {primary ? (
            <a href={primary} target="_blank" rel="noreferrer" className="hover:underline underline-offset-2">
              {pub.title}
            </a>
          ) : (
            pub.title
          )}
        </h3>

        <p className="mt-1 text-sm leading-relaxed text-muted">
          {pub.authors.map((a, i) => (
            <span key={i}>
              <span className={isLabAuthor(a) ? "font-medium text-foreground" : ""}>{a}</span>
              {i < pub.authors.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>

        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm text-muted">
          <span>
            {pub.venue}
            {pub.year > 0 && ` ${pub.year}`}
            {pub.award && ` · ${pub.award}`}
          </span>
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

/** 연구실 홈페이지 관례인 [PDF] [Code] 형태의 링크 */
function Tag({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="hover:text-foreground">
      [{label}]
    </a>
  );
}
