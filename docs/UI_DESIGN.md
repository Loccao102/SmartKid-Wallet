# UI/UX Design — SmartKid Wallet Production

## 1. Trạng thái

UI demo hiện tại được chấp nhận để chứng minh flow, nhưng **không phải production visual target**.

Production cần giảm cảm giác dashboard SaaS và tăng cảm giác game/learning world.

## 2. Hai visual mode

### Learning / Customer Mode

Cảm giác:
- sáng;
- khám phá;
- đơn giản;
- reward rõ;
- ít metric.

Ưu tiên:
- world/stall là focal point;
- unlock progress dễ hiểu;
- exercise modal gọn;
- animation mở gian;
- CTA lớn;
- không hiển thị data kỹ thuật.

### Employee / Work Mode

Cảm giác:
- đang vào ca làm việc;
- quầy/NPC/task là focal point;
- thông tin vận hành vừa đủ;
- world state xuất hiện theo ngữ cảnh.

Employee Mode có thể trưởng thành hơn Learning Mode nhưng vẫn phù hợp học sinh lớp 4–5.

## 3. Student UI không phải research console

Production student UI **không hiển thị**:
- schema version;
- session ID;
- Export JSON/CSV;
- raw research event count;
- technical sync detail.

Các control này chuyển sang Researcher/Admin workspace.

Student chỉ cần trạng thái thân thiện như:
- “Đã lưu tiến trình”;
- “Đang lưu…”;
- “Chưa có mạng — sẽ đồng bộ sau”.

## 4. Typography

Không dùng body text quá nhỏ.

Target:
- body student: tối thiểu khoảng 14–16px;
- secondary: ≥12px;
- button/touch label: dễ đọc;
- tiny technical text chỉ dành admin/research.

Không dùng hàng loạt `.5rem`–`.6rem` cho nội dung học sinh.

## 5. Responsive

### Desktop/tablet
- game/world có không gian lớn;
- panel phụ không cạnh tranh focal point.

### Mobile
- không ép desktop dashboard xuống chiều rộng nhỏ;
- bottom navigation;
- one-column task flow;
- fixed/compact HUD;
- modal full-screen hoặc near-full-screen;
- touch target ≥44px;
- canvas/game không bị chữ/panel bóp nhỏ.

## 6. SmartMart

Learning SmartMart phải thể hiện:
- nhân vật;
- 5 stall;
- trạng thái open/locked/completed;
- unlock celebration;
- route/spatial feel.

Không biến 5 stall thành 5 card LMS khi production art đã sẵn sàng.

## 7. Exercise UX

Logic giữ nguyên: Toán → mở gian.

Presentation production:
- bối cảnh stall rõ;
- progress 1/3, 2/3, 3/3;
- feedback ngắn;
- success animation;
- sau 3/3 mở gian ngay.

Không thêm decision/world-state vào Unlock Exercise.

## 8. Mission UX

Mission nên giống shopping/planning flow:
- objective rõ;
- budget/reserve rõ;
- cart dễ sửa;
- stall navigation nhanh;
- checkout feedback giải thích thiếu gì.

## 9. Work Mode UX

Production nên giảm số panel đồng thời.

Focal hierarchy:
1. khách/task hiện tại;
2. quầy/POS;
3. action/decision;
4. world warning nếu có;
5. queue/secondary metrics.

World-state chỉ hiện khi có ý nghĩa với task.

## 10. Result screen

Tách hai khối:

### Kết quả học tập/làm việc
Ví dụ:
- 6/6 phép tính chính xác;
- 2/2 tình huống đã xử lý;
- 0 hậu quả tiêu cực;
- badge/XP.

### Trạng thái mô phỏng
Ví dụ:
- employee rating;
- store reputation;
- customer satisfaction;
- revenue.

Không để 4.3/5 bị hiểu là “điểm học tập 4.3”.

## 11. Accessibility

Production gate:
- keyboard navigation;
- visible focus;
- contrast;
- touch ≥44px;
- reduced motion;
- screen-reader labels;
- không chỉ dùng màu làm trạng thái;
- font-size phù hợp trẻ em.

## 12. Art direction

Modern educational simulation + colorful 2.5D/isometric.

Palette:
- teal/emerald: brand/system;
- warm cream: background;
- yellow/gold: reward/action;
- map/stall có màu riêng.

Asset thật phải thay vector placeholder trước pilot-facing demo.
