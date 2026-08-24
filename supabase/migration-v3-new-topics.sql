-- ============================================================
-- Migration v3: New topic/subtest structure + clear questions
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Clear all questions (and dependent rows via FK cascade or manual)
DELETE FROM bookmarks;
DELETE FROM drill_answers;
DELETE FROM tryout_answers;
DELETE FROM tryout_sessions;
DELETE FROM questions;

-- 2. Drop old check constraints on questions
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_subtest_check;
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_topic_check;
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_question_type_check;

-- 3. Add new check constraints
ALTER TABLE questions
  ADD CONSTRAINT questions_subtest_check
  CHECK (subtest IN ('verbal', 'numerik', 'penalaran'));

ALTER TABLE questions
  ADD CONSTRAINT questions_topic_check
  CHECK (topic IN (
    'sinonim', 'antonim', 'analogi', 'pengelompokan_kata', 'pemahaman_wacana',
    'deret', 'matematika_berpola', 'aritmetika_aljabar', 'cerita',
    'penalaran_logis', 'penalaran_analitis', 'penalaran_gambar'
  ));

ALTER TABLE questions
  ADD CONSTRAINT questions_question_type_check
  CHECK (question_type IN ('text', 'image'));

-- 4. Add image columns to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS options_images jsonb;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation_image_url text;

-- 5. Update tryout_sessions: rename score_logika → score_penalaran
ALTER TABLE tryout_sessions RENAME COLUMN score_logika TO score_penalaran;

-- ============================================================
-- SUPABASE STORAGE (do this in Dashboard → Storage):
-- Create bucket: question-images
-- Set to PUBLIC
-- ============================================================
