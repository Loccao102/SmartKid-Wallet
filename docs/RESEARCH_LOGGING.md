# Research Logging — Production Status

## 1. Trạng thái

Research logging đã chạy thật với:
- append-only ResearchEvent v1;
- local offline queue;
- Supabase `research_events`;
- owner-only RLS;
- Anonymous Auth;
- idempotent background sync;
- GitHub Actions smoke test.

Supabase không còn là “future target”.

## 2. Event principles

- immutable/append-only;
- schema-versioned;
- pseudonymous student identity;
- seed/template/version đủ để replay;
- before/after snapshot khi có state transition;
- mọi math attempt đều được log;
- consequence resolve là event riêng.

## 3. Privacy

Không log vào event:
- tên thật;
- email;
- số điện thoại;
- free-text PII.

Production research phải có:
- consent/notice phù hợp pilot;
- retention policy;
- access policy;
- data dictionary.

## 4. Current Work Mode events

- shift_started
- math_attempt
- scenario_choice
- customer_settled
- consequence_resolved
- shift_completed

## 5. Production expansion

Dùng cùng event architecture cho:
- unlock exercise;
- Mission;
- progression;
- achievement;
- fixed research challenge.

Không tạo logger riêng cho từng feature.

## 6. Student UI boundary

Demo hiện có export JSON/CSV ở result screen.

**Production requirement:** chuyển export/session/schema detail sang Researcher/Admin workspace.

Student chỉ thấy trạng thái lưu thân thiện.

## 7. Analysis

Có thể tính:
- first-attempt accuracy;
- attempts;
- response time;
- self-correction;
- scenario choice distribution;
- consequence frequency;
- shift completion;
- metric trajectory.

## 8. Research comparability

Để dùng cho NCKH:
- pin content version;
- pin seed hoặc challenge set khi cần so sánh;
- lưu app/content version;
- không thay rubric giữa các nhóm mà không version;
- audit missing/duplicate events.
