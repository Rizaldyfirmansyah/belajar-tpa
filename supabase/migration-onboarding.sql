-- ============================================================
-- Migration: Onboarding (target skor + tanggal tes)
-- Run this in Supabase SQL Editor
-- ============================================================
-- target_score sudah ada sejak schema awal (default 475).
-- Dua kolom di bawah yang baru.

-- Tanggal rencana tes. Null = user belum tahu / memilih lewati.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS test_date date;

-- Penanda onboarding selesai. Null = tampilkan onboarding saat login.
-- Dipisah dari test_date supaya user yang sengaja melewati pertanyaan
-- tanggal tidak ditanya ulang terus setiap masuk.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- User lama (sudah pakai aplikasi sebelum fitur ini ada) jangan
-- dilempar ke onboarding.
UPDATE profiles SET onboarded_at = now() WHERE onboarded_at IS NULL;

NOTIFY pgrst, 'reload schema';
