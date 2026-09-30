# Supabase — SmartKid Wallet

## 1. Live project

```text
Project: SmartKid-Wallet
Ref: mmppqzxkjbifizuiyrnx
Region: ap-southeast-1
```

Current live backend slice:
- Anonymous Auth: enabled;
- research_events: deployed;
- weekly_challenge_attempts: deployed, append-only, own SELECT/INSERT;
- weekly_challenge_leaderboard: deployed, authenticated SELECT-only safe projection;
- weekly leaderboard trigger stores pseudonymous player codes only;
- RLS: enabled on every exposed SmartKid table;
- client UPDATE/DELETE on attempts/research: blocked;
- smoke workflow: passing.

## 2. Research sync

```text
ResearchEvent
→ local persistent queue
→ background batch sync
→ authenticated/anonymous Supabase user
→ research_events
```

Offline gameplay không bị block.

## 3. Security rules

- publishable key được phép ở browser;
- service-role/secret key không được commit/frontend;
- RLS là bắt buộc;
- research event append-only;
- auth_user_id lấy từ session Supabase, không tin user ID trong payload local.

## 4. Weekly Arena backend

```text
WeeklyChallenge run
→ authenticated/anonymous Supabase user
→ weekly_challenge_attempts (append-only)
→ internal trigger
→ weekly_challenge_leaderboard (safe projection)
→ browser SELECT leaderboard
```

Ranking projection intentionally does **not** store auth UUID, child name, email or profile data.

Current browser permissions:
- attempts: SELECT own + INSERT own;
- leaderboard: SELECT only;
- trigger function: EXECUTE revoked from public/anon/authenticated.

Current limitation:
- score/evidence submission is not yet server-recomputed, so intentional client tampering is still possible. Add Edge Function/server verification before high-stakes competition.

Advisor notes after deployment:
- anonymous-auth policy warnings are expected while anonymous onboarding is intentionally enabled;
- new weekly indexes may show as unused until real traffic exists;
- leaked-password protection warning is unrelated to anonymous pilot accounts but must be reviewed before permanent password accounts.

## 5. Production next schema

Cần bổ sung:
- profiles;
- classes;
- class_members;
- student_stall_progress;
- exercise_instances;
- exercise_attempts;
- student_missions;
- shift_instances/progress.

Mọi schema mới:
1. migration source-controlled;
2. RLS review;
3. generated TS types;
4. CI/build;
5. advisor check;
6. smoke/integration test.

## 6. Anonymous account strategy

Production onboarding:
- có thể bắt đầu anonymous;
- sau đó upgrade/link sang account thật;
- progression phải giữ nguyên khi upgrade.

Trước pilot công khai:
- bật CAPTCHA/Turnstile;
- rate/abuse review;
- consent/privacy UX.

## 7. Research smoke

Workflow `Supabase Smoke` đã xác nhận:
- anonymous sign-in thành công;
- insert thành công;
- auth_user_id = auth.uid();
- own-row select thành công;
- UPDATE bị chặn;
- DELETE bị chặn.

## 8. Environment

Client có production URL/publishable-key fallback.

Production deployment có thể override qua:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_SUPABASE_ANONYMOUS_AUTH

Không đưa secret/service key vào Vite env.
