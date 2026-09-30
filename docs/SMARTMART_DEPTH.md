# SmartMart Depth Plan — v2

## Product decision

SmartMart là **gameplay scope chính** cho giai đoạn hiện tại.

Tiny Bank, Happy Restaurant và Weekend Market chỉ được giữ ở world map như future destinations. Không triển khai gameplay riêng cho các map đó cho đến khi SmartMart đạt depth gate trong tài liệu này.

Mục tiêu không phải thêm nhiều map. Mục tiêu là biến một siêu thị thành môi trường có đủ:
- học Toán;
- mua sắm;
- lập kế hoạch;
- thay đổi điều kiện giữa lượt;
- nhập vai nhân viên;
- trade-off;
- consequence;
- replay/mastery;
- thi đấu theo tuần.

## 1. SmartMart modes

### Adventure / Stall Learning

5 gian:
1. Rau củ & Hoa quả
2. Thực phẩm
3. Đồ uống
4. Đồ dùng
5. Khuyến mãi

Mỗi gian:
- unlock bằng Toán;
- practice family;
- seeded exercise;
- progression dài hạn.

### Shopping Mission

Mission không chỉ là “chọn đủ đồ rồi checkout”.

Loop production:

```text
nhận brief
→ bắt đầu chọn hàng
→ clue xuất hiện
→ điều kiện có thể thay đổi
→ sửa kế hoạch
→ checkout
→ reveal stars + reflection
```

Dynamic event đã hỗ trợ:
- số người thay đổi;
- ngân sách thay đổi;
- sản phẩm hết hàng.

Các event đã reveal phải persist qua refresh trong cùng run.

### Work Mode

Work Mode mô phỏng công việc trong siêu thị:
- tính hóa đơn;
- trả tiền thừa;
- promotion/voucher;
- product quality;
- pricing transparency;
- stock/substitution;
- cash discrepancy;
- return/refund;
- queue support;
- unit-price advice;
- frozen-product handling;
- coupon stacking.

Current baseline:
- 16 scenario;
- 3 Work Shift;
- deferred consequences;
- hidden trade-off score;
- shift 03 có difficulty 3.

### Weekly Arena

Weekly Arena là competitive mode chính.

Mỗi tuần:
- bắt đầu thứ Hai theo Asia/Ho_Chi_Minh;
- challenge ID/version cố định;
- tất cả người chơi dùng cùng seed;
- 6 bài Toán;
- 2 scenario;
- không dùng xu để mua retry;
- score chỉ reveal sau khi kết thúc.

Ranking:
1. best score giảm dần;
2. nếu bằng điểm: elapsed time tăng dần;
3. sau đó thời điểm cập nhật sớm hơn.

Reward:
- completion reward giống nhau cho mọi người;
- top rank không nhận thêm XP làm tăng khoảng cách progression;
- top rank là recognition/mastery.

Current reward:
- +60 XP một lần/tuần;
- +50 xu một lần/tuần.

Public leaderboard hiện chỉ dùng mã ẩn danh, không tên thật trẻ em.

## 2. Weekly score v1

```text
Math first-attempt accuracy  55
Scenario trade-off quality  30
Time efficiency             15
                            ---
                            100
```

Stars dùng threshold chung:
- 95+: 5★
- 85–94: 4★
- 75–84: 3★
- 65–74: 2★
- dưới 65: 1★

Weekly retry miễn phí vì xu không được tạo lợi thế cạnh tranh. Sai lần đầu vẫn làm mất phần first-attempt score.

## 3. Competition backend

Tables:
- weekly_challenge_attempts
- weekly_challenge_leaderboard

Attempt:
- append-only;
- RLS own SELECT/INSERT;
- không UPDATE/DELETE từ browser.

Leaderboard:
- projection chỉ chứa player code + score;
- không chứa auth UUID;
- không chứa tên/email;
- authenticated chỉ SELECT;
- trigger nội bộ cập nhật best result.

## 4. Current situation bank

Current bank có 16 scenario, trải trên:
- product quality;
- promotion;
- billing;
- customer needs;
- inventory;
- transparency.

Ca 03 — Cuối tuần cao điểm:
- 8 khách;
- 5 scenario;
- đảm bảo ít nhất 1 scenario difficulty 3;
- seeded/replayable.

## 5. Next SmartMart situation families

Ưu tiên tiếp theo, chưa coi là implemented:
- thanh toán tiền mặt + thẻ kết hợp;
- máy quét barcode lỗi;
- cân rau củ sai khối lượng;
- khách đổi ý sau khi đã quét;
- hoàn tiền một phần;
- loyalty/member points;
- mua 2 tặng 1 và điều kiện combo;
- giới hạn số lượng hàng khuyến mãi;
- self-checkout assistance;
- túi mua sắm / phí túi;
- kiểm kê nhanh giữa ca;
- replenishment / restocking;
- khách tìm sản phẩm theo ngân sách;
- sản phẩm thay thế khác đơn vị/khối lượng;
- hàng cận date có markdown theo chính sách;
- queue pressure / mở quầy phụ.

## 6. Depth gate trước khi mở map khác

Không bắt đầu gameplay map khác cho đến khi SmartMart đạt tối thiểu:

- >= 30 scenario chất lượng;
- >= 8 Shopping Mission khác nhau về constraint/event;
- >= 5 Work Shift / role challenge;
- Weekly Arena ổn định;
- class-scoped leaderboard;
- cloud progression;
- event telemetry cho Mission + Challenge;
- content review lớp 4–5;
- mobile/tablet pilot;
- ít nhất một vòng pilot học sinh thật.

Sau depth gate mới đánh giá map thứ hai.
