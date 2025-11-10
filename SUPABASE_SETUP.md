# Supabase 설정 가이드

이 프로젝트를 Supabase와 연동하기 위한 설정 가이드입니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택
4. 프로젝트 생성 완료 대기 (약 2분)

## 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 **SQL Editor** 메뉴로 이동
2. `supabase/schema.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣기
3. "Run" 버튼 클릭하여 실행

또는 터미널에서 Supabase CLI를 사용할 수도 있습니다:

```bash
# Supabase CLI 설치 (선택사항)
npm install -g supabase

# 로컬에서 스키마 적용
supabase db push
```

## 3. 환경 변수 설정

1. Supabase 대시보드에서 **Settings** > **API** 메뉴로 이동
2. 다음 정보를 확인:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon/public key** (예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

3. 프로젝트 루트에 `.env.local` 파일 생성:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-secret-key-change-in-production
```

## 4. 의존성 설치

```bash
npm install
```

## 5. 서버 실행

```bash
npm run dev
```

## 6. 관리자 계정 생성

서버가 처음 시작되면 자동으로 관리자 계정이 생성됩니다:
- **사용자명**: `admin`
- **비밀번호**: `admin123`

또는 웹 인터페이스에서 회원가입을 통해 새 사용자를 추가할 수 있습니다.

## 7. Supabase Row Level Security (RLS) 설정 (선택사항)

보안을 강화하려면 RLS를 활성화할 수 있습니다:

```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON boards FOR SELECT USING (true);
CREATE POLICY "Public read access" ON posts FOR SELECT USING (true);

-- 인증된 사용자만 쓰기 가능 (필요시)
CREATE POLICY "Authenticated users can insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can insert" ON posts FOR INSERT WITH CHECK (true);
```

## 문제 해결

### 조인 쿼리 오류

Supabase에서 외래 키 관계를 인식하지 못하는 경우, `lib/posts.ts`의 조인 쿼리를 수정해야 할 수 있습니다:

```typescript
// 방법 1: 외래 키 이름 사용
.select(`
  *,
  users!posts_user_id_fkey(username),
  boards!posts_board_id_fkey(name)
`)

// 방법 2: 별도 쿼리로 조회
const { data: posts } = await supabase.from('posts').select('*');
// 그 다음 users와 boards를 별도로 조회하여 조인
```

### 연결 오류

- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 네트워크 연결 확인

## 데이터 마이그레이션

기존 JSON 파일 데이터를 Supabase로 마이그레이션하려면:

1. `data/users.json`, `data/boards.json`, `data/posts.json` 파일 확인
2. Supabase 대시보드의 **Table Editor**에서 직접 데이터 입력
3. 또는 마이그레이션 스크립트 작성 (선택사항)



