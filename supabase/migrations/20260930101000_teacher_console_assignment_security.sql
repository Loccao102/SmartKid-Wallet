create or replace function private.can_submit_assignment(
  p_assignment_id uuid,
  p_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.weekly_assignments a
    join public.student_profiles s
      on s.classroom_id = a.classroom_id
     and s.auth_user_id = p_student_id
    where a.assignment_id = p_assignment_id
      and p_student_id = (select auth.uid())
      and s.active = true
      and a.status = 'published'
      and now() >= a.opens_at
      and now() <= a.due_at
      and (
        select count(*)
        from public.assignment_attempts prior
        where prior.assignment_id = p_assignment_id
          and prior.student_id = p_student_id
      ) < a.max_attempts
  );
$$;

grant execute on function private.can_submit_assignment(uuid, uuid)
to authenticated;

drop policy if exists weekly_assignments_select_scope
on public.weekly_assignments;

create policy weekly_assignments_select_scope
on public.weekly_assignments
for select
to authenticated
using (
  private.is_teacher_for_class(classroom_id)
  or (
    status in ('published', 'closed')
    and private.is_student_in_class(classroom_id)
  )
);

drop policy if exists assignment_attempts_student_insert
on public.assignment_attempts;

create policy assignment_attempts_student_insert
on public.assignment_attempts
for insert
to authenticated
with check (
  (select auth.uid()) = student_id
  and private.can_submit_assignment(assignment_id, student_id)
);
