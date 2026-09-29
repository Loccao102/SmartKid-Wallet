# Content Rules — SmartKid Wallet

## 1. Content layers

### Unlock Exercise
- thuần Toán;
- có đáp số;
- dùng để mở gian;
- deterministic/replayable;
- thuộc Learning/Customer Mode.

### Mission
- vận dụng tổng hợp kiến thức đã học;
- shopping/budget/planning;
- không phải chuỗi câu hỏi;
- không tạo employee/store world-state.

### Scenario
- chỉ thuộc Employee/Work Mode;
- có context, lựa chọn, effects, world-state và consequence;
- có thể cần Toán hoặc không.

Không dùng chung schema/engine cho ba lớp này.

## 2. Curriculum gắn với gian

- Produce → khối lượng, đơn giá, nhân/chia.
- Food → định mức, số lượng, chia đều.
- Drinks → hóa đơn, cộng/trừ, tiền thừa.
- Supplies → ngân sách, tổng nhiều món, so sánh.
- Promotion → phần trăm, tăng/giảm giá, voucher.

## 3. Exercise Family

Mỗi family phải có:
- stable id;
- version;
- stall id;
- skills;
- difficulty;
- parameter definition;
- generator;
- constraints;
- answer model;
- feedback rules.

## 4. Generation

Random phải deterministic/replayable bằng seed.

Một issued exercise/shift instance không được thay đổi khi reload.

Generator tránh:
- đáp án âm không chủ đích;
- số thập phân ngoài mục tiêu;
- phép chia không phù hợp lớp;
- cashGiven < payable total khi task yêu cầu tính tiền thừa;
- scenario/product context lệch nhau.

## 5. Mission

Mission có thể quy định:
- budget;
- people;
- reserve;
- required stalls;
- product constraints;
- completion rules.

Mission không được dùng consequence chain của Employee Mode.

## 6. Scenario

Scenario production có:
- stable id/version;
- category;
- difficulty;
- context;
- constraints;
- choices;
- billDelta nếu cần;
- immediate effects;
- world effects;
- deferred consequences;
- feedback.

## 7. Giá trị/trách nhiệm

Không hỏi giáo điều kiểu “em có trung thực không?”.

Feedback mô tả hậu quả cụ thể:
- khách;
- tiền;
- hàng hóa;
- quy trình;
- uy tín;
- lãng phí.

Không gắn nhãn trẻ “tốt/xấu”.

## 8. Research/versioning

Mọi instance quan trọng phải có:
- content/template/family id + version;
- seed;
- generated parameters;
- answer/choice;
- response time;
- before/after state khi có;
- app/content version.

Content dùng trong nghiên cứu phải pin version.
