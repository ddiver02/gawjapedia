-- Product Pairing Feature Migration
-- Creates tables for user-curated product combinations

-- 1. Main pairings table
CREATE TABLE pairings (
  pairing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 100),
  description TEXT CHECK (description IS NULL OR length(description) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0)
);

-- 2. Product associations (2-5 products per pairing)
CREATE TABLE pairing_products (
  pairing_id UUID NOT NULL REFERENCES pairings(pairing_id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES product_infos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (pairing_id, product_id),
  UNIQUE (pairing_id, position)
);

-- 3. Like tracking
CREATE TABLE pairing_likes (
  pairing_id UUID NOT NULL REFERENCES pairings(pairing_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (pairing_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_pairings_user_id ON pairings(user_id);
CREATE INDEX idx_pairings_likes_count ON pairings(likes_count DESC);
CREATE INDEX idx_pairings_created_at ON pairings(created_at DESC);
CREATE INDEX idx_pairing_products_product_id ON pairing_products(product_id);
CREATE INDEX idx_pairing_likes_user_id ON pairing_likes(user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_pairing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pairing_updated_at
  BEFORE UPDATE ON pairings
  FOR EACH ROW
  EXECUTE FUNCTION update_pairing_updated_at();

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION update_pairing_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pairings 
    SET likes_count = likes_count + 1 
    WHERE pairing_id = NEW.pairing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pairings 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE pairing_id = OLD.pairing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pairing_likes_count_trigger
  AFTER INSERT OR DELETE ON pairing_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_pairing_likes_count();

-- Row Level Security
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairing_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pairings
CREATE POLICY "Pairings are viewable by everyone"
  ON pairings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own pairings"
  ON pairings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pairings"
  ON pairings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pairings"
  ON pairings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pairing_products
CREATE POLICY "Pairing products are viewable by everyone"
  ON pairing_products FOR SELECT
  USING (true);

CREATE POLICY "Users can add products to their pairings"
  ON pairing_products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pairings 
      WHERE pairing_id = pairing_products.pairing_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove products from their pairings"
  ON pairing_products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pairings 
      WHERE pairing_id = pairing_products.pairing_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for pairing_likes
CREATE POLICY "Pairing likes are viewable by everyone"
  ON pairing_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like pairings"
  ON pairing_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike pairings"
  ON pairing_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Constraint to ensure 2-5 products per pairing
CREATE OR REPLACE FUNCTION check_pairing_product_count()
RETURNS TRIGGER AS $$
DECLARE
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count
  FROM pairing_products
  WHERE pairing_id = NEW.pairing_id;

  IF TG_OP = 'INSERT' AND product_count >= 5 THEN
    RAISE EXCEPTION 'A pairing cannot have more than 5 products';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_pairing_product_count_trigger
  BEFORE INSERT ON pairing_products
  FOR EACH ROW
  EXECUTE FUNCTION check_pairing_product_count();
