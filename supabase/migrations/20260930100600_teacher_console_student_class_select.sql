drop policy if exists classrooms_select_scope on public.classrooms;
create policy classrooms_select_scope
on public.classrooms for select to authenticated
using (
  (select auth.uid()) = teacher_id
  or private.is_student_in_class(classroom_id)
);
