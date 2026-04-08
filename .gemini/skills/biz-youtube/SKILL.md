---
name: biz-youtube
description: AI Shorts Agent Suite — 유튜브 쇼츠, 인스타 카드뉴스, 스타일 변환 3개 에이전트 기반 콘텐츠 자동화 플랫폼. Gemini AI + FAL AI + Notion 연동.
---

# 🎬 AI Shorts Agent Suite: 콘텐츠 자동화 플랫폼

이 프로젝트는 **AI 에이전트 파이프라인**을 통해 콘텐츠 기획 → 제작 → 마케팅 → 아카이빙을 원스톱으로 자동화하는 플랫폼입니다.

## 🎯 프로젝트 비전 & 수익화 전략

### 타겟 사용자
- 1인 크리에이터, 소규모 마케팅 팀, 인스타/유튜브 운영자
- AI 도구에 익숙하지 않지만 콘텐츠 생산성을 높이고 싶은 사람들

### 수익화 방향
- **SaaS 구독 모델**: 무료(월 5회 생성) / Pro(무제한 생성 + 노션 연동 + 고화질 다운로드)
- **API 크레딧 기반 과금**: Gemini/FAL AI 호출량에 따른 종량제
- **B2B 화이트라벨**: 마케팅 에이전시에 커스텀 브랜딩 제공
- **제휴 마케팅**: 생성된 콘텐츠에 제품 광고 삽입 (스타일 변환 → 제품 브랜딩)

---

## 🤖 에이전트 아키텍처 (3개 독립 에이전트)

### 1. AI Shorts Agent (`/` — 메인 페이지)
유튜브 쇼츠 콘텐츠를 기획부터 마케팅까지 자동 생성하는 4단계 파이프라인.

**에이전트 체인:**
| 순서 | 에이전트 | 역할 | Gemini 프롬프트 |
|------|----------|------|-----------------|
| 1 | 트렌드 분석가 | 주간 트렌드 기반 주제 5개 추천 | `AGENT_PROMPTS.theme` |
| 2 | 시나리오 작가 | 4장면 시각적 스토리보드 생성 | `AGENT_PROMPTS.scenario` |
| 3 | Kling 프롬프트 | 영상 생성 AI용 영어 프롬프트 변환 | `AGENT_PROMPTS.kling` |
| 4 | 마케터 | 제목/해시태그 30개/설명글 생성 | `AGENT_PROMPTS.marketing` |

**콘텐츠 컨셉:** "왜 안돼?" — 3~7세 아이들의 호기심 + 부모 교육 효과를 결합한 B급 감성 교육 쇼츠
**자동화:** GitHub Actions로 매주 월요일 트렌드 데이터 자동 갱신 (`scripts/update-trends.js`)

### 2. Card News Agent (`/card-news`)
인스타그램 카드뉴스 5장을 자동 생성하고 실시간 프리뷰 + 이미지 다운로드를 제공.

**에이전트 체인:**
| 순서 | 에이전트 | 역할 |
|------|----------|------|
| 1 | 트렌드 수집가 | AI/테크/이슈 기반 카드뉴스 주제 3개 추천 |
| 2 | 카드 작가 | 5장 카드 텍스트 작성 (표지/정보/인사이트/솔루션/엔딩) |
| 3 | 디자인 디렉터 | CSS 디자인 토큰 생성 (그라데이션, 글로우, 액센트 컬러) |
| 4 | 마케터 | 인스타 캡션 + 해시태그 15개 생성 |

**특징:**
- `CardPreview` 컴포넌트로 실시간 카드 프리뷰 렌더링
- `html-to-image`로 카드별 JPG 다운로드
- 카드 텍스트 인라인 편집 가능
- Gemini Google Search Grounding으로 최신 정보 반영 (`card_writer` 단계)

### 3. Style Transfer Agent (`/style-transfer`)
레퍼런스 이미지의 스타일을 제품 사진에 입히는 AI 브랜딩 도구.

**에이전트 체인:**
| 순서 | 에이전트 | 역할 | 사용 AI |
|------|----------|------|---------|
| 1 | 마케팅 디자인 전문가 | 레퍼런스 스타일 DNA 분석 + 영어 프롬프트 생성 + 마케팅 문구 | Gemini (Vision) |
| 2 | 이미지 생성기 | 스타일 프롬프트 기반 제품 이미지 변환 | FAL AI (nano-banana-2) |

