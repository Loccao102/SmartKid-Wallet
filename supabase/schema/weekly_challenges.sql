-- SmartKid Wallet weekly challenge competition.
-- Attempts are append-only. The public leaderboard contains no auth UUID or child PII.

create table if not exists public.weekly_challenge_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  challenge_id text not null,
  challenge_version integer not null check (challenge_version > 0),
  week_key date not null,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  stars smallint not null check (stars between 1 and 5),
  elapsed_ms integer not null check (elapsed_ms >= 0 and elapsed_ms <= 3600000),
  first_try_correct smallint not null check (first_try_correct >= 0),
  total_questions smallint not null check (total_questions > 0),
  math_attempts smallint not null check (math_attempts >= total_questions),
  decision_quality numeric(5,4) not null check (decision_quality >= 0 and decision_quality <= 1),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint weekly_challenge_identity_check check (
    challenge_id =
      'smartmart-week-' || week_key::text || '-v' || challenge_version::text
  ),
  constraint weekly_first_try_check check (
    first_try_correct <= total_questions
  ),
  constraint weekly_star_score_check check (
    stars = case
      when score >= 95 then 5
      when score >= 85 then 4
      when score >= 75 then 3
      when score >= 65 then 2
      else 1
    end
  )
);

comment on table public.weekly_challenge_attempts is
  'Append-only weekly SmartMart challenge attempts. Users can read/insert only their own attempts.';

create index if not exists weekly_challenge_attempts_user_challenge_idx
  on public.weekly_challenge_attempts (auth_user_id, challenge_id, completed_at desc);

create index if not exists weekly_challenge_attempts_challenge_score_idx
  on public.weekly_challenge_attempts (challenge_id, score desc, elapsed_ms asc);

alter table public.weekly_challenge_attempts enable row level security;

drop policy if exists weekly_attempts_select_own on public.weekly_challenge_attempts;
create policy weekly_attempts_select_own
  on public.weekly_challenge_attempts
  for select
  to authenticated
  using ((select auth.uid()) = auth_user_id);

drop policy if exists weekly_attempts_insert_own on public.weekly_challenge_attempts;
create policy weekly_attempts_insert_own
  on public.weekly_challenge_attempts
  for insert
  to authenticated
  with check ((select auth.uid()) = auth_user_id);

revoke all on table public.weekly_challenge_attempts from anon;
revoke all on table public.weekly_challenge_attempts from authenticated;
grant select, insert on table public.weekly_challenge_attempts to authenticated;

create table if not exists public.weekly_challenge_leaderboard (
  challenge_id text not null,
  challenge_version integer not null,
  week_key date not null,
  player_code text not null,
  best_score numeric(5,2) not null,
  best_stars smallint not null,
  best_elapsed_ms integer not null,
  best_first_try_correct smallint not null,
  attempts integer not null default 1 check (attempts > 0),
  updated_at timestamptz not null default now(),
  primary key (challenge_id, player_code)
);

comment on table public.weekly_challenge_leaderboard is
  'Safe competitive projection for weekly SmartMart challenges. Contains no auth UUID, name, email or child PII.';

create index if not exists weekly_challenge_leaderboard_rank_idx
  on public.weekly_challenge_leaderboard
    (challenge_id, best_score desc, best_elapsed_ms asc, updated_at asc);

alter table public.weekly_challenge_leaderboard enable row level security;

drop policy if exists weekly_leaderboard_read on public.weekly_challenge_leaderboard;
create policy weekly_leaderboard_read
  on public.weekly_challenge_leaderboard
  for select
  to authenticated
  using (true);

revoke all on table public.weekly_challenge_leaderboard from anon;
revoke all on table public.weekly_challenge_leaderboard from authenticated;
grant select on table public.weekly_challenge_leaderboard to authenticated;

create or replace function public.sync_weekly_challenge_leaderboard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  safe_player_code text;
begin
  safe_player_code :=
    'Bạn ' || upper(substr(md5(new.auth_user_id::text || ':smartkid-weekly-v1'), 1, 6));

  insert into public.weekly_challenge_leaderboard (
    challenge_id,
    challenge_version,
    week_key,
    player_code,
    best_score,
    best_stars,
    best_elapsed_ms,
    best_first_try_correct,
    attempts,
    updated_at
  )
  values (
    new.challenge_id,
    new.challenge_version,
    new.week_key,
    safe_player_code,
    new.score,
    new.stars,
    new.elapsed_ms,
    new.first_try_correct,
    1,
    now()
  )
  on conflict (challenge_id, player_code)
  do update set
    attempts = public.weekly_challenge_leaderboard.attempts + 1,
    challenge_version = excluded.challenge_version,
    week_key = excluded.week_key,
    best_score = case
      when excluded.best_score > public.weekly_challenge_leaderboard.best_score
        or (
          excluded.best_score = public.weekly_challenge_leaderboard.best_score
          and excluded.best_elapsed_ms < public.weekly_challenge_leaderboard.best_elapsed_ms
        )
      then excluded.best_score
      else public.weekly_challenge_leaderboard.best_score
    end,
    best_stars = case
      when excluded.best_score > public.weekly_challenge_leaderboard.best_score
        or (
          excluded.best_score = public.weekly_challenge_leaderboard.best_score
          and excluded.best_elapsed_ms < public.weekly_challenge_leaderboard.best_elapsed_ms
        )
      then excluded.best_stars
      else public.weekly_challenge_leaderboard.best_stars
    end,
    best_elapsed_ms = case
      when excluded.best_score > public.weekly_challenge_leaderboard.best_score
        or (
          excluded.best_score = public.weekly_challenge_leaderboard.best_score
          and excluded.best_elapsed_ms < public.weekly_challenge_leaderboard.best_elapsed_ms
        )
      then excluded.best_elapsed_ms
      else public.weekly_challenge_leaderboard.best_elapsed_ms
    end,
    best_first_try_correct = case
      when excluded.best_score > public.weekly_challenge_leaderboard.best_score
        or (
          excluded.best_score = public.weekly_challenge_leaderboard.best_score
          and excluded.best_elapsed_ms < public.weekly_challenge_leaderboard.best_elapsed_ms
        )
      then excluded.best_first_try_correct
      else public.weekly_challenge_leaderboard.best_first_try_correct
    end,
    updated_at = now();

  return new;
end;
$$;

revoke execute on function public.sync_weekly_challenge_leaderboard()
  from public, anon, authenticated;

drop trigger if exists trg_sync_weekly_challenge_leaderboard
  on public.weekly_challenge_attempts;

create trigger trg_sync_weekly_challenge_leaderboard
after insert on public.weekly_challenge_attempts
for each row
execute function public.sync_weekly_challenge_leaderboard();
