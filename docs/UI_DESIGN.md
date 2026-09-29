# UI Design — SmartKid Wallet

## 1. Mục tiêu trải nghiệm
Giao diện phải tạo cảm giác **đang bước vào một thế giới học tập**, không phải LMS hoặc form bài tập.

Đối tượng chính là học sinh lớp 4–5 nên UI cần:
- rõ ràng;
- ít chữ trên một màn;
- vùng bấm lớn;
- phản hồi trực quan;
- màu tươi nhưng không quá trẻ con;
- ưu tiên tablet;
- desktop tốt cho demo/NCKH;
- mobile vẫn sử dụng được.

## 2. Visual direction
Phong cách: **modern educational simulation + miniature supermarket**.

Tông chính:
- xanh lá/teal: tin cậy, tiến bộ;
- kem/trắng: nền sạch;
- vàng ấm: nhiệm vụ/phần thưởng;
- coral, xanh lam, tím nhạt: phân biệt gian hàng.

Không dùng quá nhiều gradient neon hoặc UI kiểu game mobile thương mại.

## 3. Student shell
Desktop:
- sidebar trái;
- header chào học sinh;
- nội dung nhiệm vụ;
- profile và streak chỉ là gamification nhẹ.

Mobile:
- sidebar chuyển thành bottom navigation;
- nội dung xếp một cột;
- challenge modal full-width gần như sheet.

## 4. Assignment screen
Thứ tự thị giác:
1. Ai giao bài?
2. Bài gì?
3. Hạn khi nào?
4. Tiến độ bao nhiêu?
5. Tiếp theo phải làm gì?

Assignment banner phải luôn cho học sinh biết giáo viên là nguồn giao nhiệm vụ.

## 5. Supermarket mission map
Không hiển thị 5 gian như 5 card LMS thông thường.

Mỗi gian phải trông giống một quầy nhỏ trong siêu thị:
- mái quầy;
- icon mặt hàng;
- tên gian;
- skill chính;
- trạng thái;
- số thứ tự.

Trạng thái:
- locked: giảm saturation/opacity + khóa;
- available: nổi bật, có viền focus;
- completed: xanh nhẹ + check.

Đích cuối bản đồ là **Ca làm việc**, chỉ mở khi Assignment đạt điều kiện.

## 6. Challenge modal
Modal gồm:
- gian hàng;
- giáo viên giao;
- skill tags;
- câu hỏi;
- input;
- feedback.

Không đưa barem nghiên cứu vào UI học sinh.

## 7. Teacher UI — phase tiếp theo
Teacher UI giữ cùng design language nhưng ít “game” hơn:
- class switcher;
- assignment builder;
- content bank;
- preview;
- progress analytics.

Flow tạo bài:
**Đối tượng → Map → Gian hàng → Nội dung/skill → Điều kiện → Preview → Giao bài.**

## 8. Accessibility
- touch target tối thiểu khoảng 44px;
- không dùng màu là tín hiệu duy nhất;
- focus-visible rõ;
- text contrast đủ;
- interaction chính phải dùng button/input thật;
- animation sau này phải hỗ trợ reduced-motion.
