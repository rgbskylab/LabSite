export type Lang = "ko" | "en";
export const LANGS: Lang[] = ["ko", "en"];

/** ko/en 두 언어를 담는 텍스트. YAML에서 문자열 하나만 있으면 양쪽에 같이 씁니다. */
export type Localized = { ko: string; en: string };
export type LocalizedList = { ko: string[]; en: string[] };

export type MemberRole =
  | "professor"
  | "postdoc"
  | "phd"
  | "ms"
  | "undergrad"
  | "intern"
  | "staff";

/** 이름표를 직접 붙이는 링크 (ORCID, ResearchGate, 개인 블로그 등) */
export interface NamedLink {
  label: string;
  url: string;
}

export interface Member {
  id: string;
  name: Localized;
  role: MemberRole;
  email?: string;
  photo?: string;
  homepage?: string;
  scholar?: string;
  github?: string;
  linkedin?: string;
  /** 위 항목에 없는 링크는 여기에 라벨과 함께 자유롭게 */
  links?: NamedLink[];
  interests?: LocalizedList;
  bio?: Localized;
  /** 학력·경력 등 이력 줄 목록 (지도교수 카드에서 크게 표시) */
  cv?: LocalizedList;
  joined?: number;
}

export type Degree = "phd" | "ms" | "postdoc" | "undergrad";

export interface Alumnus {
  id: string;
  name: Localized;
  degree: Degree;
  graduated: number;
  thesis?: Localized;
  now?: Localized;
  photo?: string;
  homepage?: string;
  scholar?: string;
  github?: string;
  linkedin?: string;
  links?: NamedLink[];
}

export interface Publication {
  key: string;
  type: string; // article | inproceedings | ...
  title: string;
  authors: string[]; // "Gildong Hong" 형태로 정규화
  year: number;
  venue: string; // journal 또는 booktitle (전체 명칭)
  venueShort: string; // 배지용 약어 (예: NeurIPS). venueshort 필드 또는 괄호 약어에서 추출
  image?: string; // 티저 썸네일 (/pubs/파일명)
  url?: string; // 논문/프로젝트 페이지 링크
  pdf?: string;
  code?: string; // GitHub 등 코드 저장소
  arxiv?: string; // arXiv ID(2401.01234) 또는 전체 URL
  doi?: string;
  slides?: string;
  video?: string;
  award?: string;
  bibtex: string; // 원문(복사 버튼용)
}

export interface Notice {
  id: string;
  date: string; // YYYY-MM-DD
  pinned?: boolean;
  title: Localized;
  summary?: Localized;
  body?: Localized; // 여러 문단은 빈 줄로 구분
  link?: string; // 외부 링크(있으면 상세 대신 바로 이동)
}

export interface Photo {
  src: string; // /gallery/파일명
  caption: Localized;
  date?: string;
}

export interface Patent {
  number: string;
  year: number;
  country: string;
  title: string;
  inventors: string[];
}

export type ProjectType = "government" | "industry";
export type ProjectRole = "pi" | "copi";

export interface Project {
  type: ProjectType;
  year: number; // 시작 연도 (정렬용)
  title: Localized;
  agency: Localized;
  program?: Localized;
  period?: string;
  amount?: string;
  role: ProjectRole;
}

export interface NewsItem {
  date: string;
  text: Localized;
}

export interface ResearchArea {
  title: Localized;
  /** 설명 문단 (선택) — 없으면 제목만 노출합니다. */
  description?: Localized;
  /**
   * 3D 뷰어에 띄울 모델.
   *  - "body"        : 계측치로 생성되는 파라메트릭 인체 데모
   *  - "/models/*.glb|ply|obj|stl" : public/models/ 에 올린 실제 스캔·복원 결과
   */
  model?: string;
  /** 3D 뷰어 아래 캡션 (선택) */
  modelCaption?: Localized;
}

/** 홈 영상. youtube 또는 src 중 하나가 있으면 재생 버튼이 나타납니다. */
export interface HomeVideo {
  youtube?: string; // YouTube 주소 또는 영상 ID
  src?: string; // public/ 의 영상 파일 (/videos/intro.mp4)
  poster?: string; // 썸네일 사진 (없으면 인체 단면 그림)
  title?: Localized;
}

export interface SiteConfig {
  name: Localized;
  fullName: Localized;
  tagline: Localized;
  affiliation: Localized;
  about: Localized;
  /** 홈 큰 제목 (줄바꿈은 넓은 화면에서만 적용) */
  headline?: Localized;
  /** 홈 큰 제목 아래 소개 문장 */
  intro?: Localized;
  video?: HomeVideo;
  research: ResearchArea[];
  news: NewsItem[];
  contact: {
    email?: string;
    address?: Localized;
    github?: string;
    scholar?: string;
    twitter?: string;
  };
}
