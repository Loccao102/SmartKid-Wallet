# Roadmap — 3 tháng

## Phase 0 — Product reset
- [x] Chốt 4-map world concept
- [x] SmartMart là map duy nhất mở trong MVP
- [x] Bỏ Teacher Assignment khỏi core gameplay
- [x] Chốt 5 stall ↔ nhóm Toán cố định
- [x] Tách Unlock Exercise và Scenario
- [x] Chốt asset architecture
- [x] Domain types cho world map + exercise family
- [x] Seed data 4 map + exercise families đầu tiên

## Phase 1 — Student world UI
- [x] World map hiển thị 4 map, 3 locked
- [x] SmartMart entry/progress card
- [x] navigation shell: Home / Map / Mission / Leaderboard / Profile
- [x] Profile UI
- [x] Leaderboard UI
- [ ] responsive tablet/mobile
- [ ] asset placeholders → asset thật

## Phase 2 — Exercise engine
- [x] seeded RNG service
- [x] exercise instance model
- [x] generator constraints + generated-instance validation
- [x] 20 exercise families cho 5 stalls (4/gian)
- [x] 3 unlock families mỗi stall + 1 practice family
- [x] persistent long-term stall progression
- [x] unit tests generator nền tảng

## Phase 3 — SmartMart exploration + Mission
- [x] Phaser map shell
- [x] movement/interactions desktop + touch
- [x] product catalog MVP (14 sản phẩm)
- [x] cart/budget HUD cho Mission 01
- [ ] 3–5 Missions
  - [x] Mission 01 — Chuẩn bị liên hoan lớp
- [x] đi lại tự do giữa stall đã mở
- [x] checkout/completion engine + UI cho Mission 01

## Phase 4 — Scenario + Work Mode
- [x] Work Mode vertical slice — Ca làm việc 01
- [x] Phaser cashier scene: queue + counter + conveyor + POS state
- [x] 10 scenario templates
  - [x] damaged item / voucher / near-expiry / wrong price / duplicate scan / expired voucher / customer budget / low stock / extra cash / stale promo sign
- [ ] 5–6 customers/shift
  - [x] 3 customers trong Trainee Shift 01
- [x] 1–2 events/shift
- [x] employee rating
- [x] store reputation
- [x] customer satisfaction
- [x] bill adjustment từ scenario
- [x] persistent shift progress
- [x] Work Mode engine tests
- [ ] deferred consequences

## Phase 5 — Data + analytics
- [ ] Supabase schema + RLS
- [ ] attempts/events logging
- [ ] teacher class dashboard
- [ ] skill profile
- [ ] research export

## Phase 6 — Polish/pilot
- [ ] accessibility/reduced motion
- [ ] asset optimization
- [ ] PWA/performance
- [ ] pilot content validation
- [ ] fixed-seed research challenge
