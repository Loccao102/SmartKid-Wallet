create table if not exists public.teacher_profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  school_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classrooms (
  classroom_id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(auth_user_id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  grade_level smallint check (grade_level between 1 and 12),
  academic_year text not null default '2026-2027',
  join_code text not null unique check (join_code ~ '^[A-Z0-9]{5,12}$'),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists classrooms_teacher_id_idx on public.classrooms(teacher_id);

create table if not exists public.student_profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(classroom_id) on delete cascade,
  username text not null check (username ~ '^[a-z0-9._-]{3,32}$'),
  display_name text not null check (char_length(display_name) between 1 and 120),
  student_code text not null unique check (char_length(student_code) between 5 and 40),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create unique index if not exists student_profiles_class_username_idx
  on public.student_profiles(classroom_id, lower(username));
create index if not exists student_profiles_classroom_id_idx
  on public.student_profiles(classroom_id);

create table if not exists public.weekly_assignments (
  assignment_id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(classroom_id) on delete cascade,
  created_by uuid not null references public.teacher_profiles(auth_user_id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text,
  week_key date not null,
  opens_at timestamptz not null,
  due_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  challenge_version integer not null default 1 check (challenge_version > 0),
  challenge_seed bigint not null,
  challenge_json jsonb not null,
  max_attempts smallint not null default 3 check (max_attempts between 1 and 20),
  xp_reward integer not null default 60 check (xp_reward between 0 and 10000),
  coin_reward integer not null default 50 check (coin_reward between 0 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_at > opens_at)
);

create index if not exists weekly_assignments_classroom_week_idx
  on public.weekly_assignments(classroom_id, week_key desc);

create table if not exists public.assignment_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.weekly_assignments(assignment_id) on delete cascade,
  student_id uuid not null references public.student_profiles(auth_user_id) on delete cascade,
  score numeric not null check (score between 0 and 100),
  stars smallint not null check (stars between 1 and 5),
  elapsed_ms integer not null check (elapsed_ms between 0 and 3600000),
  first_try_correct smallint not null check (first_try_correct >= 0),
  total_questions smallint not null check (total_questions > 0),
  math_attempts smallint not null check (math_attempts >= 0),
  decision_quality numeric not null check (decision_quality between 0 and 1),
  payload jsonb,
  completed_at timestamptz not null default now()
);

create index if not exists assignment_attempts_assignment_student_idx
  on public.assignment_attempts(assignment_id, student_id, completed_at desc);

create table if not exists public.student_learning_snapshots (
  auth_user_id uuid primary key references public.student_profiles(auth_user_id) on delete cascade,
  level integer not null default 1 check (level >= 1),
  total_xp integer not null default 0 check (total_xp >= 0),
  coins integer not null default 0 check (coins >= 0),
  mastery jsonb not null default '{}'::jsonb,
  completed_world_chapters text[] not null default '{}',
  completed_missions text[] not null default '{}',
  activity_results jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.teacher_profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.student_profiles enable row level security;
alter table public.weekly_assignments enable row level security;
alter table public.assignment_attempts enable row level security;
alter table public.student_learning_snapshots enable row level security;

grant select, insert, update on public.teacher_profiles to authenticated;
grant select, insert, update, delete on public.classrooms to authenticated;
grant select, update, delete on public.student_profiles to authenticated;
grant select, insert, update, delete on public.weekly_assignments to authenticated;
grant select, insert on public.assignment_attempts to authenticated;
grant select, insert, update on public.student_learning_snapshots to authenticated;
