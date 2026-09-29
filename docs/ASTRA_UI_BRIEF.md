# Astra UI Brief — SmartKid Wallet Production v1

## Mục tiêu

Dùng bộ concept tại:

```text
docs/assets/concepts/production-v1/
```

để dựng lại student UI production từ demo hiện tại.

Không thay game logic/domain rule nếu không có yêu cầu riêng.

## Thứ tự dựng

1. App shell + responsive navigation
2. World Map
3. SmartMart Hub
4. Unlock Exercise
5. Stall/Shopping interaction
6. Mission 01
7. Work Mode cashier
8. Work Scenario
9. Work Result
10. Profile/Leaderboard

## Bắt buộc giữ

### Learning
```text
Toán → mở gian → Mission → mở Employee Mode
```

- Unlock bằng Toán là bắt buộc.
- Không đưa store consequence/world-state vào Learning Mode.

### Employee
```text
Task → calculation khi cần → decision → world state → consequence
```

- Không bắt mọi customer đi qua một flow total → scenario → change giống hệt nhau.
- Employee/store/customer metrics là simulation state.

## Visual direction

Concept cảnh vật hiện tại là hướng chính.

Nhân vật cần **ít AI-looking hơn concept**:
- ưu tiên clean illustrated 2D/2.5D;
- line/shadow nhất quán;
- proportions cố định;
- expression library hữu hạn;
- cùng một character phải giữ tóc, mặt, quần áo, màu sắc xuyên suốt;
- tránh glossy 3D face, mắt quá lớn, skin quá mịn, pose quá “generated”.

Nên tạo trước:
- 1 main student character sheet;
- 2 cashier/employee variants;
- 6–8 reusable customer/NPC archetypes;
- expression set: neutral, happy, thinking, confused, concerned.

## Layout

### Learning Mode
- world/stall là focal point;
- ít card;
- progress dễ thấy;
- unlock celebration rõ;
- CTA ≥44px;
- body text khoảng 14–16px.

### Employee Mode
Focal hierarchy:
1. customer/task;
2. POS/work area;
3. action/decision;
4. contextual warning;
5. queue/secondary state.

### Result
Tách rõ:

**Kết quả học tập/làm việc**
- calculation correctness;
- scenario completion;
- consequences;
- badge/XP.

**Kết quả mô phỏng**
- employee rating;
- store reputation;
- customer satisfaction;
- revenue.

Không để 4.3/5 bị hiểu là điểm bài học.

## Engineering constraints

- React giữ navigation/forms/HUD/modal.
- Phaser giữ spatial scene/NPC/animation.
- Không hard-code business rule vào Phaser scene.
- Không thêm framework UI lớn nếu không cần.
- Dùng existing domain/store contracts.
- Cần responsive desktop/tablet/mobile.
- Không hiển thị JSON/CSV/session/schema research trong student production UI.
- Error Boundary hiện có phải tiếp tục hoạt động.

## Definition of done cho một màn

- đúng concept;
- không copy nguyên text baked trong ảnh;
- không phá logic hiện tại;
- keyboard/focus cơ bản;
- touch target đủ lớn;
- mobile không phải desktop bị co nhỏ;
- build/test pass.
