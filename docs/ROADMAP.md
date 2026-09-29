# Roadmap — Production v1

## Baseline — Demo v0

Demo được coi là **đã chốt để làm nền**, không tiếp tục mở rộng breadth trước khi production quality đạt yêu cầu.

### Learning
- [x] 4-map concept
- [x] SmartMart map
- [x] 5 stall
- [x] 20 Exercise Family
- [x] seeded generator
- [x] 3 unlock family/stall
- [x] local stall progression

### Mission
- [x] Mission 01
- [x] cart/budget/evaluation

### Employee
- [x] Work Shift 01
- [x] Work Shift 02 seeded
- [x] 10 scenario
- [x] world state
- [x] deferred consequences
- [x] research event logging

### Backend slice
- [x] dedicated Supabase project
- [x] Anonymous Auth
- [x] research_events migration
- [x] RLS/grants
- [x] offline/idempotent research sync
- [x] Supabase smoke test

---

## P1 — Runtime & deployment hardening

- [ ] Vercel production reconnect về canonical repo `Loccao102/SmartKid-Wallet`
- [ ] xóa/archived repo clone production sau khi reconnect
- [ ] Error Boundary cho app + gameplay routes
- [ ] user-friendly crash recovery
- [ ] production source maps
- [ ] error monitoring
- [ ] critical E2E smoke
- [ ] state migration tests
- [ ] release/version display
- [ ] deployment rollback checklist

## P2 — Student UI/UX production redesign

- [ ] Learning visual language
- [ ] Employee visual language
- [ ] typography production cho lớp 4–5
- [ ] responsive tablet
- [ ] responsive mobile
- [ ] bottom navigation mobile
- [ ] exercise unlock celebration
- [ ] Mission UI polish
- [ ] Work Mode hierarchy redesign
- [ ] result screen: performance vs simulation
- [ ] bỏ research JSON/CSV/session detail khỏi student UI
- [ ] asset placeholder → production art
- [ ] reduced motion / accessibility

## P3 — Cloud identity & progression

- [ ] profiles
- [ ] anonymous → permanent account upgrade
- [ ] student stall progress server-side
- [ ] exercise instance/attempt persistence
- [ ] Mission persistence
- [ ] Work Shift persistence
- [ ] cross-device resume
- [ ] offline merge strategy
- [ ] RLS tests cho progression

## P4 — Content production

- [ ] versioned Exercise Family storage
- [ ] versioned Mission content
- [ ] versioned Scenario content
- [ ] Zod validation pipeline
- [ ] content migration rules
- [ ] educational review cho 20 family hiện tại
- [ ] thêm ít nhất 2 Mission chất lượng
- [ ] Work Mode interaction types đa dạng
- [ ] tune rating/consequence coefficients

## P5 — Teacher & Research workspace

- [ ] classes
- [ ] class_members
- [ ] teacher class dashboard
- [ ] skill/attempt analytics
- [ ] research session explorer
- [ ] JSON/CSV export chuyển khỏi student UI
- [ ] fixed-seed challenge
- [ ] data dictionary
- [ ] researcher/admin access policy

## P6 — Pilot readiness

- [ ] privacy/consent flow
- [ ] data retention policy
- [ ] CAPTCHA/Turnstile cho Anonymous Auth
- [ ] accessibility review
- [ ] performance budget
- [ ] backup/restore test
- [ ] content freeze/version pin cho nghiên cứu
- [ ] pilot checklist
- [ ] device/browser matrix test

## Deferred

Chưa ưu tiên trước Production v1:
- Tiny Bank gameplay;
- Restaurant gameplay;
- Weekend Market gameplay;
- social/multiplayer;
- monetization;
- advanced leaderboard;
- microservices/K8s.
