# Exercise Catalog — SmartMart MVP

SmartMart MVP có **20 Exercise Family**, chia đều 4 family cho mỗi gian.

Mỗi gian:
- 3 family đầu là **Unlock Family**;
- family thứ 4 là **Practice/Advanced Family**;
- học sinh phải hoàn thành 3/3 unlock family để mở gian lâu dài;
- sau khi gian mở, có thể quay lại luyện family nâng cao;
- mỗi exercise instance được sinh deterministic theo student + family + variant seed.

## 1. Rau củ & Hoa quả

| Family ID | Nội dung | Vai trò |
|---|---|---|
| PRODUCE_UNIT_PRICE | Khối lượng × đơn giá → tổng tiền | Unlock |
| PRODUCE_FIND_WEIGHT | Tổng tiền ÷ đơn giá → khối lượng | Unlock |
| PRODUCE_KG_TO_GRAMS | Đổi kg → gam | Unlock |
| PRODUCE_FIND_UNIT_PRICE | Tổng tiền ÷ khối lượng → đơn giá | Practice |

Kỹ năng: nhân, chia, đơn giá, đại lượng.

## 2. Thực phẩm

| Family ID | Nội dung | Vai trò |
|---|---|---|
| FOOD_PORTION_COUNT | Số người × định mức | Unlock |
| FOOD_PACK_COUNT | Tổng số món ÷ số món/gói | Unlock |
| FOOD_EQUAL_SHARE | Chia đều cho các nhóm | Unlock |
| FOOD_STOCK_REMAINING | Tồn kho − đã bán | Practice |

Kỹ năng: nhân, chia, số lượng, định mức.

## 3. Đồ uống

| Family ID | Nội dung | Vai trò |
|---|---|---|
| DRINKS_CHANGE | Tiền khách đưa − hóa đơn | Unlock |
| DRINKS_QUANTITY_TOTAL | Số lượng × đơn giá | Unlock |
| DRINKS_TWO_ITEM_TOTAL | Tổng hóa đơn hai loại | Unlock |
| DRINKS_FIND_UNIT_PRICE | Tổng tiền ÷ số lượng → đơn giá | Practice |

Kỹ năng: cộng, trừ, nhân, chia, hóa đơn.

## 4. Đồ dùng

| Family ID | Nội dung | Vai trò |
|---|---|---|
| SUPPLIES_BUDGET | Ngân sách − nhiều món | Unlock |
| SUPPLIES_PRICE_DIFFERENCE | So sánh chênh lệch giá | Unlock |
| SUPPLIES_MAX_QUANTITY | Mua tối đa trong ngân sách | Unlock |
| SUPPLIES_MULTI_ITEM_TOTAL | Tổng tiền nhiều số lượng/món | Practice |

Kỹ năng: ngân sách, cộng/trừ, nhân/chia, so sánh.

## 5. Khuyến mãi

| Family ID | Nội dung | Vai trò |
|---|---|---|
| PROMO_FINAL_PRICE | Giá sau giảm % | Unlock |
| PROMO_DISCOUNT_AMOUNT | Số tiền được giảm | Unlock |
| PROMO_PRICE_INCREASE | Giá sau tăng % | Unlock |
| PROMO_COMPARE_SAVINGS | So sánh giảm % với voucher | Practice |

Kỹ năng: phần trăm, tăng/giảm giá, so sánh ưu đãi.

## Generation constraints

MVP generator phải đảm bảo:
- prompt không rỗng;
- đáp án hữu hạn;
- đáp án là số nguyên;
- đáp án không âm;
- numeric parameters hữu hạn và không âm;
- phép chia cần đáp số nguyên thì dữ liệu được sinh từ quan hệ ngược để bảo đảm chia hết;
- tiền khách đưa luôn lớn hơn hóa đơn;
- bài ngân sách không sinh giỏ hàng âm;
- cùng student + family + variant tạo lại đúng exercise instance.

Automated test hiện chạy 50 seed cho từng family, tổng cộng 1.000 generated instances mỗi lần CI.

## Progression

Progress được lưu theo:
- stall ID;
- completed unlock family IDs.

Ví dụ:

produce:
- PRODUCE_UNIT_PRICE ✅
- PRODUCE_FIND_WEIGHT ✅
- PRODUCE_KG_TO_GRAMS ⬜

Học sinh đóng trình duyệt và quay lại sẽ tiếp tục ở bài 3/3, không làm lại bài 1.

Practice family không ảnh hưởng trạng thái đã mở của gian.
