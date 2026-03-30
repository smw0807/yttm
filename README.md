# YouTube Timeline Memo

유튜브 영상을 시청하면서 특정 시점에 메모를 남기고, 저장된 메모를 클릭해 해당 장면으로 바로 이동할 수 있는 웹 서비스입니다.

> "유튜브 강의 보다가 중요한 부분, 링크 하나로 바로 돌아가기"

## 주요 기능

- **영상 등록** — YouTube URL 입력 시 제목, 썸네일, 길이 자동 파싱
- **타임스탬프 메모** — 영상 재생 중 현재 시각을 자동으로 찍고 메모 저장
- **타임라인 점프** — 저장된 메모 클릭 시 해당 시점으로 즉시 이동
- **메모 검색** — 메모 내용 키워드로 실시간 필터링
- **컬렉션** — 영상을 주제별 폴더로 묶어서 관리
- **공유 링크** — 타임라인이 담긴 페이지를 링크 하나로 공유 (로그인 불필요)
- **Google 로그인** — Firebase Auth를 통한 Google OAuth 인증

## 스크린샷

| 영상 뷰어 | 대시보드 |
|-----------|----------|
| 좌우 분할: 플레이어(60%) + 타임라인 메모(40%) | 최근 영상 목록 + 컬렉션 목록 |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Auth | Firebase Auth (Google OAuth) |
| Database | Firestore (Firebase) |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI) |
| 배포 | Vercel |
| 외부 API | YouTube Data API v3 |

## 아키텍처

별도 백엔드 서버 없이 **Next.js + Firebase** 단일 스택으로 구성합니다.

```
[ 브라우저 ]
     │
     ▼
[ Next.js (Vercel) ]
├── App Router (Server Components + Client Components)
├── /api/youtube   ← YouTube Data API 호출 (API Key 서버에서만 사용)
├── /api/share     ← shareToken 생성/폐기
└── /api/auth      ← Firebase Admin SDK 세션 쿠키 발급
     │
     ▼
[ Firebase ]              [ YouTube Data API ]
├── Auth (Google OAuth)
└── Firestore
```

**인증 방식:** Firebase Admin SDK 세션 쿠키 (`__session`, httpOnly)
- 로그인 → `getIdToken` → `POST /api/auth/session` → 서버 컴포넌트에서 쿠키 검증

## 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 |
| `/login` | Google 로그인 |
| `/dashboard` | 내 영상 목록 + 컬렉션 목록 |
| `/videos` | 영상 목록 (제목 검색 필터) |
| `/videos/:id` | 영상 뷰어 + 타임라인 메모 (핵심 페이지) |
| `/videos/:id/edit` | 메모 수정/삭제 |
| `/collections` | 컬렉션 관리 |
| `/share/:token` | 공유 읽기 전용 (로그인 불필요) |

## 로컬 실행

### 1. 의존성 설치

```bash
yarn install
```

### 2. 환경 변수 설정

`.env.local.example`을 복사해 `.env.local`을 생성하고 값을 입력합니다.

```bash
cp .env.local.example .env.local
```

```env
# Firebase 클라이언트 SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (서비스 계정 JSON을 한 줄로 직렬화)
FIREBASE_ADMIN_SDK=

# YouTube Data API v3 (서버에서만 사용)
YOUTUBE_API_KEY=

# Google AdSense (선택 - 승인 후 입력)
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD=
NEXT_PUBLIC_ADSENSE_SLOT_COLLECTIONS=
NEXT_PUBLIC_ADSENSE_SLOT_SHARE=
```

### 3. Firestore 보안 규칙 배포

Firebase 콘솔 또는 CLI에서 `firestore.rules`를 배포합니다.

### 4. 개발 서버 실행

```bash
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 됩니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── (protected)/          ← 인증 필요 페이지 (layout에서 세션 검증)
│   │   ├── dashboard/
│   │   ├── videos/
│   │   ├── videos/[id]/
│   │   ├── videos/[id]/edit/
│   │   └── collections/
│   ├── api/
│   │   ├── auth/session/     ← 세션 쿠키 발급/삭제
│   │   ├── youtube/          ← YouTube 영상 정보 파싱
│   │   └── share/            ← shareToken 생성/폐기
│   ├── login/
│   ├── share/[token]/        ← 공유 읽기 전용 (OG 태그 포함)
│   └── page.tsx              ← 랜딩 페이지
├── components/
│   ├── ads/                  ← AdBanner (Google AdSense)
│   ├── collections/          ← CollectionCard, AddCollectionDialog 등
│   ├── dashboard/            ← DashboardContent
│   ├── player/               ← VideoViewerClient, MemoList, ShareViewerClient, ShareDialog
│   ├── ui/                   ← shadcn/ui 공통 컴포넌트
│   └── videos/               ← VideoCard, AddVideoDialog, VideosContent
├── lib/
│   ├── firebase/
│   │   ├── config.ts         ← Firebase app + Firestore 초기화 (SSR 안전)
│   │   ├── auth.ts           ← Google 로그인/로그아웃 (클라이언트 전용)
│   │   ├── firestore.ts      ← 클라이언트 CRUD 헬퍼
│   │   ├── admin.ts          ← Firebase Admin SDK + 세션 검증
│   │   └── admin-firestore.ts← 서버 전용 Firestore 쿼리
│   └── youtube/
│       └── index.ts          ← extractYouTubeId, formatTimestamp, parseDuration
└── types/index.ts            ← Video, Memo, Collection, User 타입 정의
```

## DB 스키마 (Firestore)

```
users/{uid}
  - email, displayName, createdAt

videos/{videoId}
  - youtubeId, title, thumbnail, durationSec
  - userId, shareToken (null = 비공개), createdAt

videos/{videoId}/memos/{memoId}
  - timestampSec, content, createdAt

collections/{colId}
  - name, description, videoIds[], userId, createdAt
```

## 빌드

```bash
yarn build
yarn start
```
