# SmartKid Wallet

Web nhập vai giáo dục cho học sinh lớp 4–5, kết hợp **Toán học + giáo dục tài chính + ra quyết định + trách nhiệm**.

## Product model

SmartKid Wallet có hai pha rõ ràng:

### Learning / Customer Mode

```text
Làm Toán
→ mở 5 gian SmartMart
→ luyện tập
→ Mission vận dụng
→ mở Employee Mode
```

**Mở gian bằng Toán là core invariant.**

### Employee / Work Mode

```text
Nhận ca
→ phục vụ khách
→ tính toán khi cần
→ xử lý tình huống
→ quyết định
→ world state / deferred consequence
```

Các thay đổi vận hành cửa hàng chỉ xuất hiện ở Employee Mode.

## Current status

**Demo SmartMart v0 đã được chấp nhận làm baseline.**

Đã có:
- 5 stall + 20 Exercise Family;
- seeded exercise generator;
- Mission 01;
- Work Shift 01/02;
- 10 scenario;
- world state + deferred consequences;
- research logging;
- Supabase Anonymous Auth + research_events + RLS;
- Vercel demo deployment.

Từ đây dự án chuyển sang **Production v1**, ưu tiên:
- runtime/deployment reliability;
- UI/UX production;
- cloud progression;
- content versioning;
- Work Mode sâu hơn;
- teacher/research workspace;
- pilot readiness.

Xem `docs/PRODUCTION_PLAN.md` và `docs/ROADMAP.md`.

## Stack

React 19 + TypeScript + Vite, Phaser 4, Zustand, TanStack Query, Zod, Supabase, Vercel.

## Canonical repository

```text
Loccao102/SmartKid-Wallet
```

Productionization phải đưa Vercel về deploy trực tiếp từ canonical repo này, không duy trì repo clone làm source production.

## Documentation

Coding agent/contributor phải đọc `AGENTS.md`.

Source of truth chính:
- `docs/PRODUCTION_PLAN.md`
- `docs/PRODUCT_SPEC.md`
- `docs/GAME_DESIGN.md`
- `docs/UI_DESIGN.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`

## Production demo

Vercel demo hiện tại dùng để kiểm tra flow, chưa được coi là Production v1.
