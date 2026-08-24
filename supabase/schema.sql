-- ============================================================
-- TPA Nasional — Supabase Schema
-- Run this in Supabase SQL Editor after creating a new project
-- ============================================================

-- --------------------------------------------------------
-- PROFILES
-- --------------------------------------------------------
create table if not exists profiles (
  id            uuid references auth.users primary key,
  name          text not null,
  target_score  integer default 475,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- --------------------------------------------------------
-- QUESTIONS
-- --------------------------------------------------------
create table if not exists questions (
  id            uuid primary key default gen_random_uuid(),
  subtest       text not null check (subtest in ('verbal', 'numerik', 'logika', 'spasial')),
  topic         text not null check (topic in (
    'sinonim', 'antonim', 'analogi', 'pengelompokan', 'pemahaman_teks',
    'aritmetika', 'deret_bilangan', 'operasi_matematika', 'analisis_data',
    'logika_formal', 'logika_analisa', 'logika_cerita'
  )),
  question_type text default 'text' check (question_type in ('text', 'visual')),
  question      text,
  options       jsonb,
  answer        text,
  explanation   text,
  difficulty    text default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  visual_data   jsonb,
  is_validated  boolean default false,
  created_at    timestamptz default now()
);

create index if not exists questions_topic_idx on questions(topic);
create index if not exists questions_subtest_idx on questions(subtest);
create index if not exists questions_type_idx on questions(question_type);

alter table questions enable row level security;

create policy "Authenticated users can read questions"
  on questions for select
  using (auth.role() = 'authenticated');

-- --------------------------------------------------------
-- TRYOUT SESSIONS
-- --------------------------------------------------------
create table if not exists tryout_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references profiles(id) on delete cascade not null,
  status              text default 'in_progress' check (status in ('in_progress', 'completed')),
  score_verbal        integer,
  score_numerik       integer,
  score_logika        integer,
  score_final         integer,
  topic_scores        jsonb,
  topic_accuracy      jsonb,
  topic_avg_time      jsonb,
  ai_summary          text,
  ai_generated_at     timestamptz,
  started_at          timestamptz default now(),
  completed_at        timestamptz,
  duration_seconds    integer,
  attempt_number      integer default 1
);

create index if not exists tryout_sessions_user_idx on tryout_sessions(user_id);
create index if not exists tryout_sessions_status_idx on tryout_sessions(status);

alter table tryout_sessions enable row level security;

create policy "Users manage own sessions"
  on tryout_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --------------------------------------------------------
-- TRYOUT ANSWERS
-- --------------------------------------------------------
create table if not exists tryout_answers (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references tryout_sessions(id) on delete cascade not null,
  question_id     uuid references questions(id),
  user_id         uuid references profiles(id) on delete cascade,
  user_answer     text,
  is_correct      boolean,
  subtest         text,
  topic           text,
  time_spent_sec  integer,
  answered_at     timestamptz
);

create index if not exists tryout_answers_session_idx on tryout_answers(session_id);
create index if not exists tryout_answers_user_idx on tryout_answers(user_id);

alter table tryout_answers enable row level security;

create policy "Users manage own answers"
  on tryout_answers for all
  using (
    session_id in (
      select id from tryout_sessions where user_id = auth.uid()
    )
  );

-- Also allow user_id-based access for analytics
create policy "Users read own answers by user_id"
  on tryout_answers for select
  using (auth.uid() = user_id);

-- --------------------------------------------------------
-- DRILL ANSWERS
-- --------------------------------------------------------
create table if not exists drill_answers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade not null,
  question_id     uuid references questions(id),
  user_answer     text,
  is_correct      boolean,
  topic           text,
  subtest         text,
  time_spent_sec  integer,
  answered_at     timestamptz default now()
);

create index if not exists drill_answers_user_idx on drill_answers(user_id);
create index if not exists drill_answers_topic_idx on drill_answers(topic);

alter table drill_answers enable row level security;

create policy "Users manage own drill answers"
  on drill_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --------------------------------------------------------
-- BOOKMARKS
-- --------------------------------------------------------
create table if not exists bookmarks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade not null,
  question_id     uuid references questions(id) on delete cascade not null,
  created_at      timestamptz default now(),
  unique (user_id, question_id)
);

create index if not exists bookmarks_user_idx on bookmarks(user_id);

alter table bookmarks enable row level security;

create policy "Users manage own bookmarks"
  on bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --------------------------------------------------------
-- STUDY STREAKS
-- --------------------------------------------------------
create table if not exists study_streaks (
  user_id         uuid references profiles(id) on delete cascade primary key,
  current_streak  integer default 0,
  longest_streak  integer default 0,
  last_activity   date
);

alter table study_streaks enable row level security;

create policy "Users manage own streak"
  on study_streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --------------------------------------------------------
-- AI ANALYSIS CACHE
-- --------------------------------------------------------
create table if not exists ai_analysis_cache (
  user_id         uuid references profiles(id) on delete cascade primary key,
  analysis_text   text,
  generated_at    timestamptz,
  expires_at      timestamptz
);

alter table ai_analysis_cache enable row level security;

create policy "Users manage own analysis cache"
  on ai_analysis_cache for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
