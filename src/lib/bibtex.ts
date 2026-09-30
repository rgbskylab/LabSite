import type { Publication } from "./types";

/**
 * 의존성 없는 경량 BibTeX 파서.
 * 연구실에서 붙여넣는 일반적인 .bib 형식을 대상으로 합니다.
 * 원문 엔트리 텍스트를 보존해 "BibTeX 복사" 기능에 사용합니다.
 */

/** 흔한 LaTeX 표기를 사람이 읽는 텍스트로 정리 */
function cleanLatex(input: string): string {
  let s = input;
  // 자주 쓰이는 액센트: {\'e} {\"o} {\`a} {\^i} {\~n} {\c c} 등
  const accents: Record<string, string> = {
    "\\'a": "á", "\\'e": "é", "\\'i": "í", "\\'o": "ó", "\\'u": "ú",
    '\\"a': "ä", '\\"o': "ö", '\\"u': "ü", '\\"e': "ë",
    "\\`a": "à", "\\`e": "è", "\\^a": "â", "\\^e": "ê", "\\^i": "î", "\\^o": "ô",
    "\\~n": "ñ", "\\~a": "ã", "\\c c": "ç", "\\ss": "ß", "\\o": "ø", "\\aa": "å",
  };
  for (const [k, v] of Object.entries(accents)) {
    s = s.split(`{${k}}`).join(v).split(k).join(v);
  }
  s = s
    .replace(/\\&/g, "&")
    .replace(/\\%/g, "%")
    .replace(/\\_/g, "_")
    .replace(/\\#/g, "#")
    .replace(/~/g, " ")
    .replace(/--/g, "–"); // en-dash
  // 남은 중괄호 제거 (대소문자 보존용 {NeurIPS} → NeurIPS)
  s = s.replace(/[{}]/g, "");
  return s.replace(/\s+/g, " ").trim();
}

/** "Last, First" 또는 "First Last" → "First Last" 로 정규화 */
function normalizeAuthor(raw: string): string {
  const name = raw.trim();
  if (!name) return "";
  if (name.includes(",")) {
    const [last, first] = name.split(",");
    return cleanLatex(`${first?.trim() ?? ""} ${last.trim()}`).trim();
  }
  return cleanLatex(name);
}

function parseAuthors(field: string): string[] {
  return field
    .split(/\s+and\s+/i)
    .map(normalizeAuthor)
    .filter(Boolean);
}

/** 하나의 엔트리 본문(중괄호 안)에서 key=value 필드들을 추출 */
function parseFields(body: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let i = 0;
  const n = body.length;
  while (i < n) {
    // 필드명
    while (i < n && /[\s,]/.test(body[i])) i++;
    let key = "";
    while (i < n && /[A-Za-z0-9_-]/.test(body[i])) key += body[i++];
    while (i < n && /\s/.test(body[i])) i++;
    if (body[i] !== "=") {
      // 필드가 아님 — 다음 콤마로 스킵
      while (i < n && body[i] !== ",") i++;
      continue;
    }
    i++; // '=' 소비
    while (i < n && /\s/.test(body[i])) i++;

    let value = "";
    if (body[i] === "{") {
      // 균형 중괄호: 여는 '{' 다음부터 짝이 맞는 '}' 직전까지 (중첩 유지)
      i++; // 여는 '{' 소비
      let depth = 1;
      while (i < n && depth > 0) {
        const c = body[i];
        if (c === "{") depth++;
        else if (c === "}") {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
        value += c;
        i++;
      }
    } else if (body[i] === '"') {
      i++; // 여는 따옴표
      while (i < n && body[i] !== '"') value += body[i++];
      i++; // 닫는 따옴표
    } else {
      // bare (숫자 등)
      while (i < n && body[i] !== ",") value += body[i++];
    }
    if (key) fields[key.toLowerCase()] = value.trim();
    // 다음 콤마까지
    while (i < n && body[i] !== ",") i++;
    i++;
  }
  return fields;
}

/** 배지용 약어: venueshort 필드 > 괄호 안 약어 "(NeurIPS)" > 앞 단어들 */
function shortVenue(full: string, explicit?: string): string {
  if (explicit) return cleanLatex(explicit);
  const cleaned = cleanLatex(full);
  const paren = cleaned.match(/\(([^)]{2,20})\)/);
  if (paren) return paren[1].trim();
  // "Proceedings of the ..." 같은 접두어 제거
  const stripped = cleaned.replace(/^(proceedings of (the )?|advances in )/i, "");
  // 약어가 없고 길면 앞 3단어까지만 (더 짧게 하려면 venueshort 필드 사용)
  const words = stripped.split(/\s+/);
  return words.length > 3 ? words.slice(0, 3).join(" ") : stripped;
}

export function parseBibtex(input: string): Publication[] {
  // '%' 로 시작하는 전체 줄 주석 제거 (주석 예시 안의 @entry 오파싱 방지)
  const text = input.replace(/^[ \t]*%.*$/gm, "");
  const pubs: Publication[] = [];
  const n = text.length;
  let i = 0;
  while (i < n) {
    if (text[i] !== "@") {
      i++;
      continue;
    }
    const start = i;
    i++; // '@'
    let type = "";
    while (i < n && /[A-Za-z]/.test(text[i])) type += text[i++];
    while (i < n && /\s/.test(text[i])) i++;
    if (text[i] !== "{") continue;
    // 균형 중괄호로 엔트리 전체 범위 확보
    let depth = 0;
    const bodyStart = i;
    do {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      i++;
    } while (i < n && depth > 0);
    const raw = text.slice(start, i);
    const inner = text.slice(bodyStart + 1, i - 1);

    const commaIdx = inner.indexOf(",");
    const key = (commaIdx === -1 ? inner : inner.slice(0, commaIdx)).trim();
    const fieldsBody = commaIdx === -1 ? "" : inner.slice(commaIdx + 1);
    const f = parseFields(fieldsBody);

    const typeLower = type.toLowerCase();
    if (["comment", "preamble", "string"].includes(typeLower)) continue;

    pubs.push({
      key,
      type: typeLower,
      title: f.title ? cleanLatex(f.title) : "(untitled)",
      authors: f.author ? parseAuthors(f.author) : [],
      year: f.year ? parseInt(f.year, 10) || 0 : 0,
      venue: cleanLatex(f.journal || f.booktitle || f.publisher || ""),
      venueShort: shortVenue(f.journal || f.booktitle || f.publisher || "", f.venueshort),
      image: f.image || undefined,
      url: f.url || undefined,
      pdf: f.pdf || undefined,
      code: f.code || f.github || undefined,
      arxiv: f.arxiv || f.eprint || undefined,
      doi: f.doi || undefined,
      slides: f.slides || undefined,
      video: f.video || undefined,
      award: f.award ? cleanLatex(f.award) : undefined,
      bibtex: raw.trim(),
    });
  }
  // 연도 내림차순, 같은 해면 제목순
  pubs.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  return pubs;
}
