# Google Sheets API 설정 가이드

이 가이드는 GawjaPedia에서 Google Sheets를 간식 마스터 데이터 소스로 사용하기 위한 설정 방법을 설명합니다.

---

## 📝 개요

Google Sheets API를 사용하여 간식 데이터를 관리하고 애플리케이션에서 실시간으로 데이터를 불러옵니다.

---

## 🔧 설정 단계

### 1단계: Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 우측 상단 프로젝트 선택 드롭다운 클릭
3. **"새 프로젝트"** 클릭
4. 프로젝트 이름 입력 (예: "GawjaPedia")
5. **"만들기"** 클릭

![Create Project](https://via.placeholder.com/800x400?text=Google+Cloud+Console+-+Create+Project)

---

### 2단계: Google Sheets API 활성화

1. 좌측 메뉴에서 **"API 및 서비스" > "라이브러리"** 선택
2. 검색창에 **"Google Sheets API"** 입력
3. **"Google Sheets API"** 클릭
4. **"사용 설정"** 클릭

![Enable API](https://via.placeholder.com/800x400?text=Enable+Google+Sheets+API)

---

### 3단계: 서비스 계정 생성

1. 좌측 메뉴에서 **"API 및 서비스" > "사용자 인증 정보"** 선택
2. 상단의 **"사용자 인증 정보 만들기"** 클릭
3. **"서비스 계정"** 선택
4. 서비스 계정 세부정보 입력:
   - **이름**: `gawjapedia-service`
   - **설명**: GawjaPedia Google Sheets 읽기 전용 계정
5. **"만들기 및 계속하기"** 클릭
6. 역할 선택 (선택사항):
   - **역할**: 없음 (Sheets 공유로 권한 부여)
7. **"완료"** 클릭

---

### 4단계: 서비스 계정 키 생성

1. 생성된 서비스 계정 목록에서 방금 생성한 계정 클릭
2. **"키"** 탭 선택
3. **"키 추가" > "새 키 만들기"** 클릭
4. **"JSON"** 선택
5. **"만들기"** 클릭
6. JSON 파일이 자동으로 다운로드됩니다 (**안전하게 보관!**)

> ⚠️ **중요**: 이 JSON 파일에는 민감한 정보가 포함되어 있습니다. Git에 절대 커밋하지 마세요!

다운로드된 JSON 파일 예시:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "gawjapedia-service@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

### 5단계: Google Sheets 생성 및 데이터 입력

1. [Google Sheets](https://sheets.google.com) 접속
2. **빈 스프레드시트** 생성
3. 스프레드시트 이름 변경 (예: "GawjaPedia 간식 데이터")
4. 첫 번째 행에 다음 헤더 입력:

| id | 상품명 | 제조원 | 분류 | 분류2 | 분류3 | 내용량 | price | 점수 | 평가 | 열량(Kcal) | 나트륨(mg) | ... |
|----|--------|--------|------|-------|-------|--------|-------|------|------|------------|------------|-----|

**전체 컬럼 목록 (29개):**
```
id, 상품명, 제조원, 분류, 분류2, 분류3,
내용량, price, 점수, 평가,
열량(Kcal), 나트륨(mg), 탄수화물(g), 식이섬유(g), 당류(g),
지방(g), 트랜스지방(g), 포화지방(g), 콜레스테롤(mg),
단백질(g), 유당(g), 칼슘(mg), 철분(mg), 아연(mg),
마그네슘(mg), 비타민A(µg), 비타민B1(mg), 비타민B2(mg),
비타민B6(mg), 비타민C(mg), 비타민E(mg), 나이아신(mg),
판토텐산(mg), 엽산(µg)
```

5. 샘플 데이터 입력:

| id | 상품명 | 제조원 | 분류 | 내용량 | price | 점수 | 평가 | 열량(Kcal) | 나트륨(mg) | 탄수화물(g) | 당류(g) | 단백질(g) | ... |
|----|--------|--------|------|--------|-------|------|------|------------|------------|-------------|---------|-----------|-----|
| 1  | 초코칩 쿠키 | ABC식품 | 과자 | 100g | 2500 | 85 | 4.5 | 450 | 200 | 60 | 25 | 5 | ... |
| 2  | 프링글스 오리지널 | 켈로그 | 과자 | 110g | 3000 | 78 | 4.2 | 530 | 420 | 53 | 2 | 6 | ... |

---

### 6단계: 스프레드시트 ID 확인

스프레드시트 URL에서 ID 복사:
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
                                    ^^^^^^^^^^^^^^^^^^^^
                                    이 부분이 ID입니다
```

예시:
```
URL: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
ID:  1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

---

### 7단계: 스프레드시트 공유

1. 스프레드시트 우측 상단 **"공유"** 버튼 클릭
2. **"사용자 및 그룹" 추가** 필드에 서비스 계정 이메일 입력
   - 예: `gawjapedia-service@your-project-id.iam.gserviceaccount.com`
   - JSON 파일의 `client_email` 값
3. 권한: **"뷰어"** 선택 (읽기 전용)
4. **"완료"** 클릭

![Share Spreadsheet](https://via.placeholder.com/800x400?text=Share+Spreadsheet+with+Service+Account)

---

### 8단계: 환경 변수 설정

`.env.local` 파일에 다음 값 추가:

```env
# Google Sheets 설정
# 스프레드시트 ID (URL에서 확인)
GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

# 서비스 계정 이메일 (JSON 파일의 client_email)
GOOGLE_SERVICE_ACCOUNT_EMAIL=gawjapedia-service@your-project-id.iam.gserviceaccount.com

# Private Key (JSON 파일의 private_key)
# 주의: 개행 문자(\n)를 그대로 유지해야 합니다
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAAS...\n-----END PRIVATE KEY-----\n"
```

> 💡 **Tip**: `private_key`를 복사할 때 큰따옴표를 포함하여 전체를 복사하세요.

---

## ✅ 테스트

설정이 완료되면 다음 명령으로 테스트:

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:3000/api/snacks
```

성공 시 간식 목록 JSON 응답을 확인할 수 있습니다.

---

## ⚠️ 문제 해결

### 1. "Error: Unable to detect a Project Id in the current environment."

**원인**: 환경 변수가 올바르게 설정되지 않음

**해결**:
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일 이름이 `.env.local`인지 확인 (`.env.example` 아님)
- 개발 서버 재시작 (`npm run dev`)

### 2. "Error: Permission denied"

**원인**: 서비스 계정이 스프레드시트에 접근 권한이 없음

**해결**:
- 스프레드시트 공유 설정 확인
- 서비스 계정 이메일이 정확한지 확인
- 권한이 최소 "뷰어"인지 확인

### 3. "Error: Invalid grant"

**원인**: Private Key가 올바르지 않음

**해결**:
- `.env.local`의 `GOOGLE_PRIVATE_KEY` 값 확인
- 개행 문자 `\n`이 제대로 포함되어 있는지 확인
- 큰따옴표로 감싸져 있는지 확인

---

## 📊 데이터 관리 팁

1. **정기 업데이트**: Google Sheets에서 직접 데이터를 수정하면 즉시 반영됩니다
2. **백업**: 중요한 데이터는 정기적으로 백업하세요
3. **버전 관리**: Google Sheets의 버전 기록 기능 활용
4. **권한 관리**: 필요한 사람에게만 편집 권한 부여

---

## 🔐 보안 주의사항

- ❌ 서비스 계정 JSON 파일을 Git에 커밋하지 마세요
- ❌ `.env.local` 파일을 공개 저장소에 올리지 마세요
- ✅ `.gitignore`에 `.env*.local`이 포함되어 있는지 확인
- ✅ JSON 키 파일은 안전한 곳에 백업

---

완료! 이제 Google Sheets 데이터를 애플리케이션에서 사용할 수 있습니다. 🎉