**특징:**
- 레퍼런스 이미지 최대 5장 업로드 (스타일 분석용)
- 레퍼런스 없으면 AI가 자동으로 프리미엄 브랜딩 스타일 추천
- 인스타 마케팅 문구 + 해시태그 자동 생성
- 결과 이미지 고화질 다운로드

---

## 🔧 기술 스택 & 인프라

### 핵심 기술
- **프레임워크:** Next.js (App Router) + TypeScript
- **AI:** Google Gemini 2.5 Flash (메인) — API 키 로테이션 지원
- **이미지 생성:** FAL AI (nano-banana-2/edit)
- **데이터:** Notion API (콘텐츠 아카이브 DB)
- **UI:** Tailwind CSS + Framer Motion + Lucide Icons
- **배포:** Vercel

### Gemini API 안정성 전략 (`src/lib/gemini.ts`)
- **API 키 로테이션:** `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3` — 429 시 자동 전환
- **모델 Fallback:** `gemini-2.5-flash` → `gemini-2.0-flash` 자동 전환
- **Safety Settings:** `BLOCK_ONLY_HIGH`로 제품 이미지 과도한 차단 방지
- **Vision Fallback:** 이미지 분석 차단 시 텍스트 전용 프롬프트로 자동 전환

### Notion 연동 (`src/app/api/notion/route.ts`)
- **채널 구분:** `channel` select 필드로 youtube/insta/style 분류
- **페이지 본문:** 시나리오, 프롬프트, 마케팅 정보를 children 블록으로 구조화
- **System Data:** 원본 JSON 데이터를 코드 블록으로 보관 (50KB 초과 시 생략)
- **CRUD:** GET(목록/상세), POST(생성), DELETE(삭제) 지원

### 자동화 파이프라인
- **주간 트렌드 갱신:** GitHub Actions (`weekly-trends.yml`) — 매주 월요일 Gemini로 트렌드 생성 → `data/trends.json` 자동 커밋
- **트렌드 스크립트:** `scripts/update-trends.js` — Gemini 1.5 Flash로 12~15개 키워드 생성

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                    # AI Shorts Agent (메인)
│   ├── card-news/
│   │   ├── page.tsx                # Card News Agent
│   │   └── components/
│   │       └── CardPreview.tsx     # 카드 프리뷰 컴포넌트
│   ├── style-transfer/
│   │   └── page.tsx                # Style Transfer Agent
│   └── api/
│       ├── generate/route.ts       # Gemini 콘텐츠 생성 (Shorts + Card News)
│       ├── style-transfer/route.ts # 스타일 변환 (Gemini Vision + FAL AI)
│       ├── notion/route.ts         # Notion CRUD API
│       └── trends/route.ts         # 트렌드 데이터 조회
├── lib/
│   └── gemini.ts                   # Gemini 클라이언트 (키 로테이션 + 모델 fallback)
data/
└── trends.json                     # 주간 트렌드 데이터 (자동 갱신)
scripts/
└── update-trends.js                # 트렌드 갱신 스크립트
```

---

## 🔑 환경 변수

```env
GEMINI_API_KEY=           # Gemini API 키 (필수)
GEMINI_API_KEY_2=         # Gemini API 키 2 (429 대응용, 선택)
GEMINI_API_KEY_3=         # Gemini API 키 3 (선택)
NOTION_API_KEY=           # Notion Integration 토큰
NOTION_DATABASE_ID=       # Notion DB ID
FAL_KEY=                  # FAL AI 인증 키 (스타일 변환용)
```

---

## 📌 개발 시 주의사항

1. **Gemini 프롬프트 수정 시** `src/app/api/generate/route.ts`의 `AGENT_PROMPTS` 객체를 수정
2. **새 에이전트 추가 시** generate route에 step 추가 + 프론트엔드 페이지 생성
3. **노션 DB 속성 변경 시** `channel` select 옵션과 `상태` status 옵션이 코드와 일치하는지 확인
4. **이미지 payload 주의:** 노션 API는 ~60KB 제한, base64 이미지는 절대 노션에 직접 전송하지 않음
5. **Free Tier 한도:** Gemini Free Tier는 RPM/TPM 제한이 있으므로 API 키 로테이션 활용
