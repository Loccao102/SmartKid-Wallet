# Production Plan — SmartKid Wallet

## 1. Trạng thái hiện tại

Demo SmartMart v0 được coi là **baseline đã chấp nhận**.

Demo đã chứng minh được:
- 5 gian SmartMart mở khóa bằng Toán;
- seeded exercise generator;
- Mission 01;
- Work Mode với customer/scenario;
- world state + deferred consequences trong Work Mode;
- research event logging;
- Supabase research sink + RLS;
- Vercel deployment.

Từ thời điểm này, ưu tiên không còn là thêm thật nhiều feature demo. Mục tiêu là biến baseline thành một sản phẩm ổn định, dễ dùng, có dữ liệu đáng tin cậy và đủ tốt cho pilot/NCKH.

## 2. Product invariant quan trọng nhất

SmartKid Wallet có hai pha khác nhau.

### Pha A — Học sinh / khách hàng

```text
Làm Toán
→ mở gian hàng
→ luyện tập
→ Mission vận dụng
→ hoàn thành hành trình người mua
```

**Mở gian bằng Toán là bắt buộc và không thay đổi.**

Ở pha này:
- Toán là nội dung trung tâm;
- progression rõ ràng;
- Mission dùng kiến thức đã học;
- không có world-state phức tạp;
- không có consequence chain kiểu vận hành cửa hàng.

### Pha B — Nhân viên

```text
Nhận ca
→ phục vụ khách
→ tính toán khi công việc yêu cầu
→ xử lý tình huống
→ quyết định
→ world state thay đổi
→ hậu quả có thể xuất hiện ở khách sau / cuối ca
```

Chỉ từ Employee/Work Mode mới mở:
- employee rating;
- store reputation;
- customer satisfaction;
- complaint/inventory/pricing/cash state;
- deferred consequences;
- decision-based simulation.

## 3. Production goals

### Reliability
- không crash trắng màn hình;
- Error Boundary cho từng gameplay boundary;
- production source maps/monitoring;
- smoke test cho critical flows;
- deterministic state migration;
- không để selector/store tạo unstable snapshot.

### Identity & persistence
- anonymous student session hoạt động ngay;
- có đường nâng cấp anonymous → tài khoản thật;
- progression/exercise/mission/work progress lưu server-side;
- local state chỉ là cache/offline support, không phải source of truth dài hạn.

### UX
- student UI không mang cảm giác dashboard SaaS;
- Learning Mode và Employee Mode có visual language khác nhau;
- mobile/tablet là first-class;
- font/touch target phù hợp học sinh lớp 4–5;
- research/admin controls không xuất hiện trong student flow production.

### Content
- exercise/scenario/mission có stable ID + version;
- content validate bằng schema;
- content update không phá replay/log cũ;
- pilot content phải review bởi người có chuyên môn giáo dục.

### Research
- event stream append-only;
- data dictionary cố định;
- fixed-seed/fixed-version challenge cho so sánh nghiên cứu;
- teacher/research dashboard tách khỏi student app;
- privacy/consent/retention được xác định trước pilot.

### Operations
- một canonical GitHub repository;
- Vercel production phải deploy từ canonical repository;
- CI phải gate build/test/schema;
- Supabase migration là source-controlled;
- backup/restore và data export được kiểm tra.

## 4. Production priorities

Thứ tự ưu tiên:

1. **Ổn định deployment/runtime**
2. **Redesign student UI/UX**
3. **Server persistence cho progression**
4. **Work Mode production gameplay**
5. **Teacher/Research workspace**
6. **Pilot + validation**
7. Sau đó mới mở map mới như Tiny Bank / Restaurant / Weekend Market.

## 5. Definition of Production v1

Production v1 chưa cần đầy đủ 4 map.

Production v1 có thể chỉ gồm SmartMart nhưng phải đạt:
- onboarding rõ;
- 5 gian Toán hoàn chỉnh;
- ít nhất 3 Mission chất lượng;
- Work Mode đủ sâu và không lặp máy móc;
- mobile/tablet tốt;
- account/progression cloud persistence;
- teacher/research analytics cơ bản;
- accessibility tối thiểu;
- monitoring + error handling;
- research telemetry đáng tin cậy;
- privacy/security review;
- pilot-ready content.

## 6. Không làm trong giai đoạn productionization đầu

Tạm hoãn:
- thêm map mới;
- thêm nhiều leaderboard mechanic;
- thêm hàng loạt Exercise Family nếu 20 family hiện tại chưa được pilot;
- thêm microservice/Redis/K8s;
- thêm hệ thống monetization;
- thêm social/multiplayer.

Mục tiêu là làm **SmartMart sâu, ổn định và đẹp** trước.
