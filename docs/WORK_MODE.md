# Work Mode — SmartMart

## 1. Vai trò

Work Mode chỉ mở sau khi học sinh:
1. hoàn thành Learning progression cần thiết;
2. hoàn thành Mission mở vai trò.

Đây là nơi SmartKid Wallet chuyển từ **học/luyện Toán** sang **mô phỏng công việc**.

Chỉ Work Mode có:
- employee rating;
- store reputation;
- customer satisfaction;
- world flags;
- deferred consequences;
- decision-based store simulation.

## 2. Demo baseline

Demo hiện có:
- Ca 01: 3 khách, 2 scenario;
- Ca 02: 6 khách seeded, 4 scenario;
- 10 scenario template;
- deterministic shift generation;
- world state;
- deferred consequence;
- research event logging;
- Phaser cashier scene.

Demo này được coi là đủ để chứng minh engine.

## 3. Production interaction model

Không bắt buộc mọi khách đi qua cùng flow.

Các interaction type production:
- normal checkout;
- total calculation;
- change calculation;
- promotion/voucher;
- product quality;
- wrong price;
- duplicate scan;
- customer budget;
- low stock;
- substitute product;
- cash discrepancy;
- refund/return;
- inventory task.

Một khách có thể:
- chỉ cần tính;
- chỉ có decision;
- vừa tính vừa decision;
- không có vấn đề gì đặc biệt.

Mục tiêu là cảm giác **làm việc tại SmartMart**, không phải lặp bài Toán theo công thức.

## 4. Math

Trong Work Mode, Toán là công cụ công việc.

Sai phép tính:
- cho phép thử lại;
- log mọi attempt;
- có thể tác động nhẹ đến work performance;
- không được biến cả ca thành chuỗi quiz.

## 5. Scenario

Scenario có:
- stable ID/version;
- category/difficulty;
- choices;
- billDelta nếu cần;
- immediate effects;
- world effects;
- deferred consequences;
- descriptive feedback.

Feedback mô tả hậu quả, không gắn nhãn đạo đức cho học sinh.

## 6. World state

World flags hiện có:
- complaint-risk;
- pricing-mismatch;
- inventory-pressure;
- cash-discrepancy;
- billing-dispute;
- stale-promo-sign.

Flag mô tả trạng thái vận hành, không phải điểm.

## 7. Deferred consequences

Trigger:
- after-customers;
- shift-end.

Consequence phải deterministic và replayable.

Khi resolve:
- metric effects được áp dụng;
- pending → resolved;
- flag có thể clear;
- research event riêng được ghi.

## 8. Scoring semantics

### Work performance
Production result có thể tổng hợp:
- calculation correctness;
- attempts;
- scenario handling;
- negative consequences;
- completion quality.

### Simulation metrics
- employee rating;
- store reputation;
- customer satisfaction.

Simulation metrics **không phải điểm học tập**.

Màn kết quả phải tránh hiểu nhầm kiểu “4.3/5 = chỉ làm đúng 4.3 điểm”.

## 9. Seeded shift

Công thức:

```text
studentKey
+ templateId
+ templateVersion
+ variantIndex
→ seed
→ WorkShiftInstance
```

Generated instance lưu:
- templateId/version;
- seed;
- studentKey;
- variant;
- customer order;
- scenario ID/version.

Không dùng Math.random() rải rác.

## 10. Persistence

Demo:
- Zustand persist local;
- research log local + Supabase append-only sync.

Production:
- active shift/progress phải có server persistence;
- local store là cache/offline support;
- resume phải hoạt động cross-device khi account thật được dùng.

## 11. Production UX

Ưu tiên:
- quầy/task hiện tại là focal point;
- giảm panel/KPI cùng lúc;
- world warning chỉ xuất hiện khi relevant;
- result screen tách performance và simulation;
- research export không nằm trong student UI.

## 12. Production content quality

Trước pilot:
- review scenario wording;
- review ambiguity;
- validate bill constraints;
- validate consequence chain;
- validate difficulty;
- version-lock content dùng cho research.
