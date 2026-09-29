# Content Rules

## 1. Hai loại nội dung chính
### Unlock Exercise
Bài Toán có đáp số, dùng để mở gian.

### Scenario
Bài vận dụng nâng cao có lựa chọn, constraint, hậu quả và rubric.

Không dùng chung schema/engine cho hai loại này.

## 2. Curriculum gắn với gian
Mỗi gian SmartMart sở hữu một nhóm kiến thức cố định:
- Produce → khối lượng, đơn giá, nhân/chia.
- Food → định mức, số lượng, chia đều.
- Drinks → hóa đơn, cộng/trừ, tiền thừa.
- Supplies → ngân sách, tổng nhiều món, so sánh.
- Promotion → phần trăm, tăng/giảm giá, voucher.

## 3. Exercise Family
Mỗi family phải có stable id, stall id, skills, difficulty, parameter definition, generator type, answer model, constraints và feedback rules.

## 4. Generation
Random phải deterministic/replayable bằng seed. Một exercise instance sau khi sinh phải giữ nguyên khi reload.

Generator phải tránh dữ liệu không phù hợp cấp lớp, ví dụ đáp án âm, số thập phân ngoài phạm vi, tiền khách đưa nhỏ hơn hóa đơn hoặc phép chia không phù hợp mục tiêu.

## 5. Mission
Mission dùng thế giới thật của map, không phải chuỗi câu hỏi. Mission có thể quy định ngân sách, số người, nhu cầu, gian cần dùng, điều kiện hoàn thành và số bước.

## 6. Scenario
Scenario có id + version, location, skills, values, parameters, constraints, action space, rubric, effects và feedback.

## 7. Giá trị/trách nhiệm
Không hỏi giáo điều kiểu “em có trung thực không?”. Phản hồi bằng hậu quả cụ thể với khách hàng, lãng phí, tiền và uy tín.

## 8. Research
Mọi instance quan trọng phải lưu template/family id + version, seed, generated parameters, answer/choice, response time, score dimensions và world state cần thiết.
