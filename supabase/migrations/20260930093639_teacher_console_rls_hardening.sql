create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_non_anonymous_user()
returns boolean language sql stable security definer
set search_path = public, auth
as $$
  select (select auth.uid()) is not null
    and coalesce((select auth.jwt())->>'is_anonymous', 'false') <> 'true';
$$;

create or replace function private.is_teacher_for_class(p_classroom_id uuid)
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classrooms c
    where c.classroom_id = p_classroom_id
      and c.teacher_id = (select auth.uid())
  );
$$;

create or replace function private.is_student_in_class(p_classroom_id uuid)
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.student_profiles s
    where s.classroom_id = p_classroom_id
      and s.auth_user_id = (select auth.uid())
      and s.active = true
  );
$$;

create or replace function private.teacher_can_view_student(p_student_id uuid)
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.student_profiles s
    join public.classrooms c on c.classroom_id = s.classroom_id
    where s.auth_user_id = p_student_id
      and c.teacher_id = (select auth.uid())
  );
$$;

grant execute on function private.is_non_anonymous_user() to authenticated;
grant execute on function private.is_teacher_for_class(uuid) to authenticated;
grant execute on function private.is_student_in_class(uuid) to authenticated;
grant execute on function private.teacher_can_view_student(uuid) to authenticated;

create index if not exists assignment_attempts_student_id_idx
  on public.assignment_attempts(student_id);
create index if not exists weekly_assignments_created_by_idx
  on public.weekly_assignments(created_by);

drop policy if exists teacher_profiles_select_own on public.teacher_profiles;
create policy teacher_profiles_select_own on public.teacher_profiles
for select to authenticated
using ((select auth.uid()) = auth_user_id);

drop policy if exists teacher_profiles_insert_own on public.teacher_profiles;
create policy teacher_profiles_insert_own on public.teacher_profiles
for insert to authenticated
with check (
  private.is_non_anonymous_user()
  and (select auth.uid()) = auth_user_id
  and coalesce((select auth.jwt())->'app_metadata'->>'app_role', '') <> 'student'
);

drop policy if exists teacher_profiles_update_own on public.teacher_profiles;
create policy teacher_profiles_update_own on public.teacher_profiles
for update to authenticated
using (private.is_non_anonymous_user() and (select auth.uid()) = auth_user_id)
with check (private.is_non_anonymous_user() and (select auth.uid()) = auth_user_id);

drop policy if exists classrooms_teacher_all on public.classrooms;
create policy classrooms_teacher_all on public.classrooms
for all to authenticated
using (private.is_non_anonymous_user() and (select auth.uid()) = teacher_id)
with check (private.is_non_anonymous_user() and (select auth.uid()) = teacher_id);

drop policy if exists student_profiles_select_scope on public.student_profiles;
create policy student_profiles_select_scope on public.student_profiles
for select to authenticated
using ((select auth.uid()) = auth_user_id or private.is_teacher_for_class(classroom_id));

drop policy if exists student_profiles_teacher_update on public.student_profiles;
create policy student_profiles_teacher_update on public.student_profiles
for update to authenticated
using (private.is_teacher_for_class(classroom_id))
with check (private.is_teacher_for_class(classroom_id));

drop policy if exists student_profiles_teacher_delete on public.student_profiles;
create policy student_profiles_teacher_delete on public.student_profiles
for delete to authenticated
using (private.is_teacher_for_class(classroom_id));

drop policy if exists weekly_assignments_select_scope on public.weekly_assignments;
create policy weekly_assignments_select_scope on public.weekly_assignments
for select to authenticated
using (
  private.is_teacher_for_class(classroom_id)
  or private.is_student_in_class(classroom_id)
);

drop policy if exists weekly_assignments_teacher_insert on public.weekly_assignments;
create policy weekly_assignments_teacher_insert on public.weekly_assignments
for insert to authenticated
with check (
  private.is_non_anonymous_user()
  and (select auth.uid()) = created_by
  and private.is_teacher_for_class(classroom_id)
);

drop policy if exists weekly_assignments_teacher_update on public.weekly_assignments;
create policy weekly_assignments_teacher_update on public.weekly_assignments
for update to authenticated
using (private.is_teacher_for_class(classroom_id))
with check (
  private.is_non_anonymous_user()
  and (select auth.uid()) = created_by
  and private.is_teacher_for_class(classroom_id)
);

drop policy if exists weekly_assignments_teacher_delete on public.weekly_assignments;
create policy weekly_assignments_teacher_delete on public.weekly_assignments
for delete to authenticated
using (private.is_teacher_for_class(classroom_id));

drop policy if exists assignment_attempts_select_scope on public.assignment_attempts;
create policy assignment_attempts_select_scope on public.assignment_attempts
for select to authenticated
using (
  (select auth.uid()) = student_id
  or exists (
    select 1 from public.weekly_assignments a
    where a.assignment_id = assignment_attempts.assignment_id
      and private.is_teacher_for_class(a.classroom_id)
  )
);

drop policy if exists assignment_attempts_student_insert on public.assignment_attempts;
create policy assignment_attempts_student_insert on public.assignment_attempts
for insert to authenticated
with check (
  (select auth.uid()) = student_id
  and exists (
    select 1
    from public.student_profiles s
    join public.weekly_assignments a on a.classroom_id = s.classroom_id
    where s.auth_user_id = (select auth.uid())
      and s.active = true
      and a.assignment_id = assignment_attempts.assignment_id
      and a.status = 'published'
      and now() >= a.opens_at
      and now() <= a.due_at
      and (
        select count(*) from public.assignment_attempts prior
        where prior.assignment_id = assignment_attempts.assignment_id
          and prior.student_id = (select auth.uid())
      ) < a.max_attempts
  )
);

drop policy if exists student_learning_snapshots_select_scope on public.student_learning_snapshots;
create policy student_learning_snapshots_select_scope
on public.student_learning_snapshots for select to authenticated
using ((select auth.uid()) = auth_user_id or private.teacher_can_view_student(auth_user_id));

drop policy if exists student_learning_snapshots_insert_own on public.student_learning_snapshots;
create policy student_learning_snapshots_insert_own
on public.student_learning_snapshots for insert to authenticated
with check (
  (select auth.uid()) = auth_user_id
  and exists (
    select 1 from public.student_profiles s
    where s.auth_user_id = (select auth.uid()) and s.active = true
  )
);

drop policy if exists student_learning_snapshots_update_own on public.student_learning_snapshots;
create policy student_learning_snapshots_update_own
on public.student_learning_snapshots for update to authenticated
using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);

drop policy if exists research_events_select_own on public.research_events;
drop policy if exists research_events_teacher_select on public.research_events;
create policy research_events_select_scope on public.research_events
for select to authenticated
using ((select auth.uid()) = auth_user_id or private.teacher_can_view_student(auth_user_id));

drop policy if exists weekly_attempts_select_own on public.weekly_challenge_attempts;
drop policy if exists weekly_attempts_teacher_select on public.weekly_challenge_attempts;
create policy weekly_attempts_select_scope on public.weekly_challenge_attempts
for select to authenticated
using ((select auth.uid()) = auth_user_id or private.teacher_can_view_student(auth_user_id));
