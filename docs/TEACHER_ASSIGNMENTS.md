# Teacher Assignment Specification

## Mục tiêu
Assignment là cầu nối bắt buộc giữa **Kho nội dung** và **Học sinh**.

Không có Assignment hợp lệ → học sinh không có bài để làm.

## Workflow giáo viên
1. Giáo viên vào **Lớp học**.
2. Chọn **Tạo bài tập**.
3. Chọn đối tượng:
   - cả lớp;
   - nhóm;
   - một hoặc nhiều học sinh.
4. Chọn **Map Siêu thị**.
5. Chọn 5 gian hàng hoặc preset.
6. Với từng gian:
   - chọn challenge cụ thể; hoặc
   - chọn skill + difficulty + số lượng để hệ thống random có kiểm soát.
7. Cấu hình:
   - số câu cần đúng;
   - cho phép làm lại;
   - thời gian/hạn nộp;
   - seed cố định nếu cần so sánh;
   - có mở Full Shift hay không.
8. Preview.
9. Publish.

## Trạng thái
- draft: học sinh chưa nhìn thấy.
- published: học sinh được phép làm.
- closed: không nhận attempt mới, vẫn xem kết quả.

## Student view
Học sinh có màn **Nhiệm vụ của em**:
- tên Assignment;
- giáo viên giao;
- lớp;
- thời hạn;
- tiến độ;
- các gian cần hoàn thành;
- trạng thái Full Shift.

Học sinh không thấy kho scenario đầy đủ.

## Ví dụ
**Bài: Ôn tập Toán thực tế — Siêu thị tuần 3**

Giáo viên: Nguyễn Thị Mai  
Đối tượng: Lớp 5A  
Hạn: 20:00 thứ Sáu

- Gian Rau củ: 3 bài đơn giá/khối lượng, cần đúng 2/3.
- Gian Thực phẩm: 3 bài định mức, cần đúng 2/3.
- Gian Đồ uống: 3 bài hóa đơn/tiền thừa, cần đúng 3/3.
- Gian Đồ dùng: 2 bài ngân sách, cần đúng 1/2.
- Gian Khuyến mãi: 3 bài phần trăm, cần đúng 2/3.
- Full Shift: bật.

Khi đủ điều kiện 5 gian → Full Shift mở.

## Dữ liệu cần lưu
Assignment:
- id
- teacher_id
- title
- grade
- map_id
- status
- assigned_at
- available_from
- due_at
- full_shift_enabled
- completion_rule

Target:
- assignment_id
- target_type
- class_id/group_id/student_id

Assignment stall:
- assignment_id
- stall_id
- order
- required_correct

Assignment item:
- assignment_id
- stall_id
- scenario/challenge_id
- scenario_version
- selection_rule
- difficulty range
- seed policy

Progress:
- assignment_id
- student_id
- stall_id
- attempts
- correct_count
- unlocked_at
- completed_at

## Nguyên tắc nghiên cứu
Nếu cần so sánh học sinh công bằng, giáo viên có thể:
- dùng cùng bộ challenge;
- dùng cùng seed;
- dùng cùng difficulty distribution.

Nếu mục tiêu là luyện tập cá nhân, Assignment có thể random tham số khác nhau nhưng vẫn giữ cùng skill coverage.
