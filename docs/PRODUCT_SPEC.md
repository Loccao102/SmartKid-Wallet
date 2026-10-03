# Product Spec — SmartKid Wallet

## 1. Product statement

SmartKid Wallet là web nhập vai giáo dục dành cho học sinh lớp 4–5, kết hợp **Toán học, giáo dục tài chính, ra quyết định và trách nhiệm**.

Sản phẩm có hai pha:

1. **Learning / Customer Mode** — học sinh làm Toán để mở gian hàng và hoàn thành Mission.
2. **Employee / Work Mode** — học sinh dùng kiến thức trong công việc, xử lý tình huống và quan sát hậu quả của quyết định.

Core progression:

```text
Học Toán
→ mở gian
→ Mission vận dụng
→ mở vai trò nhân viên
→ quyết định trong công việc
→ hậu quả
→ tiến bộ
```

## 2. Product invariant

### Mở gian bằng Toán là bắt buộc

SmartMart có 5 gian. Mỗi gian được mở bằng Unlock Exercise thuộc nhóm kiến thức cố định.

Không thay Unlock Exercise bằng exploration hoặc decision-only gameplay.

### World-changing decision chỉ thuộc Employee Mode

Learning/Customer Mode không dùng:
- complaint state;
- store reputation consequence chain;
- inventory incident chain;
- cash discrepancy chain.

Các cơ chế này chỉ xuất hiện sau khi học sinh mở vai trò nhân viên.

## 3. World concept

Bản đồ dài hạn:
1. **SmartMart – Siêu thị** — production scope hiện tại.
2. **Ngân hàng tí hon** — future.
3. **Nhà hàng vui vẻ** — future.
4. **Chợ cuối tuần** — future.

Production v1 ưu tiên làm SmartMart đủ sâu trước khi mở map mới.

Cập nhật phạm vi 2026-10-03 theo yêu cầu chủ dự án: mở đợt phát triển Tiny Bank
trên nền chapter có sẵn. Điều kiện vào map vẫn là Cấp 5 + Liên hoan lớp;
không đổi SmartMart hoặc mở rộng Restaurant/Market. Xem [TINY_BANK.md](TINY_BANK.md).

## 4. SmartMart curriculum

1. Rau củ & Hoa quả — khối lượng, đơn giá, nhân/chia, đổi đơn vị.
2. Thực phẩm — số lượng, chia đều, định mức, nhiều bước.
3. Đồ uống — tổng tiền, hóa đơn, tiền thừa.
4. Đồ dùng — ngân sách, nhiều món, so sánh.
5. Khuyến mãi — phần trăm, tăng/giảm giá, voucher.

Mỗi stall có:
- 3 family dùng để mở khóa;
- family nâng cao để luyện lại;
- stable content ID/version;
- seeded generation để replay.

## 5. Gameplay layers

### Layer 1 — Unlock Exercise
- thuần Toán;
- đáp án xác định;
- ngắn;
- deterministic;
- dùng để mở stall.

### Layer 2 — Mission
- vận dụng tổng hợp kiến thức đã học;
- shopping/budget/planning;
- có nhiều cách xây giỏ;
- không tạo persistent store-world consequence.

### Layer 3 — Work Mode
- roleplay nhân viên;
- interaction theo công việc;
- không bắt buộc mọi khách đều theo cùng flow;
- Toán xuất hiện khi task yêu cầu;
- scenario/decision/world-state/deferred consequences chỉ sống ở đây.

## 6. Progression

Ví dụ:

```text
Người mới
→ Khách hàng thông minh
→ hoàn thành SmartMart Learning
→ Nhân viên tập sự
→ Thu ngân
→ Nhân viên 5 sao
→ Quản lý ca
```

Gian đã mở không bị khóa lại.

Production progression phải được lưu server-side theo account/student identity.

## 7. Assessment semantics

Phải tách hai loại kết quả:

### Learning performance
- độ chính xác;
- first-attempt accuracy;
- số lần thử;
- thời gian phản hồi;
- Mission completion.

### Simulation state
- employee rating;
- store reputation;
- customer satisfaction;
- world flags/consequences.

**Simulation metric không phải điểm học tập.**

Một học sinh có thể xử lý học tập rất tốt nhưng customer satisfaction không đạt 5/5 vì bối cảnh khách hàng.

Màn kết quả production phải diễn đạt rõ sự khác nhau này.

## 7A. Mastery, economy và level

Production v1 dùng ba lớp progression tách nhau:

- **XP / Level** — tiến trình dài hạn, không bị trừ.
- **Xu** — tài nguyên có thể tiêu cho retry/cosmetic; không được tạo learning paywall.
- **Stars** — mastery của một run, phụ thuộc accuracy + time + resource efficiency + decision trade-offs + objective.

Sai Unlock Exercise không còn chỉ hiện "SAI". Feedback tăng dần theo mức hỗ trợ; muốn retry trong Adventure dùng phí xu 5 → 10 → 15 → 20 → 25 → max 30. Practice retry miễn phí.

Level-up thưởng 100 xu. Map/Mission mở bằng **level + prerequisite**, không chỉ XP farm.

Scenario trong Work Mode không reveal đúng/sai ngay. Lựa chọn được ghi nhận, hậu quả xuất hiện tự nhiên, và score/star chỉ reveal khi kết thúc ca.

Chi tiết chuẩn:
- `docs/SCORING_PROGRESSION.md`
- `docs/WORLD_MODES_MISSIONS.md`
- `docs/AUDIO_SYSTEM.md`

## 8. User roles

### Student
- learning;
- missions;
- employee mode;
- progression/profile.

### Teacher
- lớp;
- progress;
- skill/attempt analytics;
- activity completion.

### Researcher/Admin
- content version;
- scenario/rubric;
- research events;
- export/analysis.

Research/admin control không xuất hiện trong student UI production.

## 9. Demo baseline

Demo hiện tại được coi là đủ để chứng minh:
- seeded math unlock;
- 5 stall;
- Mission 01;
- Work Shift 01/02;
- scenario/world-state;
- research logging;
- Supabase sync.

Không tiếp tục đánh giá production readiness bằng số lượng feature demo.

## 10. Production v1 target

SmartMart production v1 cần:
- 5 stall hoàn chỉnh;
- 20 family hiện tại được content review;
- ≥3 Mission chất lượng;
- Work Mode có nhiều interaction type;
- cloud progression;
- student/teacher/research role boundary;
- production UI/UX;
- mobile/tablet;
- accessibility;
- monitoring/error handling;
- research/pilot readiness.

Chi tiết triển khai: `docs/PRODUCTION_PLAN.md`.
