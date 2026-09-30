/**
 * data/patents.yml 의 등록특허가 실제로 존재하는지 Google Patents 로 대조합니다.
 *   node --experimental-strip-types scripts/check-patents.mts
 */
import { readFileSync } from "node:fs";
import { load } from "js-yaml";

const patents = (load(readFileSync("data/patents.yml", "utf8")) as {
  number: string; year: number; title: string; inventors?: string[];
}[]) ?? [];

const meta = (html: string, name: string) =>
  [...html.matchAll(new RegExp(`<meta name="${name}" content="([^"]*)"`, "g"))].map((m) => m[1]);

for (const p of patents) {
  const id = `KR${p.number.replace(/-/g, "")}B1`;
  const res = await fetch(`https://patents.google.com/patent/${id}/ko`, {
    headers: { "User-Agent": "Mozilla/5.0 (skylab-site-check)" },
  });
  if (!res.ok) {
    console.log(`[없음] ${p.number} (HTTP ${res.status}) — ${p.title.slice(0, 40)}`);
    continue;
  }
  const html = await res.text();
  const title = meta(html, "DC.title")[0] ?? html.match(/<title>([^<]*)</)?.[1] ?? "";
  const people = meta(html, "DC.contributor");
  const dates = meta(html, "DC.date");
  const grant = dates[dates.length - 1] ?? "";
  const ok =
    people.some((x) => x.includes("염세경")) &&
    Number(grant.slice(0, 4)) === p.year;
  console.log(
    `[${ok ? "확인" : "차이"}] ${p.number} · 등록 ${grant} (yml ${p.year})\n` +
      `    ${title.replace(/\s+/g, " ").slice(0, 78)}\n` +
      `    발명자/출원인: ${people.join(", ").slice(0, 90)}`,
  );
  await new Promise((r) => setTimeout(r, 400));
}
