# 게시판 웹사이트

로그인 기능이 있는 게시판 웹사이트입니다. Next.js 14와 TypeScript를 사용하여 제작되었습니다.

## 주요 기능

- ✅ 사용자 인증 (회원가입, 로그인, 로그아웃)
- ✅ 10개의 게시판 (공지사항, 자유게시판, 질문과 답변 등)
- ✅ 좌측 사이드바에 게시판 목록 표시
- ✅ 초기 화면에 전체 공지사항 표시
- ✅ 게시글 작성, 수정, 삭제 기능
- ✅ 공지사항 기능
- ✅ 조회수 기능
- ✅ **게시글 검토 워크플로우** (작성 → 검토중 → 승인 후 전체 공개)

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (JSON Web Token), bcryptjs

## 설치 및 실행

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Supabase 프로젝트 (무료 플랜 가능)

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
├── app/
│   ├── api/              # API 라우트
│   │   ├── auth/         # 인증 관련 API
│   │   ├── boards/       # 게시판 API
│   │   └── posts/        # 게시글 API (검토/승인 포함)
│   ├── board/[id]/       # 게시판 페이지
│   ├── post/[id]/        # 게시글 상세 페이지 (승인 버튼 제공)
│   ├── login/            # 로그인/회원가입 페이지
│   └── page.tsx          # 홈 페이지 (공지사항)
├── lib/
│   ├── supabase.ts       # Supabase 클라이언트 및 타입 정의
│   ├── db.ts             # 초기 데이터/관리자 계정 초기화 로직
│   ├── auth.ts           # 인증 관련 함수
│   └── posts.ts          # 게시글/검토 관련 함수
├── supabase/
│   └── schema.sql        # Supabase 테이블 스키마 및 기본 데이터
├── SUPABASE_SETUP.md     # Supabase 연동 가이드
└── package.json
```

## 데이터베이스

Supabase를 통해 PostgreSQL 테이블이 자동으로 생성되며, 다음 구조를 포함합니다:

- `users`
  - `role`: 0=일반 사용자, 1=검토자
  - `region_code`: 4자리 지역 코드 (예: `0001`)
- `boards`: 기본 10개 게시판이 자동 생성됨
- `posts`
  - `status`: 0=검토중, 1=승인됨
  - 작성 시 `status=0`으로 저장되며 검토자 승인 후 `status=1`

스키마 및 초기 데이터는 `supabase/schema.sql`을 실행하여 구성할 수 있습니다.

## 검토 워크플로우

1. 사용자가 게시글을 작성하면 상태가 `검토중`으로 저장되고 작성자 본인에게만 보입니다.
2. 검토자(역할 `role >= 1`)는 게시판/게시글 상세 페이지에서 승인 버튼을 통해 게시글을 승인할 수 있습니다.
3. 승인된 게시글(`status=1`)만 다른 사용자에게 노출됩니다.
4. 작성자가 게시글을 수정하면 다시 `검토중` 상태로 전환됩니다.

## 환경 변수

`.env.local` 파일에 다음 값을 설정해야 합니다:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-secret-key-change-in-production
```

자세한 설정 방법은 `SUPABASE_SETUP.md`를 참고하세요.

## 기본 게시판

1. 공지사항
2. 자유게시판
3. 질문과 답변
4. 정보공유
5. 후기
6. 취미/관심사
7. 구매/판매
8. 모임/모집
9. 사진/영상
10. 기타

## 사용 방법

1. 회원가입: `/login` 페이지에서 새 계정을 만듭니다.
2. 로그인: 사용자명과 비밀번호로 로그인합니다.
3. 게시판 탐색: 좌측 사이드바에서 원하는 게시판을 선택합니다.
4. 글 작성: 로그인 후 "글쓰기" 버튼을 클릭하여 게시글을 작성합니다.
5. 검토: 작성자는 상태를 확인할 수 있으며, 검토자는 게시글을 승인할 수 있습니다.
6. 승인: 승인된 게시글만 전체 사용자에게 공개됩니다.

## 라이선스

MIT

