drop policy if exists classrooms_select_scope on public.classrooms;
create policy classrooms_select_scope
on public.classrooms for select to authenticated
using (
  (select auth.uid()) = teacher_id
  or private.is_student_in_class(classroom_id)
  or exists (
    select 1
    from public.parent_student_links l
    join public.student_profiles s on s.auth_user_id = l.student_id
    where l.parent_id = (select auth.uid())
      and s.classroom_id = classrooms.classroom_id
  )
);

drop policy if exists weekly_assignments_select_scope on public.weekly_assignments;
create policy weekly_assignments_select_scope
on public.weekly_assignments for select to authenticated
using (
  private.is_teacher_for_class(classroom_id)
  or (
    status in ('published', 'closed')
    and private.is_student_in_class(classroom_id)
  )
  or (
    status in ('published', 'closed')
    and exists (
      select 1
      from public.parent_student_links l
      join public.student_profiles s on s.auth_user_id = l.student_id
      where l.parent_id = (select auth.uid())
        and s.classroom_id = weekly_assignments.classroom_id
    )
  )
);
