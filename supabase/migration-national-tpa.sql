-- ============================================================
-- Migration: UPDA ITB → TPA Nasional
-- Run this in Supabase SQL Editor ONCE on the existing database
-- ============================================================

-- 1. Drop old constraints
alter table questions drop constraint if exists questions_subtest_check;
alter table questions drop constraint if exists questions_topic_check;

-- 2. Rename subtest values
update questions set subtest = 'numerik' where subtest = 'kuantitatif';

-- 3. Rename topic values
update questions set topic = 'analogi'        where topic = 'padanan_kata';
update questions set topic = 'logika_analisa' where topic = 'logika_matematika';
update questions set topic = 'logika_cerita'  where topic = 'logika_angka';

-- 4. Remove topics no longer used
delete from bookmarks     where question_id in (select id from questions where topic = 'logika_visual');
delete from drill_answers  where question_id in (select id from questions where topic = 'logika_visual');
delete from tryout_answers where question_id in (select id from questions where topic = 'logika_visual');
delete from questions where topic = 'logika_visual';

-- 5. Add new constraints
alter table questions add constraint questions_subtest_check
  check (subtest in ('verbal', 'numerik', 'logika', 'spasial'));

alter table questions add constraint questions_topic_check
  check (topic in (
    'sinonim', 'antonim', 'analogi', 'pengelompokan', 'pemahaman_teks',
    'aritmetika', 'deret_bilangan', 'operasi_matematika', 'analisis_data',
    'logika_formal', 'logika_analisa', 'logika_cerita'
  ));

-- 6. Rename tryout_sessions column
alter table tryout_sessions rename column score_kuantitatif to score_numerik;

-- 7. Update subtest values in answer tables (for existing data consistency)
update tryout_answers set subtest = 'numerik' where subtest = 'kuantitatif';
update drill_answers   set subtest = 'numerik' where subtest = 'kuantitatif';

-- 8. Update topic values in answer tables
update tryout_answers set topic = 'analogi'        where topic = 'padanan_kata';
update tryout_answers set topic = 'logika_analisa' where topic = 'logika_matematika';
update tryout_answers set topic = 'logika_cerita'  where topic = 'logika_angka';

update drill_answers set topic = 'analogi'        where topic = 'padanan_kata';
update drill_answers set topic = 'logika_analisa' where topic = 'logika_matematika';
update drill_answers set topic = 'logika_cerita'  where topic = 'logika_angka';
