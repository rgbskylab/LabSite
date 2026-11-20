import type { Lang, Alumnus, Member, MemberRole, NamedLink } from "@/lib/types";
import { getMembers, getAlumni } from "@/lib/data";
import { getDict, ROLE_ORDER, ROLE_LABEL, DEGREE_LABEL } from "@/lib/i18n";
import { ExternalMark } from "@/components/ExternalMark";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).members;
  return pageMetadata({ lang: l, path: "/members", title: t.title, description: t.subtitle });
}

export default async function MembersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).members;
  const ta = getDict(l).alumni;
  const members = getMembers();
  const alumni = getAlumni();

  const groups = ROLE_ORDER.map((role) => ({
    role,
    people: members.filter((m) => m.role === role),
  })).filter((g) => g.people.length > 0);

  // 졸업 연도 오름차순 — 오래된 기수부터 보여줍니다
  const alumniYears = Array.from(new Set(alumni.map((a) => a.graduated))).sort((a, b) => a - b);

  return (
    <div>
      <PageHeader title={t.title} />
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pb-16">
        {groups.map((g) => (
          <section key={g.role} className="mb-14">
            <h2 className="text-sm font-bold uppercase tracking-widest">
              {ROLE_LABEL[g.role as MemberRole][l]}
            </h2>
            {g.role === "professor" ? (
              // 지도교수는 사진 왼쪽 · 이력 오른쪽으로 크게
              <div className="mt-8 space-y-12">
                {g.people.map((m) => (
                  <ProfessorBlock key={m.id} member={m} lang={l} />
                ))}
              </div>
            ) : (
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
                {g.people.map((m) => (
                  <MemberCard key={m.id} member={m} lang={l} />
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* 졸업생 */}
        {alumni.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest">
              {ta.title}
            </h2>
            {alumniYears.map((year) => (
              <div key={year} className="mt-8">
                <h3 className="text-sm text-muted">
                  {year} {ta.graduatedIn}
                </h3>
                <ul className="mt-4 grid grid-cols-3 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
                  {alumni
                    .filter((a) => a.graduated === year)
                    .map((a) => (
                      <AlumnusCard key={a.id} alumnus={a} lang={l} nowLabel={ta.nowAt} />
                    ))}
                </ul>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

/** 사람마다 붙는 링크 — 기본 항목 + data 의 자유 링크(links:) */
function personLinks(p: {
  email?: string;
  homepage?: string;
  scholar?: string;
  github?: string;
  linkedin?: string;
  links?: NamedLink[];
}) {
  return [
    p.email && { href: `mailto:${p.email}`, label: "Email" },
    p.homepage && { href: p.homepage, label: "Homepage" },
    p.scholar && { href: p.scholar, label: "Scholar" },
    p.github && { href: p.github, label: "GitHub" },
    p.linkedin && { href: p.linkedin, label: "LinkedIn" },
    ...(p.links ?? []).map((x) => ({ href: x.url, label: x.label })),
  ].filter(Boolean) as { href: string; label: string }[];
}

function LinkRow({ links, lang }: { links: { href: string; label: string }[]; lang: Lang }) {
  if (links.length === 0) return null;
  const newTab = getDict(lang).common.newTab;
  return (
    <p className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-sm text-muted">
      {links.map((x) => (
        <a
          key={x.label + x.href}
          href={x.href}
          target={x.href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {x.label}
          {!x.href.startsWith("mailto:") && <ExternalMark label={newTab} arrow={false} />}
        </a>
      ))}
    </p>
  );
}

/** 지도교수 — 왼쪽 사진, 오른쪽에 이력을 크게 */
function ProfessorBlock({ member, lang }: { member: Member; lang: Lang }) {
  const interests = member.interests?.[lang] ?? [];
  const cv = member.cv?.[lang] ?? [];
  const bio = (member.bio?.[lang] ?? "").split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className="grid gap-8 sm:grid-cols-[220px_1fr]">
      <div className="w-40 sm:w-full">
        <Avatar name={member.name} photo={member.photo} lang={lang} />
      </div>

      <div className="min-w-0">
        <h3 className="text-2xl font-bold leading-tight">{member.name[lang]}</h3>

        {bio.length > 0 && (
          <div className="mt-3 space-y-2 leading-relaxed text-muted">
            {bio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {interests.length > 0 && (
          <p className="mt-3 leading-relaxed text-muted">{interests.join(" · ")}</p>
        )}

        {cv.length > 0 && (
          <ul className="mt-4 space-y-1">
            {cv.map((line, i) => (
              <li key={i} className="leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        )}

        <LinkRow links={personLinks(member)} lang={lang} />
      </div>
    </div>
  );
}

function MemberCard({ member, lang }: { member: Member; lang: Lang }) {
  const interests = member.interests?.[lang] ?? [];

  return (
    <li>
      <Avatar name={member.name} photo={member.photo} lang={lang} />
      <p className="mt-2.5 font-medium leading-snug">{member.name[lang]}</p>
      {member.bio && <p className="mt-1 text-sm leading-relaxed text-muted">{member.bio[lang]}</p>}
      {interests.length > 0 && (
        <p className="mt-1 text-sm leading-relaxed text-muted">{interests.join(" · ")}</p>
      )}
      <LinkRow links={personLinks(member)} lang={lang} />
    </li>
  );
}

function AlumnusCard({
  alumnus,
  lang,
  nowLabel,
}: {
  alumnus: Alumnus;
  lang: Lang;
  nowLabel: string;
}) {
  return (
    <li>
      <Avatar name={alumnus.name} photo={alumnus.photo} lang={lang} />
      <p className="mt-2 text-sm font-medium leading-snug">{alumnus.name[lang]}</p>
      <p className="text-sm text-muted">{DEGREE_LABEL[alumnus.degree][lang]}</p>
      {alumnus.now && (
        <p className="text-sm leading-snug text-muted">
          {nowLabel} · {alumnus.now[lang]}
        </p>
      )}
      <LinkRow links={personLinks(alumnus)} lang={lang} />
    </li>
  );
}
