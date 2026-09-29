# Product Spec — SmartKid Wallet

## 1. Product statement
SmartKid Wallet là môi trường nhập vai mô phỏng cho học sinh lớp 4–5. Học sinh dùng Toán để xử lý những vấn đề đời sống và tài chính, sau đó quan sát hậu quả của quyết định đối với khách hàng, bản thân và tổ chức.

## 2. MVP scope
MVP tập trung duy nhất vào **Siêu thị** nhưng làm đủ sâu để kiểm chứng:
- giáo viên giao nhiệm vụ học tập;
- học Toán theo ngữ cảnh;
- mở khóa progression;
- ra quyết định;
- đánh giá 5 sao;
- danh tiếng siêu thị;
- trạng thái hàng hóa;
- scenario ngẫu nhiên có kiểm soát;
- dữ liệu phục vụ giáo viên/nghiên cứu.

## 3. Luồng học tập bắt buộc

### Bước 0 — Giáo viên giao Assignment
Học sinh **không tự chọn bài trực tiếp từ kho bài**.

Giáo viên:
1. chọn lớp hoặc học sinh;
2. chọn Map Siêu thị;
3. chọn bộ challenge cho từng gian hoặc rule sinh bài;
4. cấu hình độ khó/số lượng;
5. cấu hình điều kiện hoàn thành;
6. bật/tắt Full Shift sau khi hoàn tất;
7. đặt hạn hoàn thành nếu cần;
8. Publish Assignment.

Assignment trở thành đơn vị học sinh nhìn thấy ở màn “Nhiệm vụ của em”.

### Pha A — Learn-to-Unlock
Siêu thị có 5 gian hàng. Mỗi gian chứa các challenge **thuộc Assignment giáo viên đã giao**.

Mục đích:
- onboarding tự nhiên;
- ôn/kiểm tra kiến thức theo mục tiêu bài học của giáo viên;
- giới thiệu từng loại hàng và mechanic;
- tạo cảm giác tiến triển;
- đảm bảo học sinh đã hiểu các phép tính cần thiết trước Full Shift.

Progress được ghi theo `studentId + assignmentId`.

Chỉ khi học sinh đáp ứng điều kiện hoàn thành của Assignment và **mở đủ 5/5 gian được yêu cầu** mới mở khóa Pha B.

### Pha B — Full Shift Simulation
Nếu giáo viên bật Full Shift cho Assignment, học sinh nhập vai nhân viên siêu thị trong một ca. Một lượt gồm khoảng 5–6 khách hàng và 1–2 event xen kẽ.

Mỗi khách là mini-scenario:
**yêu cầu → thu thập dữ kiện → tính toán → lựa chọn → hậu quả → đánh giá sao**.

Scenario trong Full Shift cũng phải tuân theo phạm vi/độ khó giáo viên đã giao.

## 4. 5 gian hàng đề xuất
1. **Rau củ & trái cây** — khối lượng, đơn giá, nhân/chia, chất lượng hàng.
2. **Thực phẩm** — số lượng, định mức, combo, nhiều bước.
3. **Đồ uống** — cộng/trừ, hóa đơn, tiền thừa.
4. **Đồ dùng học tập & gia đình** — ngân sách, so sánh phương án.
5. **Khuyến mãi** — phần trăm, giảm giá, voucher.

Tên và nội dung có thể thay đổi sau pilot nhưng phải giữ nguyên nguyên tắc: mỗi gian unlock một nhóm năng lực.

## 5. Chỉ số trải nghiệm
- Đánh giá nhân viên: 1–5 sao, chủ yếu do từng khách hàng phản hồi.
- Danh tiếng siêu thị: 1–5 sao, tích lũy từ chất lượng hàng, minh bạch, khiếu nại và quyết định vận hành.
- Doanh thu: mục tiêu tài chính của ca.
- Lãng phí: số lượng/tỉ lệ hàng bị bỏ.
- Progress: Assignment đã nhận, gian đã mở, ca đã hoàn thành, huy hiệu.

## 6. Success condition
Không có một “điểm thắng” duy nhất. Điều kiện hoàn thành phải do Assignment quy định.

Ví dụ một Assignment có thể yêu cầu:
- hoàn thành đủ challenge ở 5 gian;
- độ chính xác Toán ≥ 70%;
- Full Shift hoàn thành ít nhất 1 lần;
- danh tiếng siêu thị không dưới ngưỡng;
- lãng phí không vượt mức.

## 7. User roles

### Học sinh
- xem các Assignment được giao;
- làm đúng bộ bài giáo viên giao;
- mở gian trong phạm vi Assignment;
- hoàn thành Full Shift khi được phép;
- xem tiến bộ và huy hiệu.

### Giáo viên
- quản lý lớp/học sinh;
- chọn nội dung từ kho;
- tạo, lưu nháp, publish và đóng Assignment;
- giao cho cả lớp/nhóm/cá nhân;
- cấu hình độ khó, số challenge, deadline, Full Shift;
- xem tiến độ và skill breakdown theo Assignment;
- xem lỗi phổ biến;
- export dữ liệu.

### Phụ huynh
Theo dõi tiến bộ của con theo các nhiệm vụ đã được giáo viên giao và nhận gợi ý hoạt động đời thực; không ưu tiên xếp hạng con so với bạn khác.

### Admin/Researcher
Quản lý content bank, scenario, rubric, product catalog, event và dữ liệu nghiên cứu. Admin tạo **nguồn nội dung**, không thay thế vai trò giao bài của giáo viên.
