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

- [x] Vercel production reconnect về canonical repo `Loccao102/SmartKid-Wallet`
  - [x] mirror repo được đánh dấu deployment-only
  - [x] reconnect procedure được ghi trong docs/DEPLOYMENT.md
  - [x] tracking issue #1 được tạo
  - [x] thực hiện Vercel Git reconnect + verify metadata production
- [ ] archive repo clone production sau khi reconnect + verify
- [x] recoverable Error Boundary cho student feature screens
- [x] user-friendly crash recovery về bản đồ
- [ ] production source maps
- [ ] error monitoring
- [ ] critical E2E smoke
- [ ] state migration tests
- [ ] release/version display
- [ ] deployment rollback checklist

## P2 — Student UI/UX production redesign

- [x] Learning visual language foundation
- [x] Employee visual language foundation
- [ ] typography production cho lớp 4–5
- [ ] responsive tablet
- [ ] responsive mobile
- [x] bottom navigation mobile
- [x] exercise unlock celebration
- [ ] Mission UI polish
- [ ] Work Mode hierarchy redesign
- [x] result screen: performance vs simulation + 1–5★ mastery
- [ ] bỏ research JSON/CSV/session detail khỏi student UI
- [ ] asset placeholder → production art
- [ ] reduced motion / accessibility

## P2.5 — Game progression foundation

- [x] persistent local XP / level / coin economy
- [x] level-up +100 xu
- [x] retry fee 5 → 10 → 15 → 20 → 25 → max 30
- [x] free recovery path khi không đủ xu
- [x] Practice retry miễn phí, không farm XP
- [x] hidden 100-point mastery score → 1–5★
- [x] best-star/best-score replay records
- [x] teacher 5★ challenge reward model
- [x] map unlock requirements theo level + prerequisite
- [x] playable seeded Daily Challenge
- [x] Music / Ambient / SFX mix settings
- [x] procedural chill audio foundation + game SFX
- [ ] final original/licensed music and ambient assets
- [ ] cosmetic coin sinks
- [ ] level-up celebration / reward presentation polish

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
- [x] thêm mission ladder SmartMart (4 Shopping Mission definitions)
- [~] Work Mode trade-off v2 + hidden consequence; tiếp tục đa dạng interaction type
- [~] hidden star scoring v1 + scenario trade-off v2; cần pilot để tune coefficients

## P5 — Teacher & Research workspace

- [ ] classes
- [ ] class_members
- [ ] teacher class dashboard
- [ ] skill/attempt analytics
- [ ] research session explorer
- [ ] JSON/CSV export chuyển khỏi student UI
- [x] seeded Daily Challenge foundation; class challenge vẫn cần teacher workspace
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
