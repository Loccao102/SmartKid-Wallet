# Architecture — SmartKid Wallet Production

## 1. Stack

- React 19 + TypeScript
- Vite
- Phaser 4
- Zustand
- TanStack Query
- Zod
- Supabase Auth/Postgres/Storage
- Vercel

## 2. Canonical repository

**Canonical source repository:**

```text
Loccao102/SmartKid-Wallet
```

Productionization phải loại bỏ tình trạng production deploy từ clone/fork khác.

Vercel production cần được reconnect về canonical repository trước pilot để:
- một commit = một source of truth;
- CI và production không lệch nhau;
- rollback/audit dễ hơn.

## 3. Frontend boundaries

```text
src/
  assets/     canonical asset registry
  data/       versioned content/data definitions
  domain/     pure rules/engine/types
  features/   React feature UI
  game/       Phaser scenes/adapters
  lib/        Supabase/sync/utilities
  store/      local/cache state
  types/      generated/shared types
```

React:
- navigation;
- forms;
- learning UI;
- HUD;
- result;
- teacher/research UI.

Phaser:
- spatial gameplay;
- NPC;
- scene;
- animation/tween.

Business rules không nằm trong Phaser scene.

## 4. Domain flows

### Learning

```text
Stall
→ Exercise Family/version
→ seeded generator
→ Exercise Instance
→ Attempt
→ Stall Progress
```

### Mission

```text
Mission/version
→ cart/plan
→ evaluation
→ completion
```

### Employee

```text
Shift Template/version
→ seeded instance
→ customer/task
→ calculation/decision
→ world effect
→ deferred consequence
→ completion
```

### Research

```text
Interaction
→ immutable ResearchEvent
→ local queue
→ Supabase research_events
```

## 5. Current backend

Dedicated Supabase project is live.

Current production-backed slice:
- Supabase Anonymous Auth;
- research_events;
- append-only INSERT/SELECT;
- owner-only RLS;
- offline queue;
- idempotent sync;
- smoke test.

Research telemetry is no longer “future Supabase”.

## 6. Production backend target

Add server source-of-truth for:
- profiles;
- classes/class_members;
- student progression;
- exercise instances/attempts;
- missions/student_missions;
- work shifts/progress;
- achievements;
- content versions.

Recommended separation:

### Identity
profiles, classes, class_members

### Learning
exercise_families, exercise_versions, exercise_instances, exercise_attempts, student_stall_progress

### Mission
mission_versions, student_missions

### Work
scenario_versions, shift_templates, shift_instances, shift_progress

### Research
research_events

## 7. State ownership

### Local-only/cache
- transient UI;
- current input;
- Phaser interaction state;
- offline queue.

### Server source of truth
Production:
- identity;
- progression;
- completed content;
- issued seeded instances;
- account-linked progress.

Không dùng localStorage làm nguồn sự thật dài hạn cho dữ liệu học tập production.

## 8. Security

- RLS trên mọi exposed table.
- service-role không bao giờ vào browser.
- anonymous user chỉ thấy dữ liệu của chính mình.
- teacher chỉ đọc lớp được cấp quyền.
- admin/content write tách role.
- UPDATE policy dùng USING + WITH CHECK.
- research events append-only.
- content version/seed đã phát không được client tự sửa.

## 9. Reliability

Production gate:
- route/feature Error Boundary;
- runtime fallback thay vì white screen;
- source maps/monitoring;
- Vercel deployment smoke;
- Supabase auth/RLS smoke;
- state migration test;
- critical-flow E2E:
  - unlock stall;
  - complete Mission;
  - enter Work Mode;
  - finish shift;
  - reload/resume.

## 10. Performance

- Phaser lazy-load;
- code split heavy gameplay;
- optimized WebP/AVIF/atlas;
- avoid unnecessary global store subscriptions;
- mobile memory/performance budget;
- no blocking research sync.

## 11. Cost principle

Production v1 vẫn không cần:
- microservices;
- Redis;
- Kafka;
- Kubernetes.

Supabase + Vercel đủ cho pilot/early production.
