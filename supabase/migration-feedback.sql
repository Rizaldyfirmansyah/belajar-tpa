-- ============================================================
-- Migration: Tabel feedback / saran dari user
-- Run this in Supabase SQL Editor
-- ============================================================

create table if not exists feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete set null,
  kind        text default 'saran' check (kind in ('saran', 'bug', 'lainnya')),
  message     text not null,
  page        text,
  created_at  timestamptz default now()
);

create index if not exists feedback_created_at_idx on feedback(created_at desc);

alter table feedback enable row level security;

-- User hanya boleh mengirim atas namanya sendiri...
create policy "Users can submit own feedback"
  on feedback for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ...dan hanya bisa membaca kiriman miliknya sendiri.
-- Admin membaca semuanya lewat Supabase dashboard (service role bypass RLS),
-- jadi belum perlu policy khusus admin.
create policy "Users can read own feedback"
  on feedback for select
  using (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
