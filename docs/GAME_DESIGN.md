# Game Design — SmartKid Wallet

## 1. Hai game loop tách biệt

### Learning / Customer Loop

```text
Khám phá SmartMart
→ làm Unlock Exercise
→ mở stall
→ luyện tập
→ mở đủ điều kiện
→ Mission vận dụng
→ mở Employee Mode
```

Unlock bằng Toán là gameplay bắt buộc.

### Employee / Work Loop

```text
Nhận ca
→ khách/task xuất hiện
→ xử lý công việc
→ tính toán nếu cần
→ quyết định nếu có scenario
→ cập nhật world state
→ consequence có thể xuất hiện sau
→ kết ca
```

Chỉ Employee Mode có persistent world-state/consequence simulation.

## 2. SmartMart Learning

5 stall:
- Produce;
- Food;
- Drinks;
- Supplies;
- Promotion.

Mỗi stall:
- 3 unlock exercise family;
- 1 advanced practice family;
- unlock dài hạn.

Exercise:
- có đáp số;
- seeded/replayable;
- không random lại sau refresh;
- không dùng Math.random() trong component.

## 3. Mission

Mission là bài vận dụng Toán/tài chính tổng hợp.

Mission có thể yêu cầu:
- đủ số người;
- ngân sách;
- reserve;
- lựa chọn sản phẩm;
- comparison;
- promotion.

Mission **không** dùng employee/store world-state.

Mission completion là learning/application outcome.

## 4. Employee Mode production target

Demo hiện tại dùng flow khá đều:
`total → optional scenario → change`.

Production phải đa dạng hơn.

Customer/task type có thể là:
- normal checkout;
- total/change calculation;
- voucher/promotion;
- wrong POS price;
- duplicate scan;
- product quality;
- near-expiry;
- low stock/substitute;
- customer budget;
- extra cash;
- return/refund;
- inventory check.

Không bắt buộc mọi khách đều có cả tổng tiền + scenario + tiền thừa.

Mục tiêu là tạo cảm giác làm việc tại SmartMart, không phải chuỗi bài Toán giống nhau.

## 5. Scenario & consequence

Scenario có:
- stable ID/version;
- category/difficulty;
- choices;
- billDelta nếu cần;
- immediate effects;
- world effects;
- deferred consequences.

Consequence:
- after-customers;
- shift-end.

Event trước có thể ảnh hưởng khách sau nhưng phải deterministic/replayable.

## 6. Scoring

### Learning score
Dựa trên:
- first-attempt correctness;
- attempts;
- completion;
- response time khi phù hợp.

### Work performance
Có thể hiển thị:
- phép tính đúng;
- scenario xử lý;
- negative consequences;
- completion quality.

### Simulation metrics
- employee rating;
- store reputation;
- customer satisfaction.

Không dùng ba simulation metric làm “điểm bài”.

## 7. Progression reward

Hoàn thành Learning nên tạo cảm giác chuyển vai rõ ràng:

```text
Khách hàng
→ Mission hoàn thành
→ mở đồng phục / quầy nhân viên
→ Employee Mode
```

UI/audio/animation production cần nhấn mạnh khoảnh khắc này.

## 8. Demo baseline

Demo v0 đã có:
- Learning unlock loop;
- Mission 01;
- Work Shift 01 cố định;
- Work Shift 02 seeded;
- 10 scenario;
- world flags;
- deferred consequences.

Từ đây ưu tiên production quality thay vì tăng breadth.

## 9. Production content validation

Trước pilot:
- exercise correctness review;
- language phù hợp lớp 4–5;
- scenario ambiguity review;
- rubric review;
- difficulty calibration;
- seed replay test;
- no accidental moral labeling.
