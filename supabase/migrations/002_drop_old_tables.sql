-- ============================================
-- Migration: Drop old tables and create new product schema
-- ============================================

-- Drop old tables
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Note: Keep profiles table for user authentication
-- profiles table is still needed for user management
