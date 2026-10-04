# UI adventure edition — 2026-10-01

## Kiểm chứng trình duyệt thật — 2026-10-04

Phiên này đã chạy được browser smoke thật bằng Chromium headless (`playwright-core`
1.63.0, kênh Edge hệ thống). Trước đây mục này ghi "công cụ duyệt chặn URL local";
ghi chú đó không còn đúng và đã được gỡ.

Kết quả (Vite dev server tại `http://127.0.0.1:5173`):

- `scripts/check-ui.mjs`: desktop 1440×1080, tablet 820×1180, mobile 390×844.
  Đạt toàn bộ — lưu/hủy avatar và khôi phục sau reload, điều hướng bàn phím,
  bài Toán không đổi sau refresh, mở gian bằng Toán, không tràn ngang,
  không lỗi console/pageerror/request 4xx.
- `scripts/check-supporting-ui.mjs`: ba viewport đạt cho mua sắm, nhiệm vụ,
  thử thách ngày và ca làm.
- `scripts/check-work-avatars.mjs`: Work Mode nạp texture avatar, đổi chặng và
  đổi khách đạt.
- `scripts/check-mobile-fold.mjs` (mới): 6 width × 2 màn (bản đồ, trang chủ) đạt.

Hai lỗi thật được tìm thấy và sửa trong đợt này:

- **Bản đồ mobile**: `.chapter-art { min-height: 245px }` ở breakpoint ≤700px đẩy
  tiêu đề chương nổi bật xuống dưới bottom-nav đang `position: fixed`. Đo được
  tiêu đề `top 714 → bottom 795` trong khi nav bắt đầu ở `762`, tức 33px chữ bị
  che. Sửa trong `src/screen-ui.css` (ảnh chương và padding khối chữ ở ≤700px,
  và `min-height` 450px ở ≤1000px). Sau sửa, tiêu đề `bottom 753` và hiển thị
  trọn ở 320, 360, 390, 414, 820 và 1440px.
- **Trang chủ mobile**: nút chính "Cùng đi thôi" của `.home-adventure-banner`
  bị cắt ở mép vùng nav (`top 758` khi nav bắt đầu `762`). Sửa ảnh banner và
  padding ở ≤700px; sau sửa nút ở `704 → 756`, hiện trọn từ 350px trở lên và ở
  320–340px nằm trọn dưới fold (cuộn là thấy, không bị che).

Kiểm tra mới `check-mobile-fold.mjs` khoá hai lỗi này lại: một phần tử quan trọng
phải hoặc hiện trọn, hoặc nằm trọn dưới fold — không bao giờ kẹt trong dải nav che.

`scripts/check-work-avatars.mjs` cũng đã lỗi thời và được sửa: fixture của nó
(Cấp 10 + `mission-class-party-01`) làm Tiny Bank thành điểm đến nổi bật, nên CTA
đổi nhãn từ "Tiếp tục khám phá" sang "Đến Ngân hàng tí hon" và locator cũ không
khớp. Script giờ vào SmartMart qua nút "Khám phá SmartMart" trong lưới chương nên
không phụ thuộc map nào đang nổi bật.

Cách chạy: khởi động Vite, đặt `PLAYWRIGHT_MODULE_PATH=playwright-core`, rồi
`npm run check:mobile-fold` (tự nhận `playwright-core`), hoặc `npm run check:ui`,
`npm run check:supporting-ui`, `npm run check:work-avatars`. Ảnh chụp nằm trong
`output/ui-redesign/` và không vào Git. Mọi hạng mục ở đây là kiểm tự động trong
Chromium headless trên Windows; cử chỉ chạm thật và thiết bị thật vẫn chưa kiểm.

Một phát hiện chưa xử lý: production build tạo chunk `avatarSvg` ~1.37 MB
(~358 KB gzip) dùng cho texture avatar của Phaser trong Work Mode. Chunk này
**không** nằm trong `modulepreload` của `dist/index.html` và không được tải ở
lần vẽ đầu (Phaser cũng không tải), nên không ảnh hưởng màn đầu; nhưng khi mở
Work Mode thì đây là payload lớn cần tối ưu sau.

