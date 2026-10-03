# UI adventure edition — 2026-10-01

## Pass responsive và màn chơi — 2026-10-03

Theo phản hồi chủ dự án, giữ hướng minh họa và overview SmartMart, chỉnh trang
bản đồ đầu tiên thân thiện hơn: lời dẫn ngắn, CTA rõ, Ngân hàng làm điểm đến
nổi bật khi đủ Cấp 5 + Liên hoan lớp, các map còn lại luôn hiện thành danh sách
trên mobile thay vì phải đoán thao tác vuốt ngang. SmartMart vẫn truy cập được.

Sửa các lỗi xác định từ source/CSS:
- nav tablet bị `order` cũ đẩy sai vị trí, nhãn mobile chật và tên hồ sơ dài;
- giỏ hàng tablet thiếu bottom anchor, badge sản phẩm chồng và vùng chạm 42px;
- profile tablet bị rule cuối file ghi đè bố cục một cột;
- avatar kết quả Work Mode bị selector SVG ẩn nhầm trên mobile;
- modal dài khó tìm nút đóng, hàng thanh âm lượng bị flex ghi đè grid;
- step controls avatar ở 320px chật, footer sticky chiếm màn hình thấp;
- quiz/chặng Ngân hàng: chữ hướng dẫn quá nhỏ, heading/nút cần wrap, focus cần
  theo câu/tuần mới khi nút cũ biến mất.
- SmartMart mobile kế thừa padding-top 118px của map cũ dù biển hiệu đã về
  document flow, tạo khoảng trống thừa trước các gian. Đã reset padding, đưa
  nhân vật/hướng dẫn lên đầu khu chơi, làm nổi gian tiếp theo và hiển thị ba
  nấc bài Toán theo tiến trình sẵn có.
- Trang ngoài: tên gian dưới đường tiến trình dễ đọc hơn khi xuống dòng;
  các nút hoạt động trang chủ có cột icon/chữ/mũi tên rõ ràng, chuyển thành
  danh sách ở tablet hẹp. Nhiệm vụ đủ điều kiện không còn hiện icon khóa.

Chương Ngân hàng được ghi riêng ở [TINY_BANK.md](TINY_BANK.md). Đây là thay đổi
trên feature branch, chưa xác nhận visual desktop/tablet/mobile: công cụ browser
đã chặn URL local. DOM integration, CSS parse và build không thay thế kiểm tra
hình ảnh/thao tác chạm thực tế. Cần hoàn tất gate này trước khi đưa lên main.

## Hướng thiết kế

Phiêu lưu 2D, minh họa như game cho học sinh lớp 4–5. Bảng màu kem, xanh lá, vàng nắng; ngân hàng có màu tím nhạt, nhà hàng màu đào, chợ màu vàng. UI dùng Lucide; artwork không chứa chữ nên nội dung vẫn có thể đọc bằng trình đọc màn hình.

## Phạm vi đã thay đổi

- Shell, navigation desktop/tablet/mobile, typography, nút chính và trạng thái chờ theo màn.
- Bản đồ: SmartMart làm điểm đến chính, nhân vật của em đi cùng, tiến trình 5 gian, ảnh riêng cho từng điểm đến.
- Trang chủ: lựa chọn học, luyện, thử thách và nhiệm vụ bằng tiếng Việt, không dùng thống kê mẫu để gợi ý năng lực.
- SmartMart: 5 gian với trạng thái mở/khả dụng/khóa, touch target lớn, nhân vật đồng bộ với profile.
- Bài Toán: khung task lớn, phản hồi và đáp án dễ đọc, bố cục một cột trên điện thoại.
- Phòng nhân vật: tùy chỉnh trực quan theo nhóm, xem trước, lưu/hủy, migration dữ liệu cũ. Biểu cảm chỉ là xem trước; không lưu biểu cảm theo tình huống vào profile.
- Profile: nhân vật làm trọng tâm, asset mới cho các chương, loại bỏ chuỗi học mẫu và điểm ẩn khỏi phần trình bày.
- Nhiệm vụ và bảng xếp hạng: thống nhất hình thức, copy dễ hiểu; giữ mã chơi ẩn danh.
- Các màn được lazy-load; Phaser vẫn là bundle riêng. Khu giáo viên chỉ đổi sang lazy load, không thiết kế lại nghiệp vụ quản lý lớp trong pass này.

