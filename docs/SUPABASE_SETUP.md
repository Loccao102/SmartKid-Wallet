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
- RLS: enabled;
- authenticated: SELECT + INSERT own rows;
- client UPDATE/DELETE: blocked;
- security advisor: clean at deployment check;
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

## 4. Production next schema

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

## 5. Anonymous account strategy

Production onboarding:
- có thể bắt đầu anonymous;
- sau đó upgrade/link sang account thật;
- progression phải giữ nguyên khi upgrade.

Trước pilot công khai:
- bật CAPTCHA/Turnstile;
- rate/abuse review;
- consent/privacy UX.

## 6. Research smoke

Workflow `Supabase Smoke` đã xác nhận:
- anonymous sign-in thành công;
- insert thành công;
- auth_user_id = auth.uid();
- own-row select thành công;
- UPDATE bị chặn;
- DELETE bị chặn.

## 7. Environment

Client có production URL/publishable-key fallback.

Production deployment có thể override qua:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_SUPABASE_ANONYMOUS_AUTH

Không đưa secret/service key vào Vite env.
