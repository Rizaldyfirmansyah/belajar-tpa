-- ============================================================
-- Migration: Storage policy untuk bucket question-images
-- Run this in Supabase SQL Editor
-- ============================================================
-- Bucket 'question-images' sudah public (read via public URL OK),
-- tapi upload tetap kena RLS storage.objects. Tanpa policy insert,
-- semua upload dari browser gagal dengan:
--   "new row violates row-level security policy"

create policy "Admin can upload question images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'question-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and is_admin
    )
  );
