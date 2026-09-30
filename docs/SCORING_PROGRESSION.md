# Scoring, Progression & Economy v1

## 1. Triết lý

SmartKid Wallet không chấm mọi hành động bằng "đúng/sai" ngay lập tức.

Production loop:

```text
Quan sát
→ hành động / trả lời
→ tiếp tục chơi
→ hậu quả xuất hiện tự nhiên
→ thích nghi
→ hoàn thành lượt
→ reveal 1–5 sao
→ replay để mastery
```

**5★ = mastery**, không phải chỉ hoàn thành.

## 2. Hai loại feedback

### Toán học
Có đáp án xác định. Khi sai:
- không dùng thông báo đỏ kiểu "SAI!";
- feedback theo tầng;
- muốn thử lại trong Adventure phải trả xu;
- Practice Mode không thu xu.

### Decision / Scenario
Không hiển thị "đúng", "sai", score hoặc lựa chọn tốt nhất ngay sau khi chọn.

Game chỉ:
- xác nhận hành động;
- cập nhật world state;
- để hậu quả xuất hiện tự nhiên ở bước sau;
- reveal reflection sau khi kết thúc run.

Một scenario có thể có nhiều lựa chọn tốt theo các trade-off khác nhau.

## 3. Xu

### Khởi đầu

```text
200 xu
```

### Phí retry trong cùng một Exercise Instance

| Số lần sai đã có | Phí để thử lại |
| ---: | ---: |
| 1 | 5 |
| 2 | 10 |
| 3 | 15 |
| 4 | 20 |
| 5 | 25 |
| 6+ | 30 |

Công thức:

```ts
Math.min(wrongAttempts * 5, 30)
```

Phí reset khi sang câu mới.

### Không tạo learning paywall

Nếu học sinh không đủ xu:
- vẫn phải có recovery path miễn phí;
- nhận gợi ý rõ hơn;
- cho thử lại nhưng không có lợi thế reward;
- không khóa việc học.

### Thu nhập

- Level up: +100 xu.
- Teacher 5★ Challenge: reward theo challenge.
- Mission/achievement có thể thưởng thêm xu.
- Xu sau này dùng cosmetic; không pay-to-win.

## 4. XP

XP không bao giờ bị trừ.

Baseline:

| Hoạt động | XP |
| --- | ---: |
| Unlock Exercise đúng lần đầu | +10 |
| Unlock Exercise đúng sau retry | +5 |
| Practice | 0 |
| Hoàn thành stall lần đầu | +30 |
| Shopping Mission lần đầu | +75 |
| Work Shift lần đầu | +90 |
| Daily Challenge | +30 |

Replay dùng để nâng sao, không phải farm XP vô hạn.

## 5. Level

XP cần để lên cấp kế tiếp:

```ts
100 + (level - 1) * 50
```

Ví dụ:
- Lv1 → 2: 100 XP
- Lv2 → 3: 150 XP
- Lv3 → 4: 200 XP
- Lv4 → 5: 250 XP
- Lv5 → 6: 300 XP

Mỗi lần level up:
- +100 xu;
- animation/reward;
- có thể mở mission/map/mode.

## 6. Hidden run score

Mỗi run có tối đa 100 điểm ẩn.

Baseline dimensions:

| Dimension | Max |
| --- | ---: |
| Accuracy / first-attempt quality | 30 |
| Time efficiency | 20 |
| Resource / operational efficiency | 20 |
| Decisions / trade-offs | 20 |
| Objective completion | 10 |

Threshold:

| Score | Stars |
| ---: | ---: |
| 95–100 | 5 |
| 85–94 | 4 |
| 75–84 | 3 |
| 65–74 | 2 |
| <65 | 1 |

Production UI không hiển thị weights trong lúc chơi.

## 7. 5★ gate

Ngoài score >= 95, 5★ run phải:
- hoàn thành objective;
- không có unresolved critical failure;
- không bỏ qua task bắt buộc.

Không cho farm một dimension để bù critical failure.

## 8. Time

Time không làm fail run.

Time chỉ tác động hidden score.

Mỗi activity có target time riêng. Sau target:
- giảm điểm theo slope mềm;
- vẫn cho hoàn thành;
- không dùng countdown gây stress trừ challenge đặc biệt.

## 9. Shopping Mission scoring

Shopping Mission dùng:
- checkout attempts;
- thời gian;
- overbuy/waste;
- budget/reserve quality;
- objective completion.

Không reveal exact optimal cart trước khi chơi.

## 10. Work Shift scoring

Work Shift dùng:
- first-attempt math accuracy;
- tổng thời gian;
- operational state cuối ca;
- chất lượng trade-off của scenario;
- shift completion.

Scenario choice quality được suy ra từ effects/rubric, không hiển thị trong lúc chơi.

Live employee/store/customer metrics không dùng làm "điểm bài".

## 11. Teacher 5★ Challenge

Teacher challenge có:
- activityId/contentVersion/seed;
- requiredStars = 5;
- reward;
- optional deadline.

Ví dụ:

```text
Cô giáo: "Bạn nào đạt 5/5 sao ở Liên hoan lớp sẽ nhận phần quà."
```

Cùng challenge phải dùng cùng content version/seed nếu dùng cho so sánh lớp.

## 12. Replay

Replay:
- giữ best stars + best score;
- không reset progression;
- không thưởng XP lần đầu lần nữa;
- có thể claim reward challenge đúng một lần;
- cho người chơi học từ consequence của run trước.
