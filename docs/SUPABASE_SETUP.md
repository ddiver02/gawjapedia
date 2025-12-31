# Supabase 설정 가이드

이 가이드는 GawjaPedia에서 Supabase를 데이터베이스 및 인증 시스템으로 사용하기 위한 설정 방법을 설명합니다.

---

## 📝 개요

Supabase는 다음 기능을 제공합니다:
- **PostgreSQL 데이터베이스**: 사용자 프로필, 평점, 리뷰 저장
- **Authentication**: 이메일/비밀번호 기반 사용자 인증
- **Row Level Security (RLS)**: 데이터 보안 정책

---

## 🔧 설정 단계

### 1단계: Supabase 계정 생성

1. [Supabase](https://supabase.com) 접속
2. **"Start your project"** 클릭
3. GitHub 계정으로 로그인 (권장)
4. 새 조직 생성 (또는 기존 조직 선택)

---

### 2단계: 새 프로젝트 생성

1. Dashboard에서 **"New Project"** 클릭
2. 프로젝트 세부정보 입력:
   - **Name**: `gawjapedia`
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: Korea (Northeast Asia) 선택 (가장 가까운 지역)
   - **Pricing Plan**: Free tier 선택

3. **"Create new project"** 클릭
4. 프로젝트 생성 완료까지 1-2분 대기

![Create Supabase Project](https://via.placeholder.com/800x400?text=Create+Supabase+Project)

---

### 3단계: 데이터베이스 스키마 생성

1. 좌측 메뉴에서 **"SQL Editor"** 선택
2. **"New query"** 클릭
3. 프로젝트의 `supabase/migrations/001_initial_schema.sql` 파일 내용 복사
4. SQL Editor에 붙여넣기
5. **"Run"** 버튼 클릭 (Ctrl/Cmd + Enter)

SQL 실행 성공 시 다음 테이블들이 생성됩니다:
- `profiles` - 사용자 프로필
- `ratings` - 간식 평점 및 리뷰
- `user_preferences` - 사용자 선호도
- `snack_ratings_summary` - 평점 통계 뷰

![SQL Editor](https://via.placeholder.com/800x400?text=Supabase+SQL+Editor)

---

### 4단계: 테이블 확인

1. 좌측 메뉴에서 **"Table Editor"** 선택
2. 다음 테이블들이 보이는지 확인:
   - ✅ `profiles`
   - ✅ `ratings`
   - ✅ `user_preferences`

3. 각 테이블 클릭하여 구조 확인:

**profiles 테이블:**
| Column | Type | Default |
|--------|------|---------|
| id | uuid | - |
| email | text | - |
| username | text | null |
| full_name | text | null |
| avatar_url | text | null |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

**ratings 테이블:**
| Column | Type | Default |
|--------|------|---------|
| id | uuid | gen_random_uuid() |
| user_id | uuid | - |
| snack_id | text | - |
| rating | integer | - |
| review | text | null |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

---

### 5단계: Authentication 설정

#### 🔍 설정 위치 찾기

1. Supabase Dashboard 접속
2. 좌측 사이드바에서 **"Authentication"** 클릭 (🔐 자물쇠 아이콘)
3. 상단 탭에서 **"Configuration"** 클릭
4. 좌측에서 **"Auth Providers"** 클릭

---

#### ⚙️ Email Auth 기본 설정

**위치: Authentication > Configuration > Auth Providers**

1. **Email** 항목 찾기 (첫 번째 항목)
2. 다음 항목들을 설정:

**Enable Email provider:**
   - ☑️ **Enable Email Sign-ups** (체크)
   - ☑️ **Enable Email Autoconfirm** (개발 중에는 체크 권장)
     - 이메일 확인 없이 바로 로그인 가능
     - 프로덕션에서는 체크 해제 권장

**Minimum Password Length:**
   ```
   값: 6
   ```
   - 기본값은 6자
   - 보안을 강화하려면 8 이상 권장

3. 변경 후 우측 하단 **"Save"** 버튼 클릭

![Email Provider Settings](https://via.placeholder.com/800x400?text=Email+Provider+Settings)

---

#### 🔗 Redirect URLs 설정

**위치: Authentication > Configuration > URL Configuration**

1. 좌측 메뉴에서 **"URL Configuration"** 클릭

2. **Site URL** 설정:
   ```
   개발: http://localhost:3000
   프로덕션: https://your-domain.vercel.app
   ```
   - 로그인 성공 후 기본 리다이렉트 URL
   - **중요**: 프로토콜 포함 (`http://` 또는 `https://`)

3. **Redirect URLs** 설정:
   - "Add another URL" 버튼을 클릭하여 각 URL 추가
   
   **개발 환경용:**
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```
   
   **프로덕션 환경용:**
   ```
   https://your-domain.vercel.app
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/**
   ```
   
   > 💡 **Tip**: `/**` 는 모든 하위 경로를 허용하는 와일드카드입니다.

4. **"Save"** 버튼 클릭

![URL Configuration](https://via.placeholder.com/800x400?text=URL+Configuration)

---

#### 📧 Email Templates 설정 (선택사항)

**위치: Authentication > Configuration > Email Templates**

1. **Confirm signup** 템플릿:
   - 회원가입 확인 이메일
   - 한글로 커스터마이징 가능

2. **Magic Link** 템플릿:
   - 비밀번호 없는 로그인
   - 필요시 활성화

기본 템플릿을 그대로 사용해도 됩니다.

---

#### ✅ 설정 확인

**제대로 설정되었는지 확인:**

1. **Authentication > Configuration > Auth Providers**
   - Email provider가 **Enabled** 상태
   - Minimum Password Length: **6** (또는 설정한 값)

2. **Authentication > Configuration > URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs에 최소 2개 이상 등록:
     - `http://localhost:3000`
     - `http://localhost:3000/auth/callback`

---

#### 🎯 설정 요약

```yaml
# Email Auth
Enable Email Sign-ups: ✅
Enable Email Autoconfirm: ✅ (개발용)
Minimum Password Length: 6

# URL Configuration  
Site URL: http://localhost:3000

Redirect URLs:
  - http://localhost:3000
  - http://localhost:3000/auth/callback
  - http://localhost:3000/**
  - https://your-domain.vercel.app (배포 후)
  - https://your-domain.vercel.app/auth/callback (배포 후)
  - https://your-domain.vercel.app/** (배포 후)
```

---

#### ⚠️ 주의사항

1. **Redirect URL 미등록 시 오류:**
   ```
   Error: redirect_uri is not allowed
   ```
   → Redirect URLs에 해당 URL 추가

2. **Site URL 프로토콜 누락:**
   ```
   ❌ localhost:3000
   ✅ http://localhost:3000
   ```

3. **포트 번호 확인:**
   - Next.js 기본 포트: `3000`
   - 다른 포트 사용 시 해당 포트로 수정

4. **Vercel 배포 후:**
   - Site URL을 프로덕션 도메인으로 변경
   - Redirect URLs에 프로덕션 URL 추가
   - 개발 URL은 유지 (로컬 테스트용)

---

### 6단계: API Keys 확인

1. 좌측 메뉴에서 **"Settings" > "API"** 선택
2. 다음 값들을 확인:

**Project URL:**
```
https://your-project-ref.supabase.co
```

**API Keys:**
- **anon public** (클라이언트에서 사용, 공개 가능)
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

- **service_role secret** (서버에서만 사용, 절대 공개 금지!)
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

![API Keys](https://via.placeholder.com/800x400?text=Supabase+API+Keys)

---

### 7단계: 환경 변수 설정

`.env.local` 파일에 다음 값 추가:

```env
# Supabase 설정
# Project URL (Settings > API > URL)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Anon Key (Settings > API > anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (Settings > API > service_role)
# ⚠️ 주의: 이 키는 절대 클라이언트에 노출하지 마세요!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 8단계: Row Level Security (RLS) 확인

RLS 정책이 제대로 설정되었는지 확인:

1. **Table Editor**에서 `profiles` 테이블 선택
2. 우측 상단 **"RLS"** 버튼 클릭
3. 다음 정책들이 있는지 확인:
   - ✅ Users can view their own profile
   - ✅ Users can update their own profile

4. `ratings` 테이블도 동일하게 확인:
   - ✅ Ratings are viewable by everyone
   - ✅ Users can create their own ratings
   - ✅ Users can update their own ratings
   - ✅ Users can delete their own ratings

---

## ✅ 테스트

### 데이터베이스 연결 테스트

```bash
# 개발 서버 실행
npm run dev

# 새 터미널에서 테스트 스크립트 실행 (옵션)
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
supabase.from('profiles').select('count').then(console.log);
"
```

### 인증 테스트

1. 브라우저에서 http://localhost:3000/signup 접속
2. 테스트 계정 생성:
   - Email: `test@example.com`
   - Password: `test123`
3. 이메일 확인 링크 클릭 (Settings에서 이메일 확인 활성화한 경우)
4. http://localhost:3000/login에서 로그인 테스트

---

## ⚠️ 문제 해결

### 1. "Invalid API key"

**원인**: 환경 변수가 올바르지 않음

**해결**:
- Supabase Dashboard > Settings > API에서 키 재확인
- `.env.local` 파일의 값이 정확한지 확인
- 개발 서버 재시작

### 2. "Auth session missing!"

**원인**: 세션 쿠키가 제대로 설정되지 않음

**해결**:
- `middleware.ts`가 올바르게 설정되었는지 확인
- 브라우저 쿠키 삭제 후 재시도
- 시크릿 모드에서 테스트

### 3. "Row Level Security policy violation"

**원인**: RLS 정책이 요청을 차단함

**해결**:
- SQL Editor에서 RLS 정책 확인
- 사용자가 로그인되어 있는지 확인
- `service_role` 키는 RLS를 우회하므로 서버에서만 사용

### 4. 마이그레이션 실행 오류

**원인**: SQL 구문 오류 또는 권한 문제

**해결**:
```sql
-- 에러 메시지 확인
-- 한 번에 전체 실행 대신 섹션별로 나눠서 실행
-- 예: profiles 테이블 생성 -> ratings 테이블 생성 -> ...
```

---

## 🔒 보안 Best Practices

### 1. API Keys 관리
- ✅ `NEXT_PUBLIC_*` 키만 클라이언트에서 사용
- ✅ `service_role` 키는 서버 코드에서만 사용
- ❌ GitHub에 절대 커밋하지 않기

### 2. RLS 정책
- ✅ 모든 테이블에 RLS 활성화
- ✅ 최소 권한 원칙 적용
- ✅ 정책 테스트 철저히

### 3. 비밀번호 정책
```sql
-- 최소 8자 이상 권장
ALTER TABLE auth.users
  ADD CONSTRAINT password_length_check
  CHECK (char_length(encrypted_password) >= 60);
```

### 4. Rate Limiting
- Supabase는 기본적으로 Rate Limiting 제공
- Free tier: 500 requests/10 seconds

---

## 📊 모니터링

### Logs 확인

1. Dashboard > **Logs**
2. 다음 로그 타입 확인:
   - **API**: API 요청 로그
   - **Database**: DB 쿼리 로그
   - **Auth**: 인증 이벤트 로그

### Metrics 확인

1. Dashboard > **Reports**
2. 다음 지표 모니터링:
   - API Requests
   - Database Size
   - Auth Users

---

## 🚀 프로덕션 배포 시

### Vercel 환경 변수 설정

1. Vercel Dashboard > Project > Settings > Environment Variables
2. 다음 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Environment: **Production**, **Preview**, **Development** 모두 체크

### Site URL 업데이트

1. Supabase Dashboard > Authentication > Settings
2. **Site URL** 변경:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://your-domain.vercel.app`

3. **Redirect URLs** 추가:
   - `https://your-domain.vercel.app`
   - `https://your-domain.vercel.app/auth/callback`

---

완료! 이제 Supabase가 GawjaPedia와 연동되었습니다. 🎉
