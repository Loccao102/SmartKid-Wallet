# Production UI — đợt 1

Tham chiếu: `ASTRA_UI_BRIEF.md`, `PRODUCT_SPEC.md`, `UI_DESIGN.md` và cả 9 ảnh trong `assets/concepts/production-v1/`.

## Phạm vi đã dựng

Theo thứ tự brief:

1. **App shell + navigation**: header/HUD gọn, desktop navigation, tablet hai hàng, mobile bottom navigation; skip link và chuyển focus về nội dung khi chuyển màn. Work Mode dùng header màu trầm riêng.
2. **World Map**: cảnh đảo nối bằng cầu, bốn địa điểm minh họa, SmartMart là điểm đến hoạt động. Ba bản đồ tương lai hiển thị “Sắp ra mắt”, không hứa mở bằng tiến trình chưa được triển khai.
3. **SmartMart Hub**: 5 gian trong không gian siêu thị, nhân vật nhất quán, trạng thái/tiến độ lấy từ store. Mặc định chọn trực tiếp gian bằng HTML; chế độ đi dạo Phaser vẫn lazy-load, dùng chung artwork và giữ tương tác/collision cũ.
4. **Unlock Exercise**: dialog có bối cảnh gian, tiến độ từng bài, nhập số, phản hồi, thông báo mở gian. Native dialog quản lý focus/modal, Escape đóng, trả focus cho gian đã chọn. Mobile chuyển thành một cột; tôn trọng reduced motion.

Không sửa `src/domain`, `src/store`, dữ liệu exercise/mission/scenario hoặc schema persistence. Generator, seed, thứ tự mở gian, luyện lại và điều kiện mở Mission giữ nguyên. Header tiếp tục dùng profile mẫu hiện có, không thêm tiền/XP giả hoặc khẳng định lưu cloud.

Các chỉnh sửa phụ để shell dùng được với màn cũ: bỏ nested main, tăng ô +/- theo touch target; bỏ render ResearchExportPanel và seed kỹ thuật trong student UI. Research logging/sync vẫn chạy, component export còn trong source để tích hợp workspace có phân quyền sau này. Đợt này chưa tạo Researcher/Admin workspace.

## Artwork

- 12 SVG gốc, tự dựng bằng code tại `public/assets/production/`; không dùng ảnh concept làm runtime background.
- Registry: `src/assets/registry.ts` → `gameAssets.production`.
- Tái tạo: `node scripts/generate-ui-art.mjs`.
- Chữ, nút, bài Toán và tiến trình đều render bằng UI; SVG chỉ chứa hình minh họa.
- Một nhân vật học sinh dùng chung trong HUD, map, hub, dialog và Phaser. Employee/customer character sheets, expression library, atlas và art polish còn thuộc các đợt sau.

## Kiểm tra

Đợt kiểm tra ngày 2026-09-29:

- `npm run build`: TypeScript + Vite qua. Vẫn có cảnh báo kích thước bundle; Phaser đã tách lazy chunk.
- `npm test`: 6 file, 29 test qua.
- Browser smoke thủ công trên localhost: hoàn thành đủ 15 bài, mở đúng thứ tự 5 gian, Mission chỉ bật sau gian cuối; vào được Mission 01.
- Nhập sai không mở gian; nhập đúng bằng Enter; nút tiếp tục nhận focus; luyện lại gian đã mở; Escape đóng và trả focus.
- Refresh khi ở bài 2: cùng đề/cùng tiến trình; refresh sau 5/5: cả 5 gian vẫn mở.
- Desktop 1280px, tablet 820px, mobile 390px và 320px; sửa overflow header tablet, kiểm tra không tràn ngang ở map/hub 320px. Đã xem modal mobile và kiểm tra các nút hub không nhỏ hơn 44px.
- Phaser lazy-load, asset mới và canvas render không ghi console error trong smoke; chưa kiểm thử tự động việc giữ nút di chuyển/collision trên thiết bị cảm ứng thật.

Đây là nền tảng UI đợt đầu, chưa phải tuyên bố toàn bộ production/pilot gate đã đạt. Smoke trình duyệt là kiểm tra thủ công, chưa có bộ E2E tự động trong repo.

## Tiếp tục theo brief

5. Stall/Shopping interaction — dùng product/cart contracts hiện có, giữ ranh giới Learning.
6. Mission 01 — objective/budget/reserve theo domain (không chép các số trong concept).
7. Work Mode cashier.
8. Work Scenario.
9. Work Result — tách learning/work performance khỏi simulation metrics.
10. Profile/Leaderboard.

Các màn 5–10 hiện vẫn giữ flow cũ trong shell mới, chưa được dựng lại theo concept. Cloud progression, auth/role boundary và nội dung mới nằm ngoài thay đổi UI này.
