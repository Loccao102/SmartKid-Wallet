# Work Mode — SmartMart

## 1. Mục tiêu
Work Mode mở sau khi học sinh hoàn thành hành trình người mua và Mission 01.

Role đầu tiên:
- Nhân viên tập sự;
- phục vụ khách tại quầy;
- tính hóa đơn;
- trả tiền thừa;
- xử lý event;
- quan sát hậu quả lên employee rating, store reputation và customer satisfaction.

Toán vẫn là công cụ. Quyết định và hậu quả mới là gameplay.

## 2. Flow một khách

1. Khách đưa giỏ hàng.
2. Học sinh tính tổng hóa đơn.
3. Nếu có event, học sinh chọn cách xử lý.
4. Event có thể làm thay đổi hóa đơn.
5. Học sinh tính tiền thừa từ hóa đơn sau event.
6. Giao dịch được ghi nhận và gọi khách tiếp theo.

Không được tính tiền thừa từ giá trước event nếu event đã thay đổi số tiền phải trả.

## 3. Metrics

### Employee rating
Thang 1–5.

Tác động chính:
- sai hóa đơn;
- sai tiền thừa;
- xử lý khách thiếu chính xác;
- minh bạch khi tư vấn;
- áp dụng chính sách đúng.

### Store reputation
Thang 1–5.

Tác động chính:
- hàng dập/hỏng;
- quy trình đổi hàng;
- áp dụng voucher/chính sách cửa hàng;
- khiếu nại;
- chất lượng phục vụ gắn với quy trình.

### Customer satisfaction
Thang 1–5.

Phản ánh trải nghiệm của khách trong ca hiện tại.

Không dùng một điểm tổng duy nhất thay cho ba metric này.

## 4. Math mistakes

Sai phép tính:
- không kết thúc ca;
- học sinh được thử lại;
- tăng mathMistakes;
- employee rating giảm nhẹ;
- customer satisfaction giảm nhẹ.

MVP hiện tại:
- mỗi lần sai: employee −0.10;
- customer satisfaction −0.05.

Các hệ số nằm trong engine và có thể cân chỉnh sau pilot.

## 5. Scenario choice effects

Mỗi choice có:
- billDelta;
- employeeRatingDelta;
- storeReputationDelta;
- customerSatisfactionDelta;
- feedback.

Feedback mô tả hậu quả thực tế, không gắn nhãn học sinh tốt/xấu.

Ví dụ voucher:
- hóa đơn gốc 115.000đ;
- voucher hợp lệ −20.000đ;
- hóa đơn sau xử lý 95.000đ;
- khách đưa 200.000đ;
- tiền thừa đúng = 105.000đ.

## 6. Trainee Shift 01

Ca đầu:
- 3 khách;
- 2 event;
- 6 phép tính chính;
- lưu progress bằng Zustand persist.

Event:
1. Hộp nước bị móp.
2. Voucher 20.000đ hợp lệ.

Mục tiêu vertical slice là chứng minh:
- calculation → choice → consequence;
- employee/store metric tách biệt;
- bill có thể thay đổi sau scenario;
- ca có thể resume sau reload.

## 7. Phaser cashier scene

Work Mode hiện có scene Phaser riêng:
- khách xếp hàng;
- khách hiện tại tiến tới quầy;
- sản phẩm xuất hiện trên băng chuyền;
- POS đổi trạng thái theo total → scenario → change → done;
- event có cảnh báo trực quan;
- billDelta hiển thị tại máy POS;
- React vẫn giữ input, scenario choice và metrics để logic UI không phụ thuộc render scene.

Scene chỉ dùng vector placeholder ở giai đoạn hiện tại. Sprite/asset thật sẽ thay vào sau mà không đổi contract giữa React và Phaser.

## 8. Scenario bank

Content bank hiện có 10 template:
1. damaged drink;
2. valid voucher;
3. near-expiry yogurt;
4. wrong shelf price;
5. duplicate scan;
6. expired voucher;
7. customer budget;
8. low-stock substitute;
9. extra cash;
10. stale promotion sign.

Mỗi scenario có:
- stable ID;
- version;
- category;
- difficulty;
- 3 choices;
- billDelta;
- employee/store/customer effects;
- descriptive consequence feedback.

Trainee Shift 01 chỉ dùng 2 event đầu để onboarding không bị quá tải.

## 9. Seeded Shift 02

Ca 02 là ca đầu tiên được sinh từ template thay vì hard-code nguyên danh sách khách.

Template:
- 6 khách;
- 4 scenario;
- scenario difficulty 1–2;
- 2 giao dịch thường;
- customer names không trùng trong một ca;
- ưu tiên 4 scenario thuộc 4 category khác nhau khi pool cho phép.

Công thức seed:

```text
studentKey
+ templateId
+ templateVersion
+ variantIndex
→ seed
→ customer/scenario order
→ WorkShiftInstance
```

Cùng bốn input trên phải sinh lại đúng cùng một instance. Không dùng `Math.random()` cho Work Mode generation.

Generated WorkShiftInstance lưu:
- templateId;
- templateVersion;
- seed;
- studentKey;
- variantIndex;
- customer order;
- scenarioId;
- scenarioVersion.

Điều này cho phép:
- resume sau reload;
- replay đúng ca;
- đối chiếu dữ liệu nghiên cứu;
- tái tạo ca từ log mà không cần lưu toàn bộ logic random.

Demo hiện tại:
- Ca 01: onboarding cố định, 3 khách, 2 event.
- Ca 02: seeded instance, 6 khách, 4 event.

Store lưu progress theo `shift.id`, vì vậy Ca 01 và Ca 02 không ghi đè tiến độ của nhau.

## 10. Scenario/customer compatibility

Không gán scenario ngẫu nhiên vào một giỏ hàng bất kỳ.

Mỗi scenario có customer blueprint tương thích để bảo đảm:
- nội dung mô tả khớp sản phẩm;
- billDelta có ý nghĩa;
- payable total không âm;
- cashGiven đủ thanh toán cho mọi choice;
- các constraint đặc biệt như budget/voucher/duplicate scan vẫn đúng.

Generator random scenario + thứ tự + tên khách, nhưng dùng blueprint đã được kiểm chứng cho scenario đó.

## 11. Next expansion

Sau Seeded Shift 02:
- deferred consequences;
- world state giữa các khách;
- event log cho research;
- nhiều shift template/difficulty;
- Supabase persistence;
- asset/sprite thật cho cashier scene.