## Luồng bài Toán và nhiệm vụ — 2026-10-04

- Bài Toán chuyển focus sang nút thử lại sau đáp án sai, rồi trở về ô nhập
  sau khi mở lượt mới. Khi ví không đủ xu, nút nói rõ lượt hỗ trợ miễn phí
  vốn có; không thay mức phí 5–30 xu, XP hoặc điều kiện mở gian.
- Chặn kích hoạt lặp trong cùng bước để một lần bấm liên tiếp không ghi hai
  math attempt, trừ phí hai lần hoặc gọi hoàn thành bài hai lần.
- Màn mua sắm dùng tên nhiệm vụ đang chọn, lời dẫn phù hợp với gian bắt buộc
  hoặc tùy chọn. Focus theo tiêu đề khi vào màn, hoàn thành và chơi lại,
  kể cả thanh toán từ giỏ hàng dạng modal.
- DOM integration kiểm tra free recovery, phí tăng dần, practice miễn phí,
  thao tác lặp, tên nhiệm vụ và chuyển focus. Không thay đổi scoring/domain.

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

Chương Ngân hàng được ghi riêng ở [TINY_BANK.md](TINY_BANK.md). Pass này đã lên
main qua PR #26 theo yêu cầu trực tiếp của chủ dự án sau khi được thông báo
giới hạn kiểm chứng. Giới hạn đó đã được gỡ trong phiên 2026-10-04: browser smoke
thật chạy được trên desktop/tablet/mobile và không ghi nhận lỗi console. Xem mục
"Kiểm chứng trình duyệt thật" ở đầu file cho kết quả và hai lỗi đã sửa.

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
- Chạy Vite, sau đó chạy một trong các script smoke: `npm run check:ui`,
  `npm run check:supporting-ui`, `npm run check:work-avatars`,
  `npm run check:mobile-fold`. Chúng dùng `playwright-core` (đã là devDependency)
  và kênh Edge hệ thống; có thể chỉ định `PLAYWRIGHT_MODULE_PATH`,
  `UI_BROWSER_CHANNEL`, `UI_BASE_URL`.
- Browser smoke sử dụng browser context mới riêng cho mỗi viewport, không thay dữ liệu tài khoản người dùng: desktop 1440×1080, tablet 820×1180, mobile 390×844.
- Kiểm tra lưu/hủy avatar, persistence khi reload, tab bàn phím, Escape, bài Toán không đổi khi reload, giải đủ 3 bài mới mở gian, không tràn ngang và không lỗi console/asset.
- Screenshot và kết quả nằm trong `output/ui-redesign/` (không đưa vào Git).

## Giới hạn hiện tại

Một số CSS legacy vẫn còn vì các gameplay screen dùng chung selectors. Main bundle và Phaser vẫn phát cảnh báo kích thước Vite; screen splitting đã giảm main JS từ khoảng 867 KB xuống 574 KB trước nén. Chưa chạy user testing với học sinh thật, chưa triển khai production và chưa thay các vector props cũ bằng bộ sprite animation mới.

Kết quả kiểm tra gần nhất (2026-10-04): 30 test files / 138 tests đạt,
`npm run build` đạt. Bốn script browser smoke đạt trên Chromium headless
(xem mục đầu file): `check-ui.mjs` ba viewport, `check-supporting-ui.mjs` ba
viewport, `check-work-avatars.mjs`, và `check-mobile-fold.mjs` sáu width × hai
màn. Các ảnh kiểm tra được quan sát trực tiếp; lỗi tràn ngang world/mobile, modal
avatar/mobile, tiêu đề chương bị bottom-nav che và nút chính trang chủ bị cắt
đã sửa. Chạy `npm run check:supporting-ui` để tái kiểm tra các màn hỗ trợ với
fixture progress cô lập.

Chế độ đi dạo cũng đã được kiểm tra trên ba viewport với avatar đã đổi tóc, áo và kính. Player Phaser dùng cùng SVG renderer với React; viewport mobile dùng aspect ratio của map để bỏ khoảng trống thừa.
