import { readFileSync } from "fs";
import { join } from "path";
import { load as yamlLoad } from "js-yaml";
import { parseBibtex } from "./bibtex";
import type {
  Member,
  Alumnus,
  Publication,
  SiteConfig,
  Localized,
  LocalizedList,
  Notice,
  Photo,
  Project,
  Patent,
  NamedLink,
} from "./types";

/**
 * 우리 연구실 저자 — 논문 저자 목록에서 이 성(family name)이 나오면
 * 굵게 강조합니다. 소문자로 등록하세요.
 */
export const LAB_AUTHORS = ["youm"];

const DATA_DIR = join(process.cwd(), "data");

function read(file: string): string {
  return readFileSync(join(DATA_DIR, file), "utf8");
}

/**
 * 목록형 YAML 파일을 읽습니다.
 * 항목을 모두 지워 주석만 남은 파일도 "빈 목록"으로 처리합니다
 * (js-yaml 은 이런 파일에서 예외를 던져 빌드가 깨집니다).
 */
function readList(file: string): unknown[] {
  const text = read(file);
  if (!/^\s*[^#\s]/m.test(text)) return []; // 주석·공백뿐
  const data = yamlLoad(text);
  return Array.isArray(data) ? data : [];
}

/**
 * 링크 값 정리 — 전체 URL 이면 그대로, 아이디만 적었으면 서비스 주소를 붙입니다.
 *   linkedin: gildong-hong  →  https://www.linkedin.com/in/gildong-hong
 *   github:   gildong       →  https://github.com/gildong
 */
function link(v: unknown, prefix = ""): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return undefined;
  if (/^(https?:)?\/\//.test(s) || s.startsWith("mailto:")) return s;
  return prefix ? prefix + s.replace(/^\/+/, "") : s;
}

/** 자유 링크 목록: [{ label, url }] */
function namedLinks(v: unknown): NamedLink[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v
    .map((x) => {
      const o = x as Record<string, unknown>;
      const label = String(o.label ?? "").trim();
      const url = link(o.url);
      return label && url ? { label, url } : null;
    })
    .filter(Boolean) as NamedLink[];
  return out.length ? out : undefined;
}

/** 문자열 하나면 ko/en 양쪽에 적용, 객체면 그대로 (누락 언어는 상대 언어로 폴백) */
function loc(v: unknown): Localized {
  if (v == null) return { ko: "", en: "" };
  if (typeof v === "string") return { ko: v, en: v };
  const o = v as Partial<Localized>;
  return { ko: o.ko ?? o.en ?? "", en: o.en ?? o.ko ?? "" };
}

function locList(v: unknown): LocalizedList {
  if (v == null) return { ko: [], en: [] };
  if (Array.isArray(v)) return { ko: v as string[], en: v as string[] };
  const o = v as { ko?: string[]; en?: string[] };
  return { ko: o.ko ?? o.en ?? [], en: o.en ?? o.ko ?? [] };
}

export function getSite(): SiteConfig {
  const raw = yamlLoad(read("site.yml")) as Record<string, unknown>;
  const research = (raw.research as unknown[] | undefined) ?? [];
  const news = (raw.news as unknown[] | undefined) ?? [];
  const contact = (raw.contact as Record<string, unknown>) ?? {};
  return {
    name: loc(raw.name),
    fullName: loc(raw.fullName),
    tagline: loc(raw.tagline),
    affiliation: loc(raw.affiliation),
    about: loc(raw.about),
    research: research.map((r) => {
      const o = r as Record<string, unknown>;
      return {
        title: loc(o.title),
        description: o.description ? loc(o.description) : undefined,
        model: (o.model as string) || undefined,
        modelCaption: o.modelCaption ? loc(o.modelCaption) : undefined,
      };
    }),
    news: news
      .map((nItem) => {
        const o = nItem as Record<string, unknown>;
        return { date: String(o.date ?? ""), text: loc(o.text) };
      })
      .sort((a, b) => b.date.localeCompare(a.date)),
    contact: {
      email: (contact.email as string) || undefined,
      address: contact.address ? loc(contact.address) : undefined,
      github: (contact.github as string) || undefined,
      scholar: (contact.scholar as string) || undefined,
      twitter: (contact.twitter as string) || undefined,
    },
  };
}

export function getMembers(): Member[] {
  const raw = readList("members.yml");
  return raw.map((m) => {
    const o = m as Record<string, unknown>;
    return {
      id: String(o.id),
      name: loc(o.name),
      role: (o.role as Member["role"]) ?? "staff",
      email: (o.email as string) || undefined,
      photo: (o.photo as string) || undefined,
      homepage: link(o.homepage),
      scholar: link(o.scholar, "https://scholar.google.com/citations?user="),
      github: link(o.github, "https://github.com/"),
      linkedin: link(o.linkedin, "https://www.linkedin.com/in/"),
      links: namedLinks(o.links),
      interests: o.interests ? locList(o.interests) : undefined,
      bio: o.bio ? loc(o.bio) : undefined,
      cv: o.cv ? locList(o.cv) : undefined,
      joined: typeof o.joined === "number" ? o.joined : undefined,
    };
  });
}

/** 같은 졸업연도 안에서의 표시 순서 */
const DEGREE_RANK: Record<Alumnus["degree"], number> = {
  postdoc: 0,
  phd: 1,
  ms: 2,
  undergrad: 3,
};

export function getAlumni(): Alumnus[] {
  const raw = readList("alumni.yml");
  return raw
    .map((a) => {
      const o = a as Record<string, unknown>;
      return {
        id: String(o.id),
        name: loc(o.name),
        degree: (o.degree as Alumnus["degree"]) ?? "ms",
        graduated: typeof o.graduated === "number" ? o.graduated : 0,
        thesis: o.thesis ? loc(o.thesis) : undefined,
        now: o.now ? loc(o.now) : undefined,
        photo: (o.photo as string) || undefined,
        homepage: link(o.homepage),
        scholar: link(o.scholar, "https://scholar.google.com/citations?user="),
        github: link(o.github, "https://github.com/"),
        linkedin: link(o.linkedin, "https://www.linkedin.com/in/"),
        links: namedLinks(o.links),
      };
    })
    // 졸업 연도 오름차순(오래된 기수부터), 같은 해에서는 학위 순서대로
    .sort((a, b) => a.graduated - b.graduated || DEGREE_RANK[a.degree] - DEGREE_RANK[b.degree]);
}

export function getPublications(): Publication[] {
  return parseBibtex(read("publications.bib"));
}

export function getNotices(): Notice[] {
  const raw = readList("notices.yml");
  return raw
    .map((n) => {
      const o = n as Record<string, unknown>;
      return {
        id: String(o.id),
        date: String(o.date ?? ""),
        pinned: o.pinned === true,
        title: loc(o.title),
        summary: o.summary ? loc(o.summary) : undefined,
        body: o.body ? loc(o.body) : undefined,
        link: (o.link as string) || undefined,
      };
    })
    .sort((a, b) => {
      // 고정 공지 우선, 그 다음 날짜 내림차순
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.date.localeCompare(a.date);
    });
}

export function getNotice(id: string): Notice | undefined {
  return getNotices().find((n) => n.id === id);
}

export function getPatents(): Patent[] {
  const raw = readList("patents.yml");
  return raw
    .map((p) => {
      const o = p as Record<string, unknown>;
      return {
        number: String(o.number ?? ""),
        year: typeof o.year === "number" ? o.year : 0,
        country: String(o.country ?? ""),
        title: String(o.title ?? ""),
        inventors: Array.isArray(o.inventors) ? (o.inventors as string[]) : [],
      };
    })
    .sort((a, b) => b.year - a.year);
}

export function getProjects(): Project[] {
  const raw = readList("projects.yml");
  return raw
    .map((p) => {
      const o = p as Record<string, unknown>;
      return {
        type: (o.type as Project["type"]) ?? "government",
        year: typeof o.year === "number" ? o.year : 0,
        title: loc(o.title),
        agency: loc(o.agency),
        program: o.program ? loc(o.program) : undefined,
        period: (o.period as string) || undefined,
        amount: (o.amount as string) || undefined,
        role: (o.role as Project["role"]) ?? "pi",
      };
    })
    .sort((a, b) => b.year - a.year);
}

export function getGallery(): Photo[] {
  const raw = readList("gallery.yml");
  return raw
    .map((p) => {
      const o = p as Record<string, unknown>;
      return {
        src: String(o.src ?? ""),
        caption: loc(o.caption),
        date: o.date ? String(o.date) : undefined,
      };
    })
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
