-- ═══════════════════════════════════════════════════════════
-- Appeldoorn Voice Agent · Feedback table
-- À exécuter UNE FOIS sur ton projet Supabase (SQL Editor)
-- ═══════════════════════════════════════════════════════════

create table if not exists voice_agent_feedback (
  id          uuid primary key default gen_random_uuid(),
  tester      text not null,
  channel     text default 'web',
  question_id integer not null,
  category    text not null,
  rating      text not null check (rating in ('good','medium','missing','halluc','tech','not_asked')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_vaf_tester      on voice_agent_feedback (tester);
create index if not exists idx_vaf_question_id on voice_agent_feedback (question_id);
create index if not exists idx_vaf_category    on voice_agent_feedback (category);
create index if not exists idx_vaf_created_at  on voice_agent_feedback (created_at desc);

-- ── Row-Level Security ─────────────────────────────────────
alter table voice_agent_feedback enable row level security;

-- Drop existing policies if rerunning
drop policy if exists vaf_anon_insert on voice_agent_feedback;
drop policy if exists vaf_anon_select on voice_agent_feedback;

-- Anyone with the anon key can insert a feedback row
create policy vaf_anon_insert
  on voice_agent_feedback
  for insert
  to anon
  with check (
    char_length(tester) between 1 and 80
    and question_id between 1 and 1000
    and char_length(category) <= 40
  );

-- Anyone with the anon key can read aggregate data (no PII concerns — just first names + ratings)
create policy vaf_anon_select
  on voice_agent_feedback
  for select
  to anon
  using (true);

-- ═══════════════════════════════════════════════════════════
-- Vérification (optionnel — exécuter après pour tester)
-- ═══════════════════════════════════════════════════════════
-- insert into voice_agent_feedback (tester, channel, question_id, category, rating)
--   values ('test', 'web', 1, 'appeldoorn', 'good');
-- select count(*) from voice_agent_feedback;
-- delete from voice_agent_feedback where tester = 'test';
