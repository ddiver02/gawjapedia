# Vercel 배포 가이드

이 가이드는 GawjaPedia를 Vercel에 배포하는 방법을 설명합니다.

---

## 📝 개요

Vercel은 Next.js 애플리케이션의 공식 호스팅 플랫폼으로 다음 기능을 제공합니다:
- **자동 배포**: Git push 시 자동 빌드 및 배포
- **Preview 배포**: PR마다 고유한 Preview URL 생성
- **Edge Network**: 전 세계 CDN을 통한 빠른 응답
- **환경 변수 관리**: Production/Preview/Development 환경별 설정

---

## 🚀 배포 단계

### 1단계: GitHub Repository 생성

1. GitHub에 새 저장소 생성
   - Repository name: `gawjapedia`
   - Visibility: Public 또는 Private

2. 로컬 프로젝트를 GitHub에 푸시:

```bash
# Git 초기화 (아직 안 했다면)
git init

# GitHub 원격 저장소 추가
git remote add origin https://github.com/yourusername/gawjapedia.git

# 첫 커밋
git add .
git commit -m "Initial commit: GawjaPedia project"

# GitHub에 푸시
git branch -M main
git push -u origin main
```

---

### 2단계: Vercel 계정 생성 및 프로젝트 Import

1. [Vercel](https://vercel.com) 접속
2. **"Sign Up"** (GitHub 계정으로 로그인 권장)
3. Dashboard에서 **"New Project"** 클릭
4. GitHub repository 선택
   - `gawjapedia` 저장소 선택
   - **"Import"** 클릭

![Import Repository](https://via.placeholder.com/800x400?text=Vercel+Import+Repository)

---

### 3단계: 프로젝트 설정

**Configure Project** 화면에서:

1. **Project Name**: `gawjapedia` (또는 원하는 이름)
2. **Framework Preset**: Next.js (자동 감지됨)
3. **Root Directory**: `./` (기본값)
4. **Build and Output Settings**: 기본값 사용
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

![Project Settings](https://via.placeholder.com/800x400?text=Vercel+Project+Settings)

---

### 4단계: 환경 변수 설정

**Environment Variables** 섹션에서 다음 변수 추가:

#### Google Sheets API

```env
# Name: GOOGLE_SHEETS_ID
# Value: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
# Environment: Production, Preview, Development

# Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
# Value: gawjapedia-service@your-project-id.iam.gserviceaccount.com
# Environment: Production, Preview, Development

# Name: GOOGLE_PRIVATE_KEY
# Value: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# Environment: Production, Preview, Development
```

> ⚠️ **중요**: `GOOGLE_PRIVATE_KEY`는 큰따옴표로 감싸고 개행 문자(`\n`)를 그대로 유지하세요!

#### Supabase

```env
# Name: NEXT_PUBLIC_SUPABASE_URL
# Value: https://your-project-ref.supabase.co
# Environment: Production, Preview, Development

# Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
# Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Environment: Production, Preview, Development

# Name: SUPABASE_SERVICE_ROLE_KEY
# Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Environment: Production, Preview, Development
```

#### Vercel URL (자동 설정됨)

```env
# Name: NEXT_PUBLIC_VERCEL_URL
# 이 변수는 Vercel이 자동으로 설정하므로 직접 입력할 필요 없음
```

![Environment Variables](https://via.placeholder.com/800x400?text=Vercel+Environment+Variables)

**환경 변수 입력 방법:**
1. `.env.local.example` 파일을 참고
2. 각 변수의 **Name**과 **Value** 입력
3. **Environment** 체크박스:
   - ☑️ Production (프로덕션 배포)
   - ☑️ Preview (PR 미리보기)
   - ☑️ Development (로컬 개발)
4. **"Add"** 클릭

---

### 5단계: 배포 시작

1. 모든 환경 변수 입력 완료 후 **"Deploy"** 클릭
2. 빌드 로그 실시간 확인
3. 배포 완료까지 1-3분 대기

배포 성공 시:
```
✓ Building
✓ Deployment ready
```

![Deployment Success](https://via.placeholder.com/800x400?text=Vercel+Deployment+Success)

---

### 6단계: 배포 확인 및 도메인 설정

#### 배포 확인

1. **"Visit"** 버튼 클릭하여 사이트 접속
2. 기본 URL: `https://gawjapedia.vercel.app`
3. 주요 페이지 테스트:
   - ✅ 홈페이지 (/)
   - ✅ 간식 목록 (/snacks)
   - ✅ API 엔드포인트 (/api/snacks)

#### 커스텀 도메인 설정 (선택)

1. Vercel Dashboard > Project > Settings > **Domains**
2. **"Add"** 클릭
3. 도메인 입력 (예: `gawjapedia.com`)
4. DNS 설정:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`
5. 도메인 확인 대기 (최대 24시간)

---

## 🔄 자동 배포 설정

### Production 배포 (main 브랜치)

`main` 브랜치에 푸시할 때마다 자동으로 Production 배포:

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

→ https://gawjapedia.vercel.app 자동 업데이트

### Preview 배포 (기타 브랜치)

1. 새 브랜치 생성:
```bash
git checkout -b feature/new-feature
```

2. 변경사항 커밋 및 푸시:
```bash
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

3. GitHub에서 Pull Request 생성
4. Vercel이 자동으로 Preview 링크 생성:
   - `https://gawjapedia-git-feature-new-feature-username.vercel.app`

5. Preview에서 변경사항 확인
6. 문제 없으면 PR을 main에 병합 → Production 자동 배포

---

## 📊 배포 후 체크리스트

### 1. Supabase 설정 업데이트

Supabase Dashboard > Authentication > Settings:

- **Site URL**: `https://gawjapedia.vercel.app`
- **Redirect URLs**:
  ```
  https://gawjapedia.vercel.app
  https://gawjapedia.vercel.app/auth/callback
  https://gawjapedia.vercel.app/**
  ```

### 2. Google Sheets 권한 확인

- 서비스 계정이 스프레드시트에 접근 가능한지 확인
- Production 환경에서 API 호출 테스트

### 3. 기능 테스트

- [ ] 회원가입 & 로그인
- [ ] 간식 목록 조회
- [ ] 간식 상세 페이지
- [ ] 추천 기능
- [ ] 평점 작성/수정/삭제
- [ ] 취향 테스트
- [ ] 프로필 페이지

### 4. 성능 확인

Vercel Analytics에서 확인:
- Core Web Vitals
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

---

## ⚙️ 고급 설정

### 환경별 설정 분리

#### Development (로컬)
```env
# .env.development.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Production
```env
# Vercel > Environment Variables > Production
NEXT_PUBLIC_APP_URL=https://gawjapedia.vercel.app
```

### Build 최적화

`vercel.json` 파일 생성 (선택):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

- **regions**: `icn1` (Seoul) - 한국 사용자 대상
- **memory**: API 함수 메모리 할당
- **maxDuration**: Hobby 플랜 최대 10초

---

## 🐛 문제 해결

### 1. 빌드 실패: "Module not found"

**원인**: 의존성 누락

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 누락된 패키지 설치
npm install missing-package

# package.json 업데이트 후 푸시
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push
```

### 2. 환경 변수 오류

**원인**: 환경 변수가 올바르게 설정되지 않음

**해결**:
1. Vercel Dashboard > Settings > Environment Variables 확인
2. 변수 이름에 오타가 없는지 확인
3. `NEXT_PUBLIC_*` 접두사 확인
4. 환경 변수 수정 후 **"Redeploy"** 클릭

### 3. API Routes 404 오류

**원인**: 잘못된 라우팅 또는 파일 구조

**해결**:
```
# 올바른 구조
app/
  api/
    snacks/
      route.ts        → /api/snacks
      [id]/
        route.ts      → /api/snacks/:id
```

### 4. 이미지 최적화 오류

**원인**: next.config.js 설정 누락

**해결**:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

---

## 📈 모니터링 & 분석

### Vercel Analytics 활성화

1. Vercel Dashboard > Project > **Analytics**
2. **"Enable Analytics"** 클릭
3. 다음 지표 확인:
   - Page Views
   - Unique Visitors
   - Top Pages
   - Top Referrers

### Error Tracking

`app/error.tsx` 파일 생성:

```typescript
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러 로깅 서비스로 전송 (예: Sentry)
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

---

## 💰 비용 관리

### Vercel Hobby Plan (무료)
- ✅ 무제한 배포
- ✅ 자동 HTTPS
- ✅ 100GB 대역폭/월
- ✅ 100 serverless 함수 실행/일

### 사용량 확인
1. Dashboard > **Usage**
2. 다음 지표 모니터링:
   - Bandwidth
   - Function Invocations
   - Build Minutes

### 비용 절감 팁
- 이미지 최적화 적극 활용
- API 응답 캐싱
- ISR (Incremental Static Regeneration) 사용
- 불필요한 Preview 배포 삭제

---

## 🔐 보안 체크리스트

- [ ] 환경 변수에 민감 정보 저장 (코드에 하드코딩 금지)
- [ ] HTTPS 강제 (Vercel 자동 제공)
- [ ] CORS 설정 확인
- [ ] Rate Limiting 구현
- [ ] CSP (Content Security Policy) 헤더 설정
- [ ] 정기적인 의존성 업데이트

---

## 📚 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)

---

완료! GawjaPedia가 성공적으로 배포되었습니다. 🎉

**배포 URL**: https://gawjapedia.vercel.app
