-- SmartKid Wallet research event sink.
-- Canonical DDL. Apply to the dedicated SmartKid Supabase project.
-- Browser access is append-only: authenticated users may SELECT/INSERT only their own rows.

create table if not exists public.research_events (
  auth_user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  event_id text not null
    check (char_length(event_id) between 8 and 160),
  schema_version smallint not null
    check (schema_version = 1),
  session_id text not null
    check (char_length(session_id) between 8 and 200),
  event_type text not null
    check (
      event_type in (
        'shift_started',
        'math_attempt',
        'scenario_choice',
        'customer_settled',
        'consequence_resolved',
        'shift_completed'
      )
    ),
  occurred_at timestamptz not null,

  student_key text not null
    check (char_length(student_key) between 1 and 160),
  shift_id text not null
    check (char_length(shift_id) between 1 and 240),
  shift_template_id text,
  shift_template_version integer
    check (shift_template_version is null or shift_template_version > 0),
  shift_seed bigint,
  shift_variant_index integer
    check (shift_variant_index is null or shift_variant_index >= 0),

  customer_id text,
  customer_index integer
    check (customer_index is null or customer_index >= 0),
  scenario_id text,
  scenario_version integer
    check (scenario_version is null or scenario_version > 0),
  choice_id text,

  math_stage text
    check (math_stage is null or math_stage in ('total', 'change')),
  submitted_answer numeric,
  expected_answer numeric,
  correct boolean,
  attempt_number integer
    check (attempt_number is null or attempt_number >= 1),
  response_time_ms integer
    check (response_time_ms is null or response_time_ms >= 0),

  consequence_id text,
  consequence_instance_id text,

  before_state jsonb,
  after_state jsonb,
  metadata jsonb,

  inserted_at timestamptz not null default now(),

  primary key (auth_user_id, event_id)
);

comment on table public.research_events is
  'Append-only SmartKid Wallet research telemetry. Client UPDATE/DELETE is intentionally not granted.';

alter table public.research_events enable row level security;

drop policy if exists "research_events_select_own" on public.research_events;
create policy "research_events_select_own"
on public.research_events
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = auth_user_id
);

drop policy if exists "research_events_insert_own" on public.research_events;
create policy "research_events_insert_own"
on public.research_events
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = auth_user_id
);

-- Supabase 2026 Data API requires explicit grants for newly-created tables.
revoke all on table public.research_events from anon;
revoke all on table public.research_events from authenticated;
grant select, insert on table public.research_events to authenticated;

-- Server-side/admin integrations may read and append through a service key.
-- No client-side service key is ever allowed.
grant select, insert on table public.research_events to service_role;

create index if not exists research_events_user_occurred_idx
  on public.research_events (auth_user_id, occurred_at desc);

create index if not exists research_events_user_session_idx
  on public.research_events (auth_user_id, session_id, occurred_at);

create index if not exists research_events_type_scenario_idx
  on public.research_events (event_type, scenario_id, occurred_at desc)
  where scenario_id is not null;
