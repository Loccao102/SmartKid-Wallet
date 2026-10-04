# Ngân hàng tí hon — đợt phát triển đầu

Phạm vi được chủ dự án mở trực tiếp ngày 2026-10-03. Không coi đây là chứng nhận
SmartMart depth gate/pilot đã hoàn tất. Restaurant và Weekend Market không mở rộng.

## Trải nghiệm

- Sảnh dùng cảnh vườn ngân hàng trong `gameAssets.maps.tinyBank`, nhân vật
  đã tùy chỉnh và bốn điểm khám phá. Chọn điểm đến để xem nội dung/điều kiện;
  nhân vật chuyển vị trí nhẹ trên cảnh. Không thêm joystick hoặc thay app shell.
- Hũ mục tiêu → Quầy gửi/rút → Vườn phần trăm: mỗi chặng có ba bài Toán có seed.
- Hoàn thành cả ba chặng mở Kế hoạch tiết kiệm 4 tuần.
- Bàn kế hoạch: chọn một phương án để xem thay đổi tiền, sau đó bấm
  **Xác nhận kế hoạch** mới ghi tuần. Có thể đổi phương án trước khi xác nhận;
  lựa chọn tạm chưa được lưu khi rời màn. Hũ tiền luôn phản ánh số đã ghi.
- Sổ theo dõi ghi lựa chọn, khoản để dành và quỹ dự phòng mỗi tuần. Chỉ trình bày
  tổng kết sao ở cuối kế hoạch. Đây là mô phỏng kế hoạch cá nhân, không tạo
  employee/store world flags hoặc hậu quả persistent trong Learning Mode.
- Bài đang làm và tuần đang chọn có thể tiếp tục sau khi quay về sảnh hoặc
  tải lại trang. Số tiền, câu hỏi, số lần sai và lựa chọn đã xác nhận được giữ.
- Desktop/tablet dùng điểm đến trên cảnh; mobile tách các nút thành lưới dưới
  hình để giữ nhãn và vùng chạm. Reduced motion tắt chuyển động nhân vật.

## Contract được giữ

- Map mở ở Cấp 5 và hoàn thành `mission-class-party-01` qua unlock resolver chung.
- Giữ nguyên lesson IDs, chapter version 1, generator, câu trả lời, scoring,
  mốc hoàn thành >=3 sao và reward keys. Chơi lại không nhận thưởng lần đầu lần nữa.
- Tiền bài tập tách khỏi xu người chơi; không gửi/rút xu thật từ tài khoản.
- Dùng World Chapter Core cho RNG/progress/reward/quiz; không tạo store riêng mới.
- Progress factory schema 2 giữ dữ liệu v1 và thêm checkpoints; xem
  [WORLD_CHAPTER_CORE.md](WORLD_CHAPTER_CORE.md).
- Assets của Tiny Bank tách riêng SmartMart; avatar dùng renderer chung.

## Kiểm tra và giới hạn

Unit/integration kiểm tra migration, seed/checkpoint sau reload, lựa chọn lặp,
ledger và số dư, quiz retries, mở tuần/chặng và phần thưởng một lần.
Build/typecheck và toàn bộ test phải qua trước khi phát hành.

Kết quả đợt 2026-10-03: 25 test files / 112 tests đạt, production build đạt,
7 file CSS đã sửa parse thành công. DOM integration chạy trong Happy DOM,
kiểm tra focus theo tuần và hoàn thành/chơi lại; không thay thế trình duyệt thật.

Đợt hình ảnh/bàn kế hoạch 2026-10-04: 28 test files / 122 tests đạt,
build/typecheck đạt. Ba test mới kiểm tra đổi lựa chọn chưa ghi tiền, xác nhận
lặp, rời màn trước xác nhận, khôi phục biên nhận và hoàn thành đúng một lần.
Hai file CSS liên quan parse thành công, không có token nền tảng thiếu.

Kiểm tra trình duyệt desktop/tablet/mobile và console đã chạy trong phiên 2026-10-04
(Chromium headless qua `playwright-core`, Edge kênh hệ thống). Không ghi nhận lỗi
console và không có tràn ngang ở cả ba viewport; luồng Ngân hàng render đúng trên
mobile 390×844 và tablet 820×1180. Hạng mục này đã đóng, không còn là giới hạn.
Ghi chú cũ về việc công cụ duyệt chặn URL local không còn đúng. Thiết kế hình ảnh
và bàn kế hoạch đợt 2026-10-04: [TINY_BANK_DESIGN.md](TINY_BANK_DESIGN.md).

Thao tác chạm/cảm ứng thật (vuốt, giữ, kéo) vẫn cần thiết bị thật; các bước dưới
đã được kiểm tự động hoặc kiểm bằng chụp màn hình thật.

Kiểm tra thủ công còn lại:
1. Từ hồ sơ đạt Cấp 5 + Liên hoan lớp, mở Ngân hàng; thử điểm chưa mở.
2. Làm sai một câu, nhập đáp án mới, rời sảnh/tải lại rồi tiếp tục đúng câu đó.
3. Hoàn thành đủ 3 chặng Toán; kiểm tra sổ kế hoạch mới mở.
4. Chọn thử rồi đổi phương án ở tuần 1: số dư chưa đổi. Xác nhận rồi tải lại;
   xem đúng lựa chọn/số dư, không cộng hai lần, không bỏ qua tuần.
5. Đi hết 4 tuần, xem sổ và kết quả; chơi lại, xác nhận không thưởng XP/xu lần đầu nữa.
6. Thao tác chạm/cảm ứng thật ở 1440×900, 820×1180, 390×844 và 320px: phím
   Tab/Enter, focus, vùng chạm, tràn ngang, reduced motion và console đã được kiểm
   tự động (xem mục kiểm tra phía trên); phần còn lại là cử chỉ chạm thật.
