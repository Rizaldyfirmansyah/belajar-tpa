-- ============================================================
-- Fix: kolom gambar questions + reload schema cache PostgREST
-- Run this in Supabase SQL Editor
-- ============================================================
-- Gejala: "Could not find the 'explanation_image_url' column of
-- 'questions' in the schema cache" saat simpan soal dari /admin.
--
-- Dua kemungkinan penyebab, dua-duanya ditutup di sini:
--   1. ALTER COLUMN dari migration-v3 tidak sempat jalan
--      → ADD COLUMN IF NOT EXISTS (aman kalau sudah ada)
--   2. Kolom sudah ada tapi schema cache PostgREST basi
--      → NOTIFY reload

ALTER TABLE questions ADD COLUMN IF NOT EXISTS options_images jsonb;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation_image_url text;

NOTIFY pgrst, 'reload schema';
