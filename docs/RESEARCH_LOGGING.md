# Research Logging

## 1. Mục tiêu

Research logging ghi lại quá trình học sinh tương tác với SmartKid Wallet để:
- phân tích độ chính xác Toán;
- số lần thử;
- thời gian phản hồi;
- lựa chọn trong scenario;
- tác động của lựa chọn lên metrics;
- world state và deferred consequences;
- tái tạo đúng seeded shift đã chơi;
- xuất dữ liệu cho phân tích NCKH.

Logging là **append-only event stream**. Không sửa nội dung event cũ để phản ánh state mới.

## 2. Privacy rule

Event dùng `studentKey`/pseudonymous ID.

Không log:
- tên hiển thị học sinh;
- email;
- số điện thoại;
- thông tin tự do do trẻ nhập ngoài dữ liệu cần thiết cho bài toán.

Customer ID là ID nhân vật game, không phải người thật.

## 3. Event schema v1

Mỗi event có tối thiểu:

```text
schemaVersion
eventId
sessionId
eventType
occurredAt

studentKey
shiftId
```

Seeded shift bổ sung khi có:

```text
shiftTemplateId
shiftTemplateVersion
shiftSeed
shiftVariantIndex
```

Context theo khách/scenario:

```text
customerId
customerIndex
scenarioId
scenarioVersion
choiceId
```

Math attempt:

```text
mathStage
submittedAnswer
expectedAnswer
correct
attemptNumber
responseTimeMs
```

Deferred consequence:

```text
consequenceId
consequenceInstanceId
```

State transition:

```text
before.metrics
before.worldState

after.metrics
after.worldState
```

## 4. Event types

### shift_started
Tạo một lần cho mỗi session.

Metadata hiện có:
- customerCount;
- scenarioCount.

Nếu người dùng reload giữa ca, active session được persist nên không tạo duplicate `shift_started`.

### math_attempt
Tạo cho **mọi lần submit**, kể cả sai.

Ví dụ một câu:
- attempt 1: wrong;
- attempt 2: wrong;
- attempt 3: correct.

Không chỉ lưu lần đúng cuối cùng.

### scenario_choice
Tạo khi học sinh chọn phương án.

Ghi:
- scenario ID/version;
- choice ID;
- category/difficulty;
- billDelta;
- responseTime;
- metrics/world state before/after.

### customer_settled
Tạo khi giao dịch hoàn tất và chuyển sang khách tiếp theo.

Metadata:
- baseTotal;
- effectiveTotal;
- cashGiven;
- changeGiven;
- number of consequences resolved.

### consequence_resolved
Tạo riêng cho mỗi deferred consequence thực sự phát sinh.

Điều này cho phép phân biệt:
- choice ban đầu;
- consequence xuất hiện sau đó;
- thời điểm consequence resolve.

### shift_completed
Event cuối của ca.

Metadata:
- servedCustomers;
- mathMistakes;
- resolvedConsequences.

Sau event này active logging session được đóng.

## 5. Session

Một lần chơi ca là một logging session.

```text
Shift 02
Session A
  shift_started
  ...
  shift_completed

Replay Shift 02
Session B
  shift_started
  ...
```

Reset gameplay không xóa event cũ.

Research log nằm ở store riêng với progression.

## 6. Response time

Timer bắt đầu khi một stage xuất hiện:
- total;
- scenario;
- change.

Mỗi lần submit sai:
- event được ghi;
- timer reset cho attempt tiếp theo.

Do đó có thể phân tích:
- thời gian attempt đầu;
- thời gian tự sửa sau feedback;
- thời gian quyết định scenario.

## 7. Local MVP storage

Hiện tại event được persist local bằng Zustand:

```text
smartkid-wallet-research-log-v1
```

Store:
- events[];
- activeSessionByShiftId.

Đây là local MVP để phát triển/pilot.

Không coi localStorage là backend nghiên cứu production.

## 8. Export

Màn kết quả Work Mode cho export session gần nhất:

### JSON
Giữ cấu trúc đầy đủ:
- before/after snapshots;
- pending/resolved consequences;
- metadata.

### CSV
Các field chính được flatten thành cột.
Object như `before`, `after`, `metadata` được serialize thành JSON trong cell.

CSV có UTF-8 BOM để mở tiếng Việt thuận tiện hơn trong Excel.

## 9. Supabase migration target

Khi nối backend, giữ nguyên event contract và đổi storage sink.

Bảng gợi ý:

```text
research_events
- event_id uuid primary key
- schema_version int
- session_id uuid/text
- event_type text
- occurred_at timestamptz
- student_id uuid
- shift_id text
- shift_template_id text null
- shift_template_version int null
- shift_seed bigint null
- shift_variant_index int null
- customer_id text null
- customer_index int null
- scenario_id text null
- scenario_version int null
- choice_id text null
- math_stage text null
- submitted_answer numeric null
- expected_answer numeric null
- correct boolean null
- attempt_number int null
- response_time_ms int null
- consequence_id text null
- consequence_instance_id text null
- before jsonb null
- after jsonb null
- metadata jsonb null
```

RLS:
- student insert/select chỉ event của chính mình;
- teacher chỉ đọc event thuộc lớp được quản lý;
- client không UPDATE/DELETE research events;
- event append-only.

## 10. Analysis examples

Từ event stream có thể tính:

### Math
- accuracy first attempt;
- total attempts;
- response time;
- correction after feedback;
- total/change error rate.

### Scenario
- choice distribution;
- response time by scenario;
- choice by category/difficulty;
- immediate metric effects.

### Consequence awareness
- scenario choice → deferred consequence;
- number of active world flags;
- reputation/customer impact later in shift.

### Shift
- completion rate;
- mistakes/shift;
- revenue;
- employee/store/customer metric trajectory;
- seeded-shift comparison.

## 11. Future extensions

Cùng schema family có thể mở rộng eventType cho:
- unlock exercise;
- SmartMart movement/interactions;
- Mission basket changes;
- Mission checkout;
- map unlock;
- achievement.

Không nên tạo hệ logging riêng cho từng feature.
