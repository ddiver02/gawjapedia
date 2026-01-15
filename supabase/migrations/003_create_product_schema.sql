-- ============================================
-- GawjaPedia Product Schema
-- Migration: Create product tables with dual rating system
-- ============================================

-- 1. 제품 기본 정보
CREATE TABLE product_infos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  content_volume TEXT NOT NULL,
  price INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  description TEXT,
  image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 생산 정보
CREATE TABLE production_infos (
  product_id TEXT PRIMARY KEY REFERENCES product_infos(id) ON DELETE CASCADE,
  made_from TEXT,
  maker TEXT,
  importer TEXT,
  distributor TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 필수 영양소 정보
CREATE TABLE mandatory_nutrient_infos (
  product_id TEXT PRIMARY KEY REFERENCES product_infos(id) ON DELETE CASCADE,
  
  calories DECIMAL(10,2) NOT NULL,
  carbohydrate DECIMAL(10,2) NOT NULL,
  sugars DECIMAL(10,2),
  dietary_fiber DECIMAL(10,2),
  protein DECIMAL(10,2) NOT NULL,
  fat DECIMAL(10,2) NOT NULL,
  saturated_fat DECIMAL(10,2),
  trans_fat DECIMAL(10,2),
  cholesterol DECIMAL(10,2),
  sodium DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 비타민 정보
CREATE TABLE nutrient_vitamin_infos (
  product_id TEXT PRIMARY KEY REFERENCES product_infos(id) ON DELETE CASCADE,
  
  vitamin_a DECIMAL(10,2),
  vitamin_d DECIMAL(10,2),
  vitamin_e DECIMAL(10,2),
  vitamin_k DECIMAL(10,2),
  vitamin_b1 DECIMAL(10,2),
  vitamin_b2 DECIMAL(10,2),
  niacin DECIMAL(10,2),
  pantothenic_acid DECIMAL(10,2),
  vitamin_b6 DECIMAL(10,2),
  biotin DECIMAL(10,2),
  folate DECIMAL(10,2),
  vitamin_b12 DECIMAL(10,2),
  vitamin_c DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 미네랄 정보
CREATE TABLE nutrient_mineral_infos (
  product_id TEXT PRIMARY KEY REFERENCES product_infos(id) ON DELETE CASCADE,
  
  calcium DECIMAL(10,2),
  iron DECIMAL(10,2),
  magnesium DECIMAL(10,2),
  phosphorus DECIMAL(10,2),
  potassium DECIMAL(10,2),
  zinc DECIMAL(10,2),
  copper DECIMAL(10,2),
  manganese DECIMAL(10,2),
  iodine DECIMAL(10,2),
  selenium DECIMAL(10,2),
  chromium DECIMAL(10,2),
  molybdenum DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 제품 평점 (가격 + 품질 이중 평가)
CREATE TABLE product_ratings (
  rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES product_infos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  price_rating INTEGER NOT NULL CHECK (price_rating >= 1 AND price_rating <= 5),
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, user_id)
);

-- 7. 제품 댓글/리뷰
CREATE TABLE product_comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES product_infos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  comment TEXT NOT NULL,
  agree INTEGER DEFAULT 0,
  disagree INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_product_category ON product_infos(category);
CREATE INDEX idx_product_score ON product_infos(score DESC);
CREATE INDEX idx_product_price ON product_infos(price);
CREATE INDEX idx_product_created_at ON product_infos(created_at DESC);
CREATE INDEX idx_product_search ON product_infos USING GIN (to_tsvector('simple', title || ' ' || manufacturer));

CREATE INDEX idx_ratings_product ON product_ratings(product_id);
CREATE INDEX idx_ratings_user ON product_ratings(user_id);
CREATE INDEX idx_ratings_created ON product_ratings(created_at DESC);

CREATE INDEX idx_comments_product ON product_comments(product_id);
CREATE INDEX idx_comments_user ON product_comments(user_id);
CREATE INDEX idx_comments_created ON product_comments(created_at DESC);

-- ============================================
-- Triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_infos_updated_at BEFORE UPDATE ON product_infos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_infos_updated_at BEFORE UPDATE ON production_infos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mandatory_nutrient_infos_updated_at BEFORE UPDATE ON mandatory_nutrient_infos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrient_vitamin_infos_updated_at BEFORE UPDATE ON nutrient_vitamin_infos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrient_mineral_infos_updated_at BEFORE UPDATE ON nutrient_mineral_infos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_ratings_updated_at BEFORE UPDATE ON product_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_comments_updated_at BEFORE UPDATE ON product_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE product_infos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "제품 정보는 누구나 볼 수 있음" ON product_infos FOR SELECT USING (true);

ALTER TABLE production_infos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "생산 정보는 누구나 볼 수 있음" ON production_infos FOR SELECT USING (true);

ALTER TABLE mandatory_nutrient_infos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "영양 정보는 누구나 볼 수 있음" ON mandatory_nutrient_infos FOR SELECT USING (true);

ALTER TABLE nutrient_vitamin_infos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "비타민 정보는 누구나 볼 수 있음" ON nutrient_vitamin_infos FOR SELECT USING (true);

ALTER TABLE nutrient_mineral_infos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "미네랄 정보는 누구나 볼 수 있음" ON nutrient_mineral_infos FOR SELECT USING (true);

ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "평점은 누구나 볼 수 있음" ON product_ratings FOR SELECT USING (true);
CREATE POLICY "로그인한 사용자는 평점을 생성할 수 있음" ON product_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "자신의 평점만 수정할 수 있음" ON product_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "자신의 평점만 삭제할 수 있음" ON product_ratings FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "댓글은 누구나 볼 수 있음" ON product_comments FOR SELECT USING (true);
CREATE POLICY "로그인한 사용자는 댓글을 작성할 수 있음" ON product_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "자신의 댓글만 수정할 수 있음" ON product_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "자신의 댓글만 삭제할 수 있음" ON product_comments FOR DELETE USING (auth.uid() = user_id);
