# SkyLab 연구실 홈페이지

연구실 홈페이지입니다. **코드를 몰라도 `data/` 폴더의 파일만 고치면** 구성원·논문·소식이 사이트에 자동 반영됩니다. 한국어/영어 모두 지원합니다.

---

## 🧑‍🔬 자주 하는 관리 작업 (여기만 보면 됩니다)

모든 콘텐츠는 프로젝트 루트의 **`data/` 폴더** 안에 있습니다.

| 하고 싶은 것 | 고칠 파일 |
|---|---|
| 연구실 이름·소개·연구분야·연락처 바꾸기 | `data/site.yml` |
| 새 구성원 추가 / 정보 수정 | `data/members.yml` |
| **구성원이 졸업 → 졸업생으로 이동** | `data/members.yml` → `data/alumni.yml` |
| 논문 추가 (GitHub·arXiv·PDF 링크 포함) | `data/publications.bib` |
| **공지사항 올리기** | `data/notices.yml` |
| **갤러리 사진 추가** | `data/gallery.yml` + `public/gallery/` |
| 구성원 사진 추가 | `public/members/` 폴더에 이미지 넣기 |

각 파일 맨 위에 한글 설명과 예시가 들어 있으니 형식을 따라 항목만 추가/수정하면 됩니다.

### 1. 새 구성원 추가
`data/members.yml` 에 아래 형식으로 항목 하나를 추가:
```yaml
- id: gildong-hong          # 영문 소문자-하이픈 (고유값)
  name:
    ko: 홍길동
    en: Gildong Hong
  role: phd                 # professor|postdoc|phd|ms|undergrad|intern|staff
  email: gdhong@example.ac.kr
  photo: /members/gildong-hong.jpg   # 없으면 "" (이니셜 아바타 자동)
  interests:
    ko: [머신러닝]
    en: [Machine Learning]
```
개인 링크는 필요한 것만 골라 붙이면 됩니다. **아이디만 적어도 주소가 자동 완성**됩니다:
```yaml
  homepage: https://...
  linkedin: gildong-hong    # → https://www.linkedin.com/in/gildong-hong
  github: gildong           # → https://github.com/gildong
  scholar: XXXXXXXX         # Scholar user 아이디 또는 전체 주소
  links:                    # 그 외 링크는 라벨을 직접 달아서
    - { label: ORCID, url: https://orcid.org/0000-0000-0000-0000 }
    - { label: ResearchGate, url: https://www.researchgate.net/profile/... }
```
졸업생(`data/alumni.yml`)도 같은 필드를 그대로 씁니다.

### 2. 졸업생으로 옮기기 ← 가장 자주 하는 작업
1. `data/members.yml` 에서 그 사람 항목을 **통째로 잘라내기**
2. `data/alumni.yml` 에 붙여넣기
3. 두 필드만 추가:
```yaml
  degree: phd               # 받은 학위: phd|ms|postdoc|undergrad
  graduated: 2026           # 졸업 연도
  now:                      # (선택) 현재 소속
    ko: 삼성전자 책임연구원
    en: Research Engineer, Samsung
```
끝입니다. 졸업생 페이지에 졸업연도 순으로 자동 정렬됩니다.

### 3. 논문 추가
Google Scholar 등에서 논문의 **BibTeX**를 복사해 `data/publications.bib` 에 붙여넣기만 하면 연도별로 자동 정렬·표시됩니다. 아래 추가 필드는 선택입니다:
```bibtex
@inproceedings{key2026,
  title     = {논문 제목},
  author    = {Hong, Gildong and Kim, Chulsoo},
  booktitle = {NeurIPS},
  year      = {2026},
  url   = {링크},     pdf   = {PDF 링크},
  code  = {코드 링크}, doi   = {10.1145/...},
  award = {Best Paper Award}   % 있으면 🏆 배지 강조
}
```
각 논문에는 아래 링크가 자동으로 버튼으로 표시됩니다: `pdf`, `arxiv`, `url`(논문 페이지), `code`(GitHub), `doi`, `slides`, `video`. 예:
```bibtex
  arxiv      = {2601.01234},          % ID만 넣으면 arxiv.org/abs/... 로 연결
  code       = {https://github.com/...},   % 또는 github = {...}
  image      = {/pubs/teaser.png},    % 티저 썸네일 (public/pubs/ 에 저장)
  venueshort = {NeurIPS},             % 배지 약어 (없으면 학회명 괄호에서 자동 추출)
  award      = {Best Paper Award}     % 🏆 배지로 강조
```
> 각 논문은 학회 약어 배지(예: `NeurIPS ’26`)와 함께 표시되며, `image` 를 넣으면 티저 썸네일이 왼쪽에 붙습니다 (국내 top 연구실 스타일).
> 우리 연구실 저자 이름을 **굵게** 강조하려면 `src/lib/data.ts` 의 `LAB_AUTHORS` 목록에 성(family name)을 소문자로 등록하세요.

### 4. 공지사항 올리기
`data/notices.yml` 에 항목 추가. `pinned: true` 는 항상 맨 위 고정, 나머지는 날짜 내림차순. `link` 을 넣으면 외부 링크로 바로 이동하고, 없으면 `body` 로 상세 페이지가 자동 생성됩니다. 홈페이지 "공지사항" 섹션에도 최신 4건이 자동 노출됩니다.

