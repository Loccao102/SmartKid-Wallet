create table if not exists public.student_activity_submissions (
  submission_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(auth_user_id) on delete cascade,
  classroom_id uuid not null references public.classrooms(classroom_id) on delete cascade,
  activity_kind text not null check (activity_kind in ('class_assignment','shopping_mission','work_shift')),
  content_id text not null,
  assignment_id uuid references public.weekly_assignments(assignment_id) on delete set null,
  attempt_number integer not null check (attempt_number >= 1),
  score numeric not null check (score between 0 and 100),
  stars smallint not null check (stars between 1 and 5),
  elapsed_ms integer check (elapsed_ms between 0 and 3600000),
  criteria jsonb not null default '{}'::jsonb,
  cart jsonb,
  result jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.teacher_reviews (
  review_id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(auth_user_id) on delete cascade,
  student_id uuid not null references public.student_profiles(auth_user_id) on delete cascade,
  submission_id uuid references public.student_activity_submissions(submission_id) on delete set null,
  assignment_id uuid references public.weekly_assignments(assignment_id) on delete set null,
  comment text not null check (char_length(comment) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parent_profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parent_student_links (
  parent_id uuid primary key references public.parent_profiles(auth_user_id) on delete cascade,
  student_id uuid not null references public.student_profiles(auth_user_id) on delete cascade,
  linked_at timestamptz not null default now()
);

create table if not exists public.parent_link_codes (
  link_code text primary key check (link_code ~ '^[A-Z0-9]{8,16}$'),
  student_id uuid not null references public.student_profiles(auth_user_id) on delete cascade,
  created_by uuid not null references public.teacher_profiles(auth_user_id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function private.parent_can_view_student(p_student_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.parent_student_links l
    where l.parent_id = (select auth.uid()) and l.student_id = p_student_id
  );
$$;

grant execute on function private.parent_can_view_student(uuid) to authenticated;

alter table public.student_activity_submissions enable row level security;
alter table public.teacher_reviews enable row level security;
alter table public.parent_profiles enable row level security;
alter table public.parent_student_links enable row level security;
alter table public.parent_link_codes enable row level security;

create policy activity_submissions_select_scope on public.student_activity_submissions
for select to authenticated using (
  (select auth.uid()) = student_id
  or private.teacher_can_view_student(student_id)
  or private.parent_can_view_student(student_id)
);
create policy activity_submissions_student_insert on public.student_activity_submissions
for insert to authenticated with check (
  (select auth.uid()) = student_id
  and exists (
    select 1 from public.student_profiles s
    where s.auth_user_id = (select auth.uid())
      and s.classroom_id = student_activity_submissions.classroom_id
      and s.active = true
  )
);
create policy teacher_reviews_select_scope on public.teacher_reviews
for select to authenticated using (
  (select auth.uid()) = student_id
  or private.teacher_can_view_student(student_id)
  or private.parent_can_view_student(student_id)
);
create policy teacher_reviews_teacher_insert on public.teacher_reviews
for insert to authenticated with check (
  (select auth.uid()) = teacher_id and private.teacher_can_view_student(student_id)
);
create policy teacher_reviews_teacher_update on public.teacher_reviews
for update to authenticated using (
  (select auth.uid()) = teacher_id and private.teacher_can_view_student(student_id)
) with check (
  (select auth.uid()) = teacher_id and private.teacher_can_view_student(student_id)
);
create policy teacher_reviews_teacher_delete on public.teacher_reviews
for delete to authenticated using (
  (select auth.uid()) = teacher_id and private.teacher_can_view_student(student_id)
);
create policy parent_profiles_select_own on public.parent_profiles
for select to authenticated using ((select auth.uid()) = auth_user_id);
create policy parent_profiles_insert_own on public.parent_profiles
for insert to authenticated with check (
  private.is_non_anonymous_user()
  and (select auth.uid()) = auth_user_id
  and coalesce((select auth.jwt())->'app_metadata'->>'app_role', '') <> 'student'
);
create policy parent_profiles_update_own on public.parent_profiles
for update to authenticated using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);
create policy parent_links_select_own on public.parent_student_links
for select to authenticated using ((select auth.uid()) = parent_id);
create policy parent_link_codes_teacher_all on public.parent_link_codes
for all to authenticated using (
  (select auth.uid()) = created_by and private.teacher_can_view_student(student_id)
) with check (
  (select auth.uid()) = created_by and private.teacher_can_view_student(student_id)
);
create policy student_profiles_parent_select on public.student_profiles
for select to authenticated using (private.parent_can_view_student(auth_user_id));
create policy student_snapshots_parent_select on public.student_learning_snapshots
for select to authenticated using (private.parent_can_view_student(auth_user_id));
create policy assignment_attempts_parent_select on public.assignment_attempts
for select to authenticated using (private.parent_can_view_student(student_id));

grant select, insert on public.student_activity_submissions to authenticated;
grant select, insert, update, delete on public.teacher_reviews to authenticated;
grant select, insert, update on public.parent_profiles to authenticated;
grant select on public.parent_student_links to authenticated;
grant select, insert, update, delete on public.parent_link_codes to authenticated;
