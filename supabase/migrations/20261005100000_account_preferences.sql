-- SmartKid Wallet — Account slice: per-account preferences.
-- Stores avatar + audio settings in Supabase so a signed-in student keeps
-- their look & sound across devices/browsers.
--
-- Security posture (AGENTS.md §12):
-- - RLS enabled; every policy is keyed on (select auth.uid()).
-- - Students may only read/write their own row (student_profiles.active = true).
-- - Teachers may read linked students' rows for classroom support only
--   (no insert/update/delete policies exist, so the row is write-protected
--   to the owning student by design).
-- - Anonymous sessions cannot touch this table at all.

create table if not exists public.user_preferences (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  avatar jsonb not null default '{}'::jsonb,
  audio jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

grant select, insert, update on public.user_preferences to authenticated;

drop policy if exists user_preferences_select_scope on public.user_preferences;
create policy user_preferences_select_scope
on public.user_preferences for select to authenticated
using (
  (select auth.uid()) = auth_user_id
  or private.teacher_can_view_student(auth_user_id)
);

drop policy if exists user_preferences_upsert_own on public.user_preferences;
create policy user_preferences_upsert_own
on public.user_preferences for insert to authenticated
with check (
  (select auth.uid()) = auth_user_id
  and exists (
    select 1 from public.student_profiles s
    where s.auth_user_id = (select auth.uid()) and s.active = true
  )
);

drop policy if exists user_preferences_update_own on public.user_preferences;
create policy user_preferences_update_own
on public.user_preferences for update to authenticated
using ((select auth.uid()) = auth_user_id)
with check (
  (select auth.uid()) = auth_user_id
  and exists (
    select 1 from public.student_profiles s
    where s.auth_user_id = (select auth.uid()) and s.active = true
  )
);
