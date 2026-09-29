# Supabase setup — SmartKid Wallet

## Current status

The repository is ready for Supabase research-event sync, but it must use a **dedicated SmartKid Wallet project**.

Do not reuse an unrelated Supabase project just because it is available in the same account.

## 1. Required project settings

After creating/selecting the dedicated SmartKid project:

1. Copy the project API URL into:

```env
VITE_SUPABASE_URL=
```

2. Copy a **publishable key** into:

```env
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Never put a service-role/secret key in Vite/browser environment variables.

3. For no-friction student onboarding, enable Supabase Auth **Anonymous Sign-Ins**.

Then set:

```env
VITE_SUPABASE_ANONYMOUS_AUTH=true
```

Anonymous Supabase users still use the Postgres `authenticated` role, so RLS must authorize by `auth.uid()`.

Before a public pilot, enable CAPTCHA/Cloudflare Turnstile for anonymous sign-ins to reduce abuse.

## 2. Research schema

Canonical DDL:

```text
supabase/schema/research_events.sql
```

The schema creates:

```text
public.research_events
```

with:
- composite primary key `(auth_user_id, event_id)`;
- explicit event-type/check constraints;
- JSONB before/after/metadata snapshots;
- indexes for owner/session/scenario queries;
- RLS enabled.

## 3. Data API grants

Supabase changed new-table exposure behavior in 2026. Do not rely on implicit grants.

The canonical SQL explicitly grants only:

```text
authenticated:
  SELECT
  INSERT
```

and explicitly gives `anon` no table access.

Client UPDATE and DELETE are intentionally unavailable.

## 4. RLS

Student select:

```sql
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = auth_user_id
)
```

Student insert:

```sql
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = auth_user_id
)
```

The browser sync code obtains `auth_user_id` from the active Supabase session. It does not trust a user ID inside the local research event.

## 5. Client sync

Relevant files:

```text
src/lib/supabase.ts
src/lib/researchRemote.ts
src/features/research/ResearchSyncBridge.tsx
src/store/researchLog.ts
```

Behavior:

```text
ResearchEvent
→ persisted local queue
→ background sync bridge
→ ensure Supabase session
→ batch up to 100 events
→ ON CONFLICT DO NOTHING semantics
→ mark local event ID synced
```

The app remains usable offline.

If Supabase is unavailable:
- gameplay continues;
- research events remain local;
- JSON/CSV export still works;
- sync retries when new work arrives / connection returns.

## 6. Anonymous Auth

When enabled:

```text
No session
→ signInAnonymously()
→ authenticated JWT
→ INSERT research_events under RLS
```

If anonymous auth is disabled and the app has no signed-in user, research events remain queued locally.

This lets the same research sink later work with Google/email/class-account auth without changing the event schema.

## 7. Sync status

The Work Mode result panel displays:
- Local only;
- events waiting to sync;
- synced;
- sync error.

Local export is independent of cloud sync.

## 8. Verification after applying schema

Run:
1. table/schema inspection;
2. RLS security advisor;
3. performance advisor;
4. authenticated insert test;
5. authenticated own-row select test;
6. attempt UPDATE/DELETE and confirm they fail;
7. attempt cross-user SELECT and confirm no row is visible.

Do not consider the backend deployment complete until these checks pass.

## 9. Future teacher access

Teacher access is intentionally **not** added to `research_events` yet.

When classes/class_members are implemented:
- add teacher read through authorized class membership;
- do not weaken the student-own-row policy;
- prefer a security-invoker analytics view or carefully reviewed policy;
- keep client research events append-only.
