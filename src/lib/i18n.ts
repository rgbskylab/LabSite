import type { Lang, MemberRole, Degree } from "./types";

/** UI 고정 문구 사전. 새 문구가 필요하면 여기에 ko/en 쌍으로 추가하세요. */
export const dict = {
  ko: {
    nav: { home: "홈", research: "연구", members: "구성원", publications: "논문", projects: "연구과제", notices: "공지사항", photos: "갤러리", alumni: "졸업생", contact: "연락처", join: "합류하기", menu: "메뉴" },
    home: { news: "공지사항", latestPubs: "주요 논문", viewAll: "전체 보기", researchAreas: "연구 분야", recruiting: "신입 대학원생·학부연구생을 모집하고 있습니다", isNew: "NEW", allNotices: "전체 공지", readNotice: "공고 보기", exploreResearch: "연구 둘러보기", researchPage: "연구 페이지", more: "자세히", video: "영상", playVideo: "영상 재생", contactCta: "연락처 보기", pubCount: (n: number) => `학술지 논문 ${n}편` },
    members: { title: "구성원", subtitle: "함께 연구하는 사람들" },
    alumni: { title: "졸업생", subtitle: "연구실을 거쳐 간 사람들", thesis: "학위논문", nowAt: "현재", graduatedIn: "졸업" },
    pubs: { title: "논문", subtitle: "출판 논문 목록", copyBib: "BibTeX 복사", copied: "복사됨!", pdf: "PDF", code: "GitHub", arxiv: "arXiv", slides: "슬라이드", video: "영상", link: "링크", doi: "DOI", all: "전체", count: (n: number) => `${n}편`, patents: "특허", patentCount: (n: number) => `${n}건`, patentNo: "등록번호" },
    projects: { title: "연구과제", subtitle: "정부·민간 연구과제 수행 실적", government: "정부지원 과제", industry: "민간지원 과제", pi: "연구책임자", copi: "공동연구원", count: (n: number) => `${n}건` },
    notices: { title: "공지사항", subtitle: "연구실 소식과 공지", pinned: "고정", readMore: "자세히", back: "목록으로", empty: "등록된 공지가 없습니다." },
    photos: { title: "갤러리", subtitle: "연구실의 순간들", empty: "등록된 사진이 없습니다." },
    contact: { title: "연락처", subtitle: "오시는 길 및 문의", email: "이메일", address: "주소", join: "합류에 관심이 있으신가요?", joinDesc: "함께 연구할 대학원생·인턴을 상시 모집합니다. 이메일로 편하게 연락 주세요." },
    viewer: {
      loading: "3D 모델 불러오는 중…",
      failed: "3D 모델을 불러오지 못했습니다.",
      hint: "드래그로 회전 · 스크롤로 확대",
      autoRotate: "자동 회전",
      wireframe: "와이어프레임",
      reset: "시점 초기화",
      resetBody: "계측치 초기화",
      whr: "허리-엉덩이 비율(WHR)",
      note: "계측치를 바꾸면 메시가 실시간으로 재생성됩니다",
      fields: { height: "키", chest: "가슴둘레", waist: "허리둘레", hip: "엉덩이둘레" },
    },
    footer: { madeWith: "데이터 파일로 관리되는 연구실 홈페이지", lab: "연구실", output: "성과", news: "소식" },
  },
  en: {
    nav: { home: "Home", research: "Research", members: "Members", publications: "Publications", projects: "Projects", notices: "Notices", photos: "Photos", alumni: "Alumni", contact: "Contact", join: "Join us", menu: "Menu" },
    home: { news: "News", latestPubs: "Selected Publications", viewAll: "View all", researchAreas: "Research Areas", recruiting: "We are recruiting graduate & undergraduate researchers", isNew: "NEW", allNotices: "All notices", readNotice: "Read notice", exploreResearch: "Explore our research", researchPage: "Research", more: "Learn more", video: "Video", playVideo: "Play video", contactCta: "Contact us", pubCount: (n: number) => `${n} journal articles` },
    members: { title: "Members", subtitle: "The people we work with" },
    alumni: { title: "Alumni", subtitle: "Those who passed through the lab", thesis: "Thesis", nowAt: "Now", graduatedIn: "Graduated" },
    pubs: { title: "Publications", subtitle: "List of published papers", copyBib: "Copy BibTeX", copied: "Copied!", pdf: "PDF", code: "GitHub", arxiv: "arXiv", slides: "Slides", video: "Video", link: "Link", doi: "DOI", all: "All", count: (n: number) => `${n} papers`, patents: "Patents", patentCount: (n: number) => `${n} patents`, patentNo: "Reg. No." },
    projects: { title: "Projects", subtitle: "Government and industry research grants", government: "Government-Funded", industry: "Industry-Funded", pi: "PI", copi: "Co-PI", count: (n: number) => `${n} projects` },
    notices: { title: "Notices", subtitle: "Lab news and announcements", pinned: "Pinned", readMore: "Read more", back: "Back to list", empty: "No notices yet." },
    photos: { title: "Photos", subtitle: "Moments from the lab", empty: "No photos yet." },
    contact: { title: "Contact", subtitle: "How to reach and find us", email: "Email", address: "Address", join: "Interested in joining?", joinDesc: "We recruit graduate students and interns year-round. Feel free to reach out by email." },
    viewer: {
      loading: "Loading 3D model…",
      failed: "Failed to load the 3D model.",
      hint: "Drag to rotate · scroll to zoom",
      autoRotate: "Auto-rotate",
      wireframe: "Wireframe",
      reset: "Reset view",
      resetBody: "Reset measurements",
      whr: "Waist-to-hip ratio (WHR)",
      note: "The mesh is regenerated live as measurements change",
      fields: { height: "Height", chest: "Chest", waist: "Waist", hip: "Hip" },
    },
    footer: { madeWith: "A lab website managed entirely from data files", lab: "Lab", output: "Output", news: "News" },
  },
} as const;

export type Dict = (typeof dict)[Lang];

export function getDict(lang: Lang): Dict {
  return dict[lang];
}

/** 멤버 역할의 표시 라벨 및 정렬 순서 */
export const ROLE_ORDER: MemberRole[] = ["professor", "postdoc", "phd", "ms", "undergrad", "intern", "staff"];

export const ROLE_LABEL: Record<MemberRole, { ko: string; en: string }> = {
  professor: { ko: "지도교수", en: "Faculty" },
  postdoc: { ko: "박사후연구원", en: "Postdocs" },
  phd: { ko: "박사과정", en: "Ph.D. Students" },
  ms: { ko: "석사과정", en: "M.S. Students" },
  undergrad: { ko: "학부연구생", en: "Undergraduates" },
  intern: { ko: "인턴", en: "Interns" },
  staff: { ko: "연구원·스태프", en: "Staff" },
};

export const DEGREE_LABEL: Record<Degree, { ko: string; en: string }> = {
  phd: { ko: "박사", en: "Ph.D." },
  ms: { ko: "석사", en: "M.S." },
  postdoc: { ko: "박사후연구원", en: "Postdoc" },
  undergrad: { ko: "학사", en: "B.S." },
};

export function isLang(v: string): v is Lang {
  return v === "ko" || v === "en";
}
