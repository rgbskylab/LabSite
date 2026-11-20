import Link from "next/link";
import type { Lang, Notice } from "@/lib/types";
import { getSite, getPublications, getNotices } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { PublicationItem } from "@/components/PublicationItem";
import { HomeVideo } from "@/components/HomeVideo";

/** 홈·각 섹션이 같이 쓰는 가로 폭 */
const CONTAINER = "mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12";
const H2 = "m-0 font-serif font-normal tracking-[-0.02em]";

/**
 * 홈 순서: 공지사항 → 소개 + 영상 → 연구 분야 → 주요 논문 → 합류 안내
 */
export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const site = getSite();
  const t = getDict(l);
  const allPubs = getPublications();
  const pubs = allPubs.slice(0, 5);
  const articleCount = allPubs.filter((p) => p.type === "article").length;
  const notices = getNotices();
  const [featured, ...restNotices] = notices;
  const headline = site.headline?.[l];
  const email = site.contact.email;

  return (
    <div className="pb-8">
      {/* 1. 공지사항 */}
      {featured && (
        <section aria-labelledby="home-notices" className={`${CONTAINER} flex flex-col gap-4 pt-10 lg:gap-6 lg:pt-16`}>
          <div className="rise rise-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-1 sm:px-0">
            <h2 id="home-notices" className={`${H2} text-[30px] lg:text-[40px]`}>
              {t.home.news}
            </h2>
            <Link href={`/${l}/notices`} className="go py-3 text-sm font-semibold text-accent lg:text-[15px]">
              {t.home.allNotices} <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
          <FeaturedNotice notice={featured} lang={l} pinnedLabel={t.notices.pinned} cta={t.home.readNotice} />
          {restNotices.length > 0 && (
            <ul className="rise rise-3 border-b border-border">
              {restNotices.slice(0, 3).map((n) => (
                <li key={n.id} className="border-t border-border">
                  <NoticeLink notice={n} lang={l} className="go flex flex-wrap items-baseline gap-x-6 gap-y-1 py-4 hover:text-accent">
                    <time className="w-24 shrink-0 text-sm text-muted tabular-nums">{n.date.replace(/-/g, ".")}</time>
                    <span className="min-w-0 flex-1 font-medium">{n.title[l]}</span>
                    <span className="arrow text-accent" aria-hidden>
                      →
                    </span>
                  </NoticeLink>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 2. 소개 + 영상 */}
      <section
        aria-labelledby="home-intro"
        className={`${CONTAINER} flex flex-col gap-6 lg:gap-10 ${featured ? "pt-[72px] lg:pt-[120px]" : "pt-14 lg:pt-24"}`}
      >
        <div className="flex flex-col gap-5 px-1 sm:px-0 lg:gap-8">
          <div className="rise rise-3 flex flex-col gap-5">
            <p className="m-0 text-[13px] leading-relaxed text-muted lg:text-[15px]">
              {site.affiliation[l]} · {site.fullName[l]}
            </p>
            <h1
              id="home-intro"
              className="m-0 font-serif text-[38px] leading-[1.22] font-normal tracking-[-0.025em] lg:text-[clamp(40px,5.2vw,76px)] lg:leading-[1.16]"
            >
              {headline
                ? headline.split("\n").map((line, i) => (
                    <span key={i}>
                      {i > 0 && <br className="hidden sm:inline" />}
                      {i > 0 && <span className="sm:hidden"> </span>}
                      {line}
                    </span>
                  ))
                : site.fullName[l]}
            </h1>
          </div>
          <div className="rise rise-4 flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
            {site.intro && (
              <p className="m-0 max-w-[34em] flex-[1_1_420px] text-base leading-[1.7] text-pretty text-muted lg:text-[19px]">
                {site.intro[l]}
              </p>
            )}
            <Link
              href={`/${l}/research`}
              className="go hidden min-h-[52px] items-center gap-2 rounded-full bg-foreground px-[26px] text-base font-medium text-background sm:inline-flex"
            >
              {t.home.exploreResearch} <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <HomeVideo
          video={site.video}
          title={site.video?.title?.[l]}
          siteName={site.name[l]}
          labels={{ video: t.home.video, play: t.home.playVideo, fields: t.viewer.fields }}
        />

        <Link
          href={`/${l}/research`}
          className="go flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-foreground text-base font-medium text-background sm:hidden"
        >
          {t.home.exploreResearch} <span className="arrow" aria-hidden>→</span>
        </Link>
      </section>

      {/* 3. 연구 분야 */}
      {site.research.length > 0 && (
        <section aria-labelledby="home-research" className={`${CONTAINER} flex flex-col gap-5 pt-20 lg:gap-10 lg:pt-32`}>
          <div className="reveal flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-1 sm:px-0">
            <h2 id="home-research" className={`${H2} text-[34px] lg:text-[clamp(34px,3.8vw,52px)]`}>
              {t.home.researchAreas}
            </h2>
            <Link href={`/${l}/research`} className="go py-3 text-sm font-semibold text-accent lg:text-[15px]">
              {t.home.researchPage} <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-3 lg:gap-5">
            {site.research.map((r, i) => (
              <li key={i} className="reveal flex">
                <Link
                  href={`/${l}/research#area-${i + 1}`}
                  className="lift go flex w-full flex-col gap-3.5 rounded-3xl bg-surface p-6 lg:min-h-[280px] lg:gap-[18px] lg:rounded-[28px] lg:p-8"
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-tint lg:size-16">
                    <ResearchIcon index={i} />
                  </span>
                  <h3 className="m-0 font-serif text-[23px] leading-[1.35] font-normal tracking-[-0.015em] lg:text-[26px]">
                    {r.title[l]}
                  </h3>
                  {r.description && (
                    <p className="m-0 text-sm leading-[1.7] text-muted lg:text-[15px]">{r.description[l]}</p>
                  )}
                  <span className="mt-auto pt-2 text-[15px] font-semibold text-accent">
                    {t.home.more} <span className="arrow" aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. 주요 논문 */}
      {pubs.length > 0 && (
        <section
          aria-labelledby="home-pubs"
          className={`${CONTAINER} flex flex-col gap-4 pt-20 lg:flex-row lg:flex-wrap lg:gap-x-16 lg:gap-y-8 lg:pt-32`}
        >
          <div className="reveal flex items-end justify-between gap-3 px-1 sm:px-0 lg:flex-[1_1_260px] lg:flex-col lg:items-start lg:justify-start lg:gap-3.5">
            <div className="flex flex-col gap-1.5 lg:gap-3.5">
              <h2 id="home-pubs" className={`${H2} text-[34px] lg:text-[clamp(34px,3.8vw,52px)]`}>
                {t.home.latestPubs}
              </h2>
              {articleCount > 0 && <span className="text-[13px] text-muted lg:text-[15px]">{t.home.pubCount(articleCount)}</span>}
            </div>
            <Link href={`/${l}/publications`} className="go py-3 text-sm font-semibold text-accent lg:py-2 lg:text-[15px]">
              {t.home.viewAll} <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
          <ol className="m-0 min-w-0 list-none border-b border-border p-0 lg:flex-[999_1_640px]">
            {pubs.map((p) => (
              <PublicationItem key={p.key} pub={p} lang={l} className="reveal" />
            ))}
          </ol>
        </section>
      )}

      {/* 5. 합류 안내 */}
      <section className={`${CONTAINER} pt-16 lg:pt-32`}>
        <div className="reveal flex flex-col gap-8 rounded-[28px] bg-band px-6 py-9 text-band-foreground lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-12 lg:rounded-[32px] lg:p-[clamp(40px,6vw,80px)]">
          <div className="flex flex-col gap-[18px] lg:flex-[1_1_420px]">
            <h2 className={`${H2} text-[32px] leading-[1.25] lg:text-[clamp(34px,4vw,56px)] lg:leading-[1.2]`}>{t.contact.join}</h2>
            <p className="m-0 max-w-[30em] text-base leading-[1.7] text-band-muted lg:text-lg">{t.contact.joinDesc}</p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link
              href={`/${l}/contact`}
              className="go flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-band-foreground px-[26px] text-base font-medium text-band"
            >
              {t.home.contactCta} <span className="arrow" aria-hidden>→</span>
            </Link>
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex min-h-[52px] items-center justify-center rounded-full border border-band-border px-[26px] text-[15px] font-medium text-band-foreground hover:bg-white/10 lg:text-base"
              >
                {email}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** 외부 링크가 있는 공지는 새 탭으로, 아니면 상세 페이지로 */
function NoticeLink({
  notice,
  lang,
  className,
  children,
}: {
  notice: Notice;
  lang: Lang;
  className?: string;
  children: React.ReactNode;
}) {
  if (notice.link) {
    return (
      <a href={notice.link} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={`/${lang}/notices/${notice.id}`} className={className}>
      {children}
    </Link>
  );
}

function FeaturedNotice({
  notice: n,
  lang: l,
  pinnedLabel,
  cta,
}: {
  notice: Notice;
  lang: Lang;
  pinnedLabel: string;
  cta: string;
}) {
  return (
    <NoticeLink
      notice={n}
      lang={l}
      className="lift go rise rise-2 flex flex-col gap-3.5 rounded-3xl bg-tint p-6 text-foreground lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-12 lg:rounded-[28px] lg:p-[clamp(28px,4vw,48px)]"
    >
      <div className="flex min-w-0 flex-col gap-3.5 lg:flex-[1_1_520px]">
        <span className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[13px] text-muted lg:text-sm">
          {n.pinned && (
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-bold text-foreground lg:text-[13px]">
              <span aria-hidden className="pulse-soft size-[7px] rounded-full bg-accent" />
              {pinnedLabel}
            </span>
          )}
          <time className="tabular-nums">{n.date.replace(/-/g, ".")}</time>
        </span>
        <h3 className="m-0 font-serif text-[25px] leading-[1.35] font-normal tracking-[-0.015em] text-balance lg:text-[clamp(28px,3vw,40px)] lg:leading-[1.3] lg:tracking-[-0.02em]">
          {n.title[l]}
          {n.link && <span aria-hidden> ↗</span>}
        </h3>
        {n.summary && (
          <p className="m-0 max-w-[46em] text-sm leading-[1.7] text-muted lg:text-base">{n.summary[l]}</p>
        )}
      </div>
      <span className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-full bg-foreground px-[26px] text-[15px] font-medium text-background lg:mt-0 lg:min-h-[52px] lg:text-base">
        {cta} <span className="arrow" aria-hidden>→</span>
      </span>
    </NoticeLink>
  );
}

/** 연구 분야 카드 아이콘 — 순서대로 단면 고리, 자세 골격, 변화 예측 선 */
function ResearchIcon({ index }: { index: number }) {
  const common = {
    width: 34,
    height: 34,
    viewBox: "0 0 40 40",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (index % 3) {
    case 0:
      return (
        <svg {...common}>
          <ellipse cx="20" cy="9" rx="7" ry="2.6" />
          <ellipse cx="20" cy="20" rx="12" ry="4" />
          <ellipse cx="20" cy="31" rx="8.5" ry="3" />
          <path d="M20 4v32" strokeDasharray="2 3" />
        </svg>
      );
    case 1:
      return (
        <svg {...common}>
          <circle cx="20" cy="7" r="3.2" />
          <path d="M20 11v12M20 14l-8 5M20 14l8-3M20 23l-6 12M20 23l7 11" />
          <circle cx="12" cy="19" r="1.4" fill="currentColor" />
          <circle cx="28" cy="11" r="1.4" fill="currentColor" />
          <circle cx="14" cy="35" r="1.4" fill="currentColor" />
          <circle cx="27" cy="34" r="1.4" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 33h32" opacity="0.5" />
          <path d="M5 28l7-6 7 3 7-9" />
          <path d="M26 16l9-8" strokeDasharray="2 3" />
          <circle cx="35" cy="8" r="2.2" />
        </svg>
      );
  }
}
