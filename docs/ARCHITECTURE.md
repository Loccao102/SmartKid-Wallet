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
- teacher assignment builder;
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

Không nhét dashboard hoặc assignment editor vào Phaser.

## Core content flow
**Content bank → Teacher Assignment → Student Assignment → Scenario Engine → Game State → Scoring/Effects → Event Log → Analytics**

Học sinh không query content bank để tự chọn bài. Student app tải Assignment hợp lệ trước, sau đó resolve các content ID/version được giao.

## Assignment model
Tối thiểu cần các entity:
- assignments
- assignment_targets
- assignment_stalls
- assignment_items
- student_assignment_progress

Assignment phải có:
- teacher_id;
- class/target;
- status: draft/published/closed;
- grade;
- map;
- availability/deadline;
- completion_rule;
- full_shift_enabled.

`assignment_items` tham chiếu challenge/scenario ID và version hoặc rule chọn random.

## Supabase
Khi kết nối backend:
- profiles
- classes
- class_members
- stalls
- scenarios
- scenario_versions
- assignments
- assignment_targets
- assignment_stalls
- assignment_items
- student_assignment_progress
- shifts
- attempts
- decision_events
- achievements

## RLS requirements
- Giáo viên chỉ được tạo/sửa Assignment thuộc lớp mình quản lý.
- Học sinh chỉ đọc Assignment được giao trực tiếp hoặc qua lớp/nhóm mình thuộc về.
- Học sinh không được tự thêm assignment target.
- Attempt/progress phải được ràng buộc về Assignment hợp lệ.
- RLS bắt buộc trên mọi bảng exposed.

## Local prototype
Trước khi Supabase được nối, repo có thể dùng `demoAssignment` để mô phỏng payload server. Đây chỉ là fixture; UI student vẫn phải đi qua abstraction Assignment, không đọc thẳng tất cả challenge.

## Cost principle
MVP không thuê server riêng. Ưu tiên managed/free tier. Chỉ thêm server workload nếu có tác vụ thực sự không phù hợp client/Supabase.