### 5. 갤러리 사진 추가
사진을 `public/gallery/` 에 넣고 `data/gallery.yml` 에 항목 추가:
```yaml
- src: /gallery/workshop.jpg
  date: 2026-06-15          # (선택) 최신순 정렬
  caption: { ko: 여름 워크샵, en: Summer Workshop }
```
갤러리에서 사진을 클릭하면 확대(라이트박스)되고 ←/→ 키로 넘길 수 있습니다.

### 6. 연구 페이지에 3D 모델 붙이기
연구 분야 항목(`data/site.yml` 의 `research:`)에 `model:` 한 줄만 추가하면 그 아래에 3D 뷰어가 붙습니다.

```yaml
  - title: { ko: 3D 인체 계측, en: 3D Anthropometry }
    description: { ko: ..., en: ... }
    model: body                      # 계측치 슬라이더로 변형되는 파라메트릭 인체 데모
    # model: /models/scan-001.glb    # 또는 실제 스캔/복원 결과 파일
    modelCaption:                    # (선택) 뷰어 아래 설명
      ko: 2023년 스캔 데이터
      en: Scan data, 2023
```

- `model: body` — 키·가슴·허리·엉덩이둘레 슬라이더를 움직이면 인체 메시가 실시간으로 다시 생성됩니다(연구실의 3D 인체 계측 주제를 그대로 보여주는 데모). 둘레 오차는 실측 기준 3~5% 입니다.
- **실제 모델 올리기**: `public/models/` 폴더를 만들고 파일을 넣은 뒤 `model: /models/파일명` 으로 지정하세요. `.glb` `.gltf` `.ply` `.obj` `.stl` 을 지원하고, 면이 없는 포인트 클라우드(`.ply`)는 점으로 렌더링됩니다.
- 뷰어는 화면에 들어올 때만 3D 라이브러리를 내려받고(초기 로딩에 영향 없음), 드래그 회전·스크롤 확대·와이어프레임·시점 초기화를 지원합니다. 다크모드와 "움직임 줄이기" 설정도 따릅니다.

---

## 🖥 로컬에서 미리보기 / 배포

```bash
pnpm install      # 최초 1회
pnpm dev          # http://localhost:3000 에서 미리보기
pnpm build        # 배포용 빌드
```

**배포(Vercel):** 이 저장소를 GitHub에 올리고 Vercel에 연결하면 `main` 브랜치에 푸시할 때마다 자동 배포됩니다. 도메인(`skylab.quv.kr`)은 Vercel 프로젝트의 Domains 설정에서 연결하세요. `data/` 파일을 GitHub 웹에서 바로 편집해도 자동 재배포됩니다.

---

## 🎨 디자인·구조 (개발자용)

- **스택**: Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · three.js(3D 뷰어)
- **i18n**: `/ko`, `/en` 경로. UI 문구는 `src/lib/i18n.ts`, 콘텐츠는 `data/*.yml`
- **색/폰트**: 흑백 4색(배경·글자·보조글자·선)과 단일 서체(Noto Sans KR)만 씁니다.
  테마 변경은 `src/app/globals.css` 상단 CSS 변수만 고치면 됩니다 (라이트/다크 자동).
- **레이아웃**: 국내외 연구실 홈페이지 관례를 따릅니다 — 구성원은 3:4 인물 사진 그리드,
  논문은 `제목 / 저자(연구실 저자 굵게) / 게재처 [DOI] [PDF]` 행, 연구과제는 기간 열 + 내용 열,
  홈은 공지 2열 + 연구분야 3열 + 최근 논문. 본문 폭은 1152px, 읽기 문단은 768px.
- **데이터 로딩**: `src/lib/data.ts` (YAML/BibTeX → 타입 객체), 파서는 `src/lib/bibtex.ts`
- **페이지**: `src/app/[lang]/` 아래 home / research / members(+졸업생) / publications(+특허) / projects / notices(+상세) / photos / contact
- **3D**: `src/components/MeshViewer.tsx`(three.js 뷰어) + `src/lib/body-model.ts`(계측치 → 메타볼 인체 필드).
  치수·표면 품질은 `node --experimental-strip-types scripts/check-body.mts` 로 실측할 수 있고,
  `SWEEP=1` 을 붙이면 필드 파라미터를 탐색합니다.
- **SEO**: `src/app/sitemap.ts`, `src/app/robots.ts`, 페이지별 메타데이터(`src/lib/seo.ts`)로
  hreflang·구조화 데이터(JSON-LD)까지 자동 생성됩니다. 도메인이 바뀌면 `src/lib/seo.ts` 의 `SITE_URL` 만 고치세요.
- **데이터 검증 스크립트** (`scripts/`, 실행에 네트워크 필요):
  ```bash
  node --experimental-strip-types scripts/check-publications.mts   # 논문을 Crossref 와 대조 (FIX=1 → DOI 자동 보충)
  node --experimental-strip-types scripts/check-patents.mts        # 등록특허를 Google Patents 와 대조
  node --experimental-strip-types scripts/check-body.mts           # 3D 인체 메시 치수 실측
  ```
  논문·특허를 추가한 뒤 한 번 돌려보면 오타난 제목·연도·DOI를 바로 잡아냅니다.
