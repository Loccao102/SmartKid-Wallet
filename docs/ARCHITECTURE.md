# Architecture

## Stack
- React 19 + TypeScript
- Vite
- Phaser 4 cho gameplay/simulation layer
- Zustand cho local game state
- TanStack Query cho server state
- Zod cho validation content
- Supabase: Auth + Postgres + Storage + Realtime
- Static hosting/CDN cho web/PWA và stable game assets

## Frontend boundaries
src/
- assets/: asset registry, helpers
- domain/: types, rules, pure game logic
- data/: local MVP catalogs/templates
- features/: React UI by feature
- game/: Phaser scenes/adapters, lazy-loaded
- store/: Zustand state
- lib/: Supabase, seeded random, utilities

React chịu trách nhiệm navigation, world map, profile, leaderboard, dashboard, HUD và modal.

Phaser chịu trách nhiệm scene, character movement, spatial interaction, NPC, animation/tween khi bước vào gameplay.

## Core content flow
### Unlock exercise
**Stall → Exercise Family → Seeded Generator → Exercise Instance → Attempt → Progress**

### Mission/scenario
**Mission → World State → Scenario Template → Scenario Instance → Decision → Effects → Event Log**

### Research telemetry
**Interaction → immutable ResearchEvent v1 → local append-only store → JSON/CSV export → future Supabase research_events**

Hai flow tách biệt.

## World model
- 4 map hiển thị từ đầu;
- SmartMart available;
- Tiny Bank, Happy Restaurant, Weekend Market locked;
- map unlock là account progression dài hạn.

## Suggested Supabase entities
Identity/class: profiles, classes, class_members.

World: maps, student_map_progress, stalls, student_stall_progress, products.

Math: exercise_families, exercise_family_versions, exercise_instances, exercise_attempts.

Mission: missions, mission_versions, student_missions.

Scenario/work: scenario_templates, scenario_versions, scenario_instances, decisions, shifts, shift_events.\n\nResearch: research_events (append-only, schema-versioned, JSONB before/after/metadata).

Gamification: achievements, student_achievements, leaderboard_snapshots.

## Security
- RLS trên mọi bảng exposed.
- Học sinh chỉ đọc/sửa progress/attempt của chính mình theo policy.
- Giáo viên chỉ xem dữ liệu lớp mình quản lý.
- Admin content write phải tách quyền.
- Không đưa service role vào frontend.
- UPDATE policy có USING + WITH CHECK.
- Random/instance đã phát cho học sinh không được client tự đổi seed/parameters.

## Asset architecture
Stable game assets nằm trong public/assets và được truy cập qua src/assets/registry.ts.

Asset quản lý bằng CMS/seasonal content mới dùng Supabase Storage.

Chi tiết: docs/ASSET_SYSTEM.md.

## Cost principle
MVP không cần VPS, microservice, Redis, queue hoặc Kubernetes.
