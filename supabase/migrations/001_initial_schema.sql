-- ============================================
-- GawjaPedia 데이터베이스 스키마
-- ============================================
-- 이 파일은 Supabase SQL Editor에서 실행하세요

-- 1. users 테이블 확장 (Supabase Auth와 연동)
-- Supabase Auth는 자동으로 auth.users 테이블을 생성합니다
-- 추가 사용자 정보를 저장하기 위한 public.profiles 테이블 생성

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- profiles 테이블에 RLS (Row Level Security) 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 새 사용자 가입 시 자동으로 프로필 생성하는 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. ratings 테이블 (간식 평가 및 리뷰)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  snack_id TEXT NOT NULL,  -- Google Sheets의 간식 ID
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 한 사용자는 한 간식에 한 번만 평가 가능
  UNIQUE(user_id, snack_id)
);

-- ratings 테이블 인덱스 생성 (조회 성능 향상)
CREATE INDEX idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX idx_ratings_snack_id ON public.ratings(snack_id);
CREATE INDEX idx_ratings_created_at ON public.ratings(created_at DESC);

-- ratings 테이블에 RLS 활성화
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자는 모든 평가를 조회 가능
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings
  FOR SELECT
  USING (true);

-- 로그인한 사용자만 평가 작성 가능
CREATE POLICY "Users can create their own ratings"
  ON public.ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 평가만 수정 가능
CREATE POLICY "Users can update their own ratings"
  ON public.ratings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 사용자는 자신의 평가만 삭제 가능
CREATE POLICY "Users can delete their own ratings"
  ON public.ratings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. user_preferences 테이블 (사용자 선호도)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- 맛 선호도 (JSON 형태로 저장)
  taste_preferences JSONB DEFAULT '[]'::jsonb,
  
  -- TPO 선호도
  preferred_tpo JSONB DEFAULT '[]'::jsonb,
  
  -- 영양 선호도 (예: 저칼로리, 고단백 등)
  nutrition_preferences JSONB DEFAULT '{}'::jsonb,
  
  -- 알레르기 정보
  allergies TEXT[],
  
  -- 선호 카테고리
  preferred_categories TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_preferences 테이블에 RLS 활성화
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 선호도만 조회/수정 가능
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 4. updated_at 자동 업데이트 트리거
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. 유틸리티 뷰: 간식별 평균 평점
-- ============================================

CREATE OR REPLACE VIEW public.snack_ratings_summary AS
SELECT 
  snack_id,
  COUNT(*)::INTEGER as total_ratings,
  ROUND(AVG(rating)::NUMERIC, 2) as average_rating,
  MAX(created_at) as last_rated_at
FROM public.ratings
GROUP BY snack_id;

-- 뷰에 대한 읽기 권한 부여
GRANT SELECT ON public.snack_ratings_summary TO anon, authenticated;

-- ============================================
-- 완료 메시지
-- ============================================
-- 마이그레이션 완료!
-- 다음 단계:
-- 1. Supabase Dashboard > Authentication > Settings에서 이메일 인증 설정
-- 2. API Keys 확인 및 .env.local에 추가
-- 3. 애플리케이션에서 Supabase 클라이언트 연결 테스트