Không sửa curriculum, generator, phần thưởng, phí thử lại, rubric, hậu quả mô phỏng hoặc điều kiện progression. Không thêm gameplay map mới. Map asset riêng không đồng nghĩa map gameplay được phát hành.

## Asset

Registry: `src/assets/mapPacks.ts`, được export qua `src/assets/registry.ts`.

Mỗi map có thư mục riêng tại `public/assets/maps/<map-id>/`:

- `scene.webp`: ảnh cảnh 1280px.
- `thumbnail.webp`: ảnh preview 600px, khoảng 70–88 KB.
- `landmark.svg`: vector landmark hiện có, giữ tương thích với scene cũ.

SmartMart có thêm `stalls/`, `products/`, `environment/`. Không tải scene full của map khác ở trang đầu; ảnh preview dùng lazy loading. Ảnh SmartMart chính dùng srcset/sizes và ưu tiên tải.

Ảnh mới tạo bằng built-in imagegen. Prompt lưu ở `docs/assets/adventure-art-prompts.md`. `scripts/prepare-adventure-assets.mjs` mã hóa WebP từ bản gốc imagegen bằng sharp; không cần chạy khi build.

## Persistence

Chỉ avatar thay schema: giữ storage key cũ, version 2, migration và normalize cả payload cùng version. Không cần migration progression hoặc Supabase. Avatar hiện lưu theo thiết bị; chưa đồng bộ giữa các thiết bị.

## Kiểm tra

- `npm test`: kiểm tra domain, avatar migration và asset pack.
- `npm run build`: TypeScript + Vite.
- Chạy Vite, sau đó `node scripts/check-ui.mjs` với Playwright có sẵn; có thể chỉ định `PLAYWRIGHT_MODULE_PATH`, `UI_BROWSER_CHANNEL`, `UI_BASE_URL`.
- Browser smoke sử dụng browser context mới riêng cho mỗi viewport, không thay dữ liệu tài khoản người dùng: desktop 1440×1080, tablet 820×1180, mobile 390×844.
- Kiểm tra lưu/hủy avatar, persistence khi reload, tab bàn phím, Escape, bài Toán không đổi khi reload, giải đủ 3 bài mới mở gian, không tràn ngang và không lỗi console/asset.
- Screenshot và kết quả nằm trong `output/ui-redesign/` (không đưa vào Git).

## Giới hạn hiện tại

Một số CSS legacy vẫn còn vì các gameplay screen dùng chung selectors. Main bundle và Phaser vẫn phát cảnh báo kích thước Vite; screen splitting đã giảm main JS từ khoảng 867 KB xuống 574 KB trước nén. Chưa chạy user testing với học sinh thật, chưa triển khai production và chưa thay các vector props cũ bằng bộ sprite animation mới.

Kết quả kiểm tra gần nhất: 19 test files / 93 tests đạt. Browser smoke UI chính đạt cả ba viewport; supporting smoke mua sắm, nhiệm vụ, thử thách ngày và ca làm đạt cả ba viewport. Các ảnh kiểm tra được quan sát trực tiếp; lỗi tràn ngang world/mobile và modal avatar/mobile đã sửa. Chạy thêm `node scripts/check-supporting-ui.mjs` để tái kiểm tra các màn hỗ trợ với fixture progress cô lập.

Chế độ đi dạo cũng đã được kiểm tra trên ba viewport với avatar đã đổi tóc, áo và kính. Player Phaser dùng cùng SVG renderer với React; viewport mobile dùng aspect ratio của map để bỏ khoảng trống thừa.
