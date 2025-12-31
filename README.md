# GawjaPedia - 스마트 간식 추천 서비스

**당신의 취향과 상황에 딱 맞는 간식을 추천해드립니다.**

GawjaPedia는 Next.js 14, TypeScript, Supabase, Google Sheets를 활용한 풀스택 간식 추천 웹 애플리케이션입니다.

---

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
  - [사전 요구사항](#사전-요구사항)
  - [환경 설정](#환경-설정)
  - [설치 및 실행](#설치-및-실행)
- [프로젝트 구조](#프로젝트-구조)
- [API 문서](#api-문서)
- [배포](#배포)
- [기여하기](#기여하기)

---

## ✨ 주요 기능

### 1. **맞춤형 간식 추천**
- 사용자 맛 선호도 기반 추천
- TPO (Time, Place, Occasion) 컨텍스트 기반 추천
- 영양 성분 기반 건강 추천
- AI 추천 알고리즘 (가중치 기반 점수 계산)

### 2. **상세한 간식 정보**
- Google Sheets 기반 마스터 데이터 관리
- 29가지 영양성분 정보 제공
- 카테고리별 분류
- 제조원 및 가격 정보

### 3. **사용자 리뷰 & 평점**
- 간식 평가 및 리뷰 작성
- 평점 통계 및 평균 점수
- 사용자별 리뷰 관리

### 4. **취향 테스트**
- 다단계 질문을 통한 맛 선호도 분석
- 개인화된 추천 기반 구축

---

##  기술 스택

### **Frontend**
- **Next.js 14** (App Router)
- **TypeScript** (Strict Mode)
- **Tailwind CSS**
- **React 18**

### **Backend**
- **Next.js API Routes**
- **Supabase** (Authentication, PostgreSQL)
- **Google Sheets API** (Master Data)
- **Zod** (Validation)

### **Deployment**
- **Vercel** (Frontend & API)
- **Supabase Cloud** (Database)

---

## 🚀 시작하기

### 사전 요구사항

다음 소프트웨어가 설치되어 있어야 합니다:

- **Node.js 20.11.0+** (nvm 사용 권장)
- **npm** 또는 **yarn**
- **Git**

### 환경 설정

#### 1. Node.js 버전 관리 (nvm 권장)

**macOS/Linux:**
```bash
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 터미널 재시작 후
nvm install 20.11.0
nvm use 20.11.0
```

**Windows:**
- [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) 다운로드 및 설치
```bash
nvm install 20.11.0
nvm use 20.11.0
```

#### 2. Google Sheets API 설정

상세 가이드: [docs/GOOGLE_SHEETS_SETUP.md](./docs/GOOGLE_SHEETS_SETUP.md)

**요약:**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. Google Sheets API 활성화
4. 서비스 계정 생성 및 JSON 키 다운로드
5. Google Sheets 생성 후 서비스 계정과 공유

#### 3. Supabase 설정

상세 가이드: [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)

**요약:**
1. [Supabase](https://supabase.com) 가입 및 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
3. Settings > API에서 URL 및 Keys 확인

#### 4. 환경 변수 설정

```bash
# .env.local.example을 복사
cp .env.local.example .env.local

# .env.local 파일을 열어 실제 값 입력
```

**필수 환경 변수:**
```env
# Google Sheets
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/gawjapedia.git
cd gawjapedia

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 📁 프로젝트 구조

```
gawjapedia/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── snacks/               # 간식 API
│   │   ├── recommendations/      # 추천 API
│   │   └── ratings/              # 평점 API
│   ├── (pages)/                  # 페이지 그룹
│   │   ├── page.tsx              # 랜딩 페이지
│   │   ├── snacks/               # 간식 목록/상세
│   │   ├── test/                 # 취향 테스트
│   │   ├── recommendations/      # 추천 결과
│   │   ├── login/                # 로그인
│   │   ├── signup/               # 회원가입
│   │   └── profile/              # 프로필
│   ├── layout.tsx                # Root Layout
│   └── globals.css               # 전역 CSS
├── components/                   # React 컴포넌트
│   ├── layout/                   # 레이아웃 컴포넌트
│   ├── snacks/                   # 간식 관련 컴포넌트
│   └── ui/                       # 재사용 UI 컴포넌트
├── lib/                          # 유틸리티 & 로직
│   ├── googleSheets.ts           # Google Sheets 통합
│   ├── supabase/                 # Supabase 클라이언트
│   ├── recommendation/           # 추천 알고리즘
│   │   ├── engine.ts             # 추천 엔진
│   │   ├── scoring.ts            # 점수 계산
│   │   └── types.ts              # 타입 정의
│   └── hooks/                    # Custom Hooks
├── types/                        # TypeScript 타입
│   ├── snack.ts                  # 간식 타입
│   └── database.ts               # DB 타입
├── supabase/                     # Supabase 설정
│   └── migrations/               # DB 마이그레이션
├── __tests__/                    # 테스트 파일
├── docs/                         # 문서
├── middleware.ts                 # Next.js Middleware
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
└── package.json                  # 의존성
```

---

## 📚 API 문서

### Snacks API

**GET `/api/snacks`** - 간식 목록 조회
- 쿼리: `category`, `search`, `page`, `limit`

**GET `/api/snacks/[id]`** - 간식 상세 조회
- 평점 통계 및 최근 리뷰 포함

### Recommendations API

**POST `/api/recommendations`** - 맞춤 추천
```json
{
  "tastes": ["단맛", "바삭한"],
  "tpo": { "time": "간식시간", "place": "사무실" },
  "nutrition": { "maxCalories": 300 }
}
```

### Ratings API

**GET `/api/ratings`** - 평점 목록
**POST `/api/ratings`** - 평점 작성 (인증 필요)
**PUT `/api/ratings/[id]`** - 평점 수정 (본인만)
**DELETE `/api/ratings/[id]`** - 평점 삭제 (본인만)

---

## 🧪 테스트

```bash
# 전체 테스트 실행
npm run test

# Watch 모드
npm run test:watch

# 타입 체크
npm run type-check

# Lint 검사
npm run lint
```

---

## 🚢 배포

**Vercel 배포 가이드:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

**빠른 배포:**

1. GitHub에 푸시
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. [Vercel](https://vercel.com)에서 Import
3. 환경 변수 설정 (Production)
4. Deploy 클릭

---

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Tailwind CSS](https://tailwindcss.com/)
