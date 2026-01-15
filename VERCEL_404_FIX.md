# Vercel 404 에러 해결 가이드

## 🔍 **문제 상황**
- **로컬**: `/api/products` 정상 작동 ✅
- **Vercel**: `/api/products` 404 에러 ❌

## ✅ **해결 방법**

### **Option 1: Vercel 대시보드에서 재배포**

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - GawjaPedia 프로젝트 클릭

3. **최신 배포 확인**
   - Deployments 탭에서 최신 배포가 `6e3dca2` 커밋인지 확인
   - 만약 다른 커밋이면 **Redeploy** 버튼 클릭

### **Option 2: Git을 통한 강제 재배포**

터미널에서 실행:

```bash
# 빈 커밋으로 강제 재배포 트리거
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

### **Option 3: Vercel CLI로 재배포**

```bash
# Vercel CLI 설치 (한 번만)
npm i -g vercel

# 재배포
vercel --prod
```

---

## 🔍 **추가 확인 사항**

### **1. Vercel 빌드 로그 확인**

Vercel Dashboard → Deployments → 최신 배포 → **View Build Logs**

**확인할 내용:**
- `app/api/products/route.ts` 파일이 빌드에 포함되었는지
- 빌드 에러 없는지
- TypeScript 컴파일 성공했는지

### **2. 환경 변수 확인**

Vercel Dashboard → Settings → Environment Variables

**필수 환경 변수:**
```
NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-key
```

환경 변수 추가/수정 후 **반드시 재배포** 필요!

---

## 🚨 **흔한 원인**

1. **캐시 문제**
   - Vercel이 이전 빌드를 캐시하고 있을 수 있음
   - 해결: **Redeploy** 버튼 클릭

2. **빌드 타이밍**
   - Git push 후 Vercel이 배포를 시작하는데 몇 분 걸릴 수 있음
   - 해결: 5-10분 대기 후 재확인

3. **파일 경로 문제**
   - 대소문자 구분 (로컬 Mac vs Vercel Linux)
   - 해결: 파일명 확인

---

## 💡 **즉시 해결 방법**

가장 빠른 해결책:

```bash
# 터미널에서 실행
git commit --allow-empty -m "Force redeploy"
git push
```

그 후 Vercel Dashboard에서 배포 진행 상황 모니터링!

---

배포 완료 후 테스트:
- `https://your-app.vercel.app/api/products`
- `https://your-app.vercel.app/snacks`
