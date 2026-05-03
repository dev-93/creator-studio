# creator-studio

이 프로젝트는 YouTube 관련 데이터를 처리하고, Gemini AI를 활용하여 콘텐츠를 생성하며, Notion과 연동하는 파이프라인 애플리케이션입니다. Next.js를 기반으로 구축되었으며, 사용자 친화적인 인터페이스와 강력한 백엔드 기능을 제공합니다.

## 주요 기능

*   **YouTube 데이터 처리**: YouTube 관련 데이터를 효율적으로 수집하고 처리합니다.
*   **Gemini AI 기반 콘텐츠 생성**: Google Gemini AI를 활용하여 다양한 콘텐츠를 생성합니다. (예: 영상 요약, 스크립트 작성 등)
*   **Notion 통합**: 생성된 콘텐츠를 Notion 데이터베이스에 저장하거나 관리할 수 있도록 연동합니다.
*   **반응형 UI**: Next.js와 Tailwind CSS를 사용하여 모든 기기에서 최적화된 사용자 경험을 제공합니다.

## 기술 스택

*   **프레임워크**: Next.js (App Router)
*   **언어**: TypeScript
*   **스타일링**: Tailwind CSS
*   **AI**: Google Gemini API
*   **데이터베이스/CMS**: Notion API
*   **UI/UX**: React, Framer Motion (애니메이션)

## 시작하기

이 프로젝트를 로컬 환경에서 실행하려면 다음 단계를 따르세요.

### 1. 환경 변수 설정

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 환경 변수를 추가합니다.

```
GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
NOTION_TOKEN=YOUR_NOTION_INTEGRATION_TOKEN
NOTION_DATABASE_ID=YOUR_NOTION_DATABASE_ID
```

*   `GOOGLE_GEMINI_API_KEY`: Google Cloud Console에서 발급받은 Gemini API 키.
*   `NOTION_TOKEN`: Notion 통합(Integration) 토큰.
*   `NOTION_DATABASE_ID`: 연동할 Notion 데이터베이스의 ID.

### 2. 의존성 설치

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

[http://localhost:4500](http://localhost:4500) (기본 포트가 3000에서 4500으로 변경되었습니다.) 에서 애플리케이션을 열어볼 수 있습니다. 페이지를 편집하려면 `app/page.tsx` 파일을 수정하세요.

이 프로젝트는 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)를 사용하여 Vercel의 새로운 폰트인 [Geist](https://vercel.com/font)를 자동으로 최적화하고 로드합니다.

## 더 알아보기

Next.js에 대해 더 자세히 알아보려면 다음 자료들을 참고하세요:

*   [Next.js Documentation](https://nextjs.org/docs) - Next.js의 기능 및 API에 대해 알아봅니다.
*   [Learn Next.js](https://nextjs.org/learn) - 인터랙티브 Next.js 튜토리얼.

[Next.js GitHub repository](https://github.com/vercel/next.js)도 확인해보세요 - 여러분의 피드백과 기여를 환영합니다!

## Vercel에 배포하기

Next.js 앱을 배포하는 가장 쉬운 방법은 Next.js 개발자들이 만든 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)을 사용하는 것입니다.

더 자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참조하세요.
