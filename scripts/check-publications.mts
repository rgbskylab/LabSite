/**
 * data/publications.bib 의 논문이 실제로 존재하는지 Crossref 로 대조합니다.
 *   node --experimental-strip-types scripts/check-publications.mts
 *   FIX=1 ... → 확실히 일치하는 항목의 DOI 를 bib 파일에 채워 넣습니다.
 *
 * DOI 가 있으면 DOI 로, 없으면 제목으로 검색해 제목·연도·저널·저자를 비교합니다.
 * 제목 유사도 0.8 이상이고 저자에 Youm 이 있어야 "일치"로 인정합니다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseBibtex } from "../src/lib/bibtex.ts";

const BIB = "data/publications.bib";
const MAILTO = "skylab@dongguk.edu"; // Crossref polite pool
const pubs = parseBibtex(readFileSync(BIB, "utf8"));

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** 두 제목의 단어 자카드 유사도 */
function similarity(a: string, b: string) {
  const A = new Set(norm(a).split(" "));
  const B = new Set(norm(b).split(" "));
  const inter = [...A].filter((w) => B.has(w)).length;
  return inter / new Set([...A, ...B]).size;
}

interface Work {
  DOI?: string;
  title?: string[];
  issued?: { "date-parts": number[][] };
  "container-title"?: string[];
  author?: { family?: string }[];
}

async function crossref<T>(url: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": `skylab-site-check (mailto:${MAILTO})` },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

const info = (w: Work) => ({
  title: w.title?.[0] ?? "",
  year: w.issued?.["date-parts"]?.[0]?.[0] ?? 0,
  journal: w["container-title"]?.[0] ?? "",
  authors: (w.author ?? []).map((a) => (a.family ?? "").toLowerCase()),
  doi: w.DOI ?? "",
});

const results: { key: string; label: string; detail: string; doi?: string }[] = [];

for (const p of pubs) {
  if (p.doi) {
    const j = await crossref<{ message: Work }>(
      `https://api.crossref.org/works/${encodeURIComponent(p.doi)}`,
    );
    if (!j) {
      results.push({ key: p.key, label: "DOI-확인불가", detail: `${p.doi} (Crossref 미등록)` });
    } else {
      const f = info(j.message);
      const sim = similarity(p.title, f.title);
      results.push({
        key: p.key,
        label: sim >= 0.8 ? "확인" : "제목차이",
        detail: sim >= 0.8 ? `${f.year} ${f.journal}` : `→ "${f.title}"`,
      });
    }
    await new Promise((r) => setTimeout(r, 120));
    continue;
  }

  const j = await crossref<{ message: { items: Work[] } }>(
    `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(p.title)}&rows=5&select=title,issued,container-title,author,DOI`,
  );
  const candidates = (j?.message.items ?? []).map(info);
  const best = candidates
    .map((c) => ({ c, sim: similarity(p.title, c.title) }))
    .sort((a, b) => b.sim - a.sim)[0];

  if (!best || best.sim < 0.8 || !best.c.authors.some((a) => a.includes("youm"))) {
    results.push({
      key: p.key,
      label: "미확인",
      detail: `${p.year} ${p.venue} — Crossref 최고 후보 ${best ? best.sim.toFixed(2) : "없음"}`,
    });
  } else {
    const notes: string[] = [];
    if (best.c.year && Math.abs(best.c.year - p.year) > 0) notes.push(`연도 ${p.year}↔${best.c.year}`);
    if (best.c.journal && similarity(p.venue, best.c.journal) < 0.5)
      notes.push(`저널 "${p.venue}"↔"${best.c.journal}"`);
    results.push({
      key: p.key,
      label: notes.length ? "확인(차이있음)" : "확인",
      detail: `${best.c.doi}${notes.length ? " · " + notes.join(" · ") : ""}`,
      doi: best.c.doi,
    });
  }
  await new Promise((r) => setTimeout(r, 120));
}

const by = (label: string) => results.filter((r) => r.label.startsWith(label)).length;
console.log(
  `\n총 ${results.length}편 · 확인 ${by("확인")} · 미확인 ${by("미확인")} · 제목차이 ${by("제목차이")} · DOI확인불가 ${by("DOI-확인불가")}\n`,
);
for (const r of results) {
  if (r.label === "확인") continue;
  console.log(`[${r.label}] ${r.key}\n    ${r.detail}`);
}

const fillable = results.filter((r) => r.doi);
console.log(`\nbib 에 채워 넣을 수 있는 DOI: ${fillable.length}개`);

if (process.env.FIX) {
  let text = readFileSync(BIB, "utf8");
  let added = 0;
  for (const r of fillable) {
    // 해당 엔트리 블록에서 마지막 필드 뒤에 doi 한 줄 추가
    const re = new RegExp(`(@\\w+\\{${r.key},[\\s\\S]*?)(\\n\\})`);
    const m = text.match(re);
    if (!m || /doi\s*=/.test(m[1])) continue;
    text = text.replace(re, `$1,\n  doi     = {${r.doi}}$2`);
    added++;
  }
  writeFileSync(BIB, text);
  console.log(`bib 갱신: DOI ${added}개 추가`);
}
