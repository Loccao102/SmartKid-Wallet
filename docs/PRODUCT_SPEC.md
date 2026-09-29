# Product Spec — SmartKid Wallet

## 1. Product statement
SmartKid Wallet là thế giới nhập vai tài chính dành cho học sinh lớp 4–5. Học sinh dùng kiến thức Toán trong các hoạt động quen thuộc như mua sắm, quản lý ngân sách, tính hóa đơn và xử lý tình huống, sau đó quan sát hậu quả của quyết định.

Core: **Học kiến thức → sử dụng kiến thức → ra quyết định → nhìn thấy hậu quả.**

Sản phẩm không phải LMS giao bài và không phải quiz được phủ giao diện game.

## 2. World concept
Hệ thống hiển thị sẵn 4 bản đồ:
1. **SmartMart – Siêu thị** — mở sẵn trong MVP.
2. **Ngân hàng tí hon** — khóa.
3. **Nhà hàng vui vẻ** — khóa.
4. **Chợ cuối tuần** — khóa.

Ba map sau tồn tại từ đầu để tạo cảm giác hành trình dài hạn, nhưng MVP chỉ triển khai gameplay đầy đủ cho SmartMart.

## 3. SmartMart learning model
SmartMart có 5 gian. Mỗi gian gắn cố định với một nhóm kiến thức:
1. Rau củ & Hoa quả — khối lượng, đơn giá, nhân/chia, đổi đơn vị.
2. Thực phẩm — số lượng, chia đều, định mức, bài nhiều bước.
3. Đồ uống — tổng tiền, hóa đơn, tiền thừa.
4. Đồ dùng — ngân sách, nhiều món, so sánh phương án.
5. Khuyến mãi — phần trăm, tăng/giảm giá, voucher.

Giáo viên không cấu hình nội dung Toán cho từng gian trong MVP. Curriculum được thiết kế sẵn trong thế giới.

## 4. Ba tầng gameplay
### Tầng 1 — Unlock Exercise
- bài Toán ngắn, có đáp số xác định;
- sinh từ Exercise Family + bộ tham số;
- dùng để chứng minh kiến thức nền của gian;
- mỗi học sinh có thể nhận biến thể khác nhau nhưng seed phải replay được.

### Tầng 2 — Mission
Mission là bài vận dụng tổng hợp, không phải danh sách câu hỏi.

Ví dụ Chuẩn bị liên hoan lớp: 20 bạn, ngân sách 500.000đ, cần đồ uống + trái cây + đồ ăn, sau mua phải còn ít nhất 30.000đ.

Học sinh được đi lại giữa các gian đã mở, xem giá, thêm/bớt sản phẩm, so sánh và điều chỉnh phương án.

### Tầng 3 — Work Mode
Sau khi hoàn thành hành trình nhập môn SmartMart, học sinh mở vai trò nhân viên. Một ca chuẩn có 5–6 khách + 1–2 event.

## 5. Progression
Progress là dài hạn theo tài khoản, không gắn với Assignment giáo viên.
Ví dụ: Người mới → Khách hàng thông minh → Nhân viên tập sự → Thu ngân → Nhân viên 5 sao → Quản lý ca.

Gian đã mở không bị khóa lại ở lần chơi sau.

## 6. Exercise generation
Mỗi gian chứa nhiều Exercise Family. Mỗi family định nghĩa kỹ năng, độ khó, tham số, generator, constraint và công thức đáp án.

Không cố hỗ trợ mọi bài Toán tự do. MVP chỉ xây các dạng toán phù hợp bối cảnh tài chính/siêu thị lớp 4–5.

## 7. Scenario
Scenario là bài vận dụng nâng cao có bối cảnh, random có kiểm soát, constraint, lựa chọn, hậu quả, rubric và feedback.

Exercise và Scenario là hai hệ thống riêng.

## 8. Đánh giá
- Employee rating: 1–5 sao, phản ánh tính toán, phục vụ, tư vấn, minh bạch và xử lý khách.
- Store reputation: 1–5 sao, phản ánh chất lượng hàng, khiếu nại, hàng lỗi/hết hạn, minh bạch và lãng phí.

Không dùng một score tổng duy nhất để đại diện năng lực.

## 9. User roles
### Học sinh
Core user. Khám phá map, mở gian, làm Mission, Work Mode, nhận badge và xem tiến bộ.

### Giáo viên
Trong MVP chủ yếu quan sát tiến độ lớp, kỹ năng mạnh/yếu, số lần thử, độ chính xác và hoạt động đã hoàn thành. Giáo viên không phải điều kiện để học sinh có nội dung chơi.

### Phụ huynh
Phase sau: xem tiến bộ và gợi ý hoạt động đời thực.

### Admin/Researcher
Quản lý content, Exercise Family, Scenario Template, product catalog, rubric và dữ liệu nghiên cứu.

## 10. MVP 3 tháng
- 4 map hiển thị, chỉ SmartMart mở;
- 5 gian SmartMart;
- khoảng 20–25 Exercise Family;
- seeded exercise generator;
- 3–5 Mission;
- 10–15 Scenario;
- 1 Work Shift hoàn chỉnh;
- profile/progression;
- leaderboard công bằng;
- teacher analytics cơ bản;
- asset system thống nhất.
