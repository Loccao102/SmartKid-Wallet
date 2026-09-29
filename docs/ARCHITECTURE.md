# Architecture

## Stack
- React 19 + TypeScript
- Vite
- Phaser 4 cho simulation layer
- Zustand cho local game state
- TanStack Query cho server state
- Zod cho validation content
- Supabase: Auth + Postgres + Storage + Realtime
- Static hosting/CDN cho web/PWA và game assets

## Frontend boundaries
```
src/
  domain/        # types, rules, pure scoring/progression logic
  data/          # temporary local content for MVP
  features/      # React UI by feature
  game/          # Phaser scenes/adapters (lazy-loaded)
  store/         # Zustand stores
  lib/           # Supabase, random, utils
```

## Important boundary
React chịu trách nhiệm:
- navigation;
- dashboard;
- HUD;
- modal;
- student/teacher/parent UI.

Phaser chịu trách nhiệm khi simulation bắt đầu:
- scene;
- NPC movement;
- interaction;
- spatial game objects;
- animation/tween.

Không nhét dashboard vào Phaser.

## Data flow
Scenario JSON/CMS → Zod validation → scenario engine → game state → scoring/effects → event log → Supabase.

## Supabase
Khi kết nối backend:
- profiles
- classes
- class_members
- stalls
- scenarios
- scenario_versions
- shifts
- attempts
- decision_events
- achievements

RLS bắt buộc trên mọi bảng exposed.

## Cost principle
MVP không thuê server riêng. Ưu tiên managed/free tier. Chỉ thêm server workload nếu có tác vụ thực sự không phù hợp client/Supabase.
