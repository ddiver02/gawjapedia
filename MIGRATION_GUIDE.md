# Supabase Migration - Manual Steps

Docker가 로컬에서 실행되지 않으므로, **Supabase Dashboard**를 통해 직접 마이그레이션을 적용합니다.

## Step 1: Supabase Dashboard로 마이그레이션 적용

### 1-1. Supabase Dashboard 접속
```
https://supabase.com/dashboard
→ 프로젝트 선택
→ SQL Editor
```

### 1-2. 마이그레이션 파일 실행

**순서대로 실행:**

#### Migration 1: Drop Old Tables
파일: `supabase/migrations/002_drop_old_tables.sql`

```sql
-- 복사해서 SQL Editor에 붙여넣고 Run
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
```

#### Migration 2: Create Product Schema
파일: `supabase/migrations/003_create_product_schema.sql`

전체 내용을 복사해서 SQL Editor에 붙여넣고 Run

---

## Step 2: 데모 데이터 임포트

마이그레이션 완료 후:

```bash
npm run migrate:demo
```

---

## 검증

```bash
# Supabase Dashboard → Table Editor에서 확인
# - product_infos 테이블에 데이터 있는지
# - mandatory_nutrient_infos 테이블에 데이터 있는지
```

---

## ⚠️ 주의사항

- **프로덕션 환경**에 직접 적용하므로 주의
- 기존 ratings 데이터는 **삭제**됨
- 백업이 필요하면 먼저 진행

---

계속 진행하시겠습니까?
