import type { Lang, Project, ProjectType } from "@/lib/types";
import { getProjects } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).projects;
  return pageMetadata({ lang: l, path: "/projects", title: t.title, description: t.subtitle });
}

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDict(l).projects;
  const projects = getProjects();

  const groups: { type: ProjectType; label: string; items: Project[] }[] = (
    [
      { type: "government", label: t.government, items: projects.filter((p) => p.type === "government") },
      { type: "industry", label: t.industry, items: projects.filter((p) => p.type === "industry") },
    ] as { type: ProjectType; label: string; items: Project[] }[]
  ).filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader title={t.title} />
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pb-16">
        {groups.map((g) => (
          <section key={g.type} className="mb-14 last:mb-0">
            <h2 className="flex items-baseline gap-2 text-sm font-bold uppercase tracking-widest">
              {g.label}
              <span className="font-normal normal-case tracking-normal text-muted">
                {t.count(g.items.length)}
              </span>
            </h2>
            <ul className="mt-4">
              {g.items.map((p, i) => (
                <li
                  key={i}
                  className="grid grid-cols-1 gap-x-6 gap-y-1 py-3 sm:grid-cols-[136px_1fr]"
                >
                  <p className="text-sm tabular-nums text-muted">{p.period || p.year}</p>
                  <div className="min-w-0">
                    <h3 className="leading-snug">{p.title[l]}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {p.agency[l]}
                      {p.program && ` · ${p.program[l]}`}
                      {` · ${p.role === "pi" ? t.pi : t.copi}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
