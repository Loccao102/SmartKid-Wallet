# Tiny Bank — hình ảnh và cách chơi

Định hướng ngày 2026-10-04: biến Ngân hàng tí hon thành một chuyến khám phá
về tiết kiệm, với cảnh có thể chọn điểm đến và bàn lập kế hoạch dễ hiểu.
Giữ app shell, nhân vật đã tùy chỉnh và thao tác chạm/click điểm đến.
Không thêm joystick, camera toàn màn hình hoặc một hệ điều khiển mới.

Tài liệu này mô tả thiết kế đích; từng hạng mục chỉ được xem là đã triển khai
khi có code và kiểm chứng tương ứng. Contract hiện hành ở [TINY_BANK.md](TINY_BANK.md)
và [WORLD_CHAPTER_CORE.md](WORLD_CHAPTER_CORE.md).

## 1. Cảnh ngân hàng

Cảnh 2D isometric sáng, ấm và có chiều sâu: mái tím lavender, tường kem,
cây xanh, lối đi màu cát và các điểm nhấn vàng của đồng tiền mô phỏng.
Bốn công trình nhỏ cùng nằm trong một khu vườn; khoảng trống giữa chúng
để nhân vật và các nút điểm đến đọc được rõ ràng.

Ảnh nền chỉ chứa cảnh vật. Nhãn tiếng Việt, trạng thái, số chặng, nút và
focus ring do HTML hiển thị để chữ luôn sắc nét và dùng được với bàn phím.
Mỗi công trình có hình dáng riêng, không phụ thuộc màu để phân biệt.

| Chặng | Hình ảnh nhận diện | Nhiệm vụ đang có | Phản hồi trình bày |
| --- | --- | --- | --- |
| Hũ mục tiêu | Hũ tiết kiệm lớn trên bệ tím | Tính khoản còn thiếu hoặc chia đều theo tuần | Tiến trình ba câu; hoàn thành chặng mới nhận dấu đã xong |
| Quầy gửi · rút | Quầy ngân hàng mái hiên, khay đồng xu | Cộng khoản gửi, trừ khoản rút, tính số dư | Số tiền và đơn vị đồng rõ ràng; không biến thành giao dịch xu của người chơi |
| Vườn phần trăm | Ba chậu cây mọc đồng xu | Tính phần được cộng thêm 5%, 10%, 20% | Cây và đồng xu minh họa việc tăng thêm; câu hỏi và đáp án vẫn từ generator |
| Kế hoạch 4 tuần | Bàn sổ tiết kiệm dưới mái che | Chọn cách phân chia tiền trong bốn tuần | Sổ mở, bốn mốc tuần, hũ mục tiêu và hộp dự phòng |

Chặng đang chọn có viền/focus và dấu chỉ vị trí. Chặng mở tiếp theo nổi bật
vừa đủ; chặng đã xong có dấu kiểm; chặng chưa mở có khóa và câu điều kiện.
Chạm chặng khóa vẫn được đọc lý do, không khởi chạy bài.

Nhân vật chuyển nhẹ tới điểm đã chọn. Đây là phản hồi hình ảnh, không thêm
va chạm, tốc độ hay điều kiện đứng đúng vị trí để mở bài. Reduced motion
đổi vị trí ngay, không có hiệu ứng bay hoặc rung bắt buộc.

## 2. Vòng chơi ở sảnh

1. Vào map: ưu tiên chặng đang làm dở, sau đó chặng chưa hoàn thành kế tiếp.
2. Chạm một công trình: thấy tên, nội dung ngắn và điều kiện/trạng thái.
3. Một nút chính: **Bắt đầu khám phá**, **Tiếp tục chặng này**, **Luyện lại**
   hoặc **Mở sổ kế hoạch** tùy tiến trình thật.
4. Hoàn thành ba câu Toán của chặng, xem kết quả rồi trở về cảnh.
5. Học xong ba chặng mở bàn kế hoạch. Hoàn thành kế hoạch theo gate hiện tại
   mới hoàn tất chapter và nhận thưởng qua core.

Phần Toán tiếp tục dùng `WorldChapterQuiz`. Có thể thêm vật minh họa bên
ngoài câu hỏi nhưng không tách một runner ngân hàng mới, thay câu hỏi bằng
trò click, hoặc hiện đáp án qua minh họa.

## 3. Bàn kế hoạch bốn tuần

Màn này là một bàn học với sổ và hai vật chứa tiền, tránh bố cục bảng quản trị.
Hierarchy: **tuần hiện tại → tình huống → phương án → xác nhận → sổ theo dõi**.

- **Hũ mục tiêu:** số đã để dành, mức mục tiêu, phần còn thiếu và mức đầy.
  Mức đầy giới hạn ở 100%; số tiền thật vẫn hiển thị đủ khi vượt mục tiêu.
- **Hộp dự phòng:** số tiền hiện có. Khi dùng dự phòng, hiện khoản đã dùng
  bằng chữ và số, không chỉ đổi màu. Không hù dọa hoặc gắn nhãn “sai”.
- **Thẻ tuần:** “Tuần 2/4”, số tiền nhận từ `round.income` và câu chuyện có sẵn.
- **Ba phương án:** giữ thứ tự seeded, tên và mô tả từ dữ liệu. Có thể thêm
  dòng “Để dành thêm …” và “Dùng dự phòng …” từ các delta đã có.

Vòng quyết định:

1. Đọc câu chuyện và so sánh ba phương án.
2. Chạm một phương án để chọn; viền, dấu chọn và trạng thái accessible
   xác nhận lựa chọn. Có thể chọn thẻ khác trước khi ghi sổ.
3. Nút **Xác nhận kế hoạch** xác nhận đúng một lần. Chỉ bước này gọi
   `chooseBankPlan` và lưu checkpoint; trạng thái chọn tạm không phải lượt đã ghi.
4. Hiện “Đã ghi tuần …”, phương án đã chọn, giải thích có sẵn và số tiền
   vừa thay đổi. Không gọi phương án là đúng/sai, không reveal sao hoặc điểm.
5. Nút **Sang tuần tiếp**; ở tuần cuối là **Xem kết quả**. Không tự nhảy bằng timer.

Sau xác nhận mức đầy của hũ chuyển nhẹ trong 260ms và hiện biên nhận tuần.
Số dư, ledger và khả năng tiếp tục không chờ animation hoàn tất; reduced
motion bỏ animation. Không dùng coin burst giống phần thưởng xu tài khoản.

Sổ theo dõi mở theo nhu cầu trong lúc chơi và mở sẵn ở kết quả. Mỗi dòng
ghi tuần, phương án, khoản tiết kiệm tăng thêm, khoản dự phòng đã dùng
và tổng tiết kiệm. Chỉ đọc lại ledger tính từ cùng seed và `choiceIds`.

## 4. Kết quả dễ hiểu

Sau bốn tuần mới hiển thị sao từ `scoreTinyBankMission` và trạng thái hoàn
thành từ `tinyBankChapter.finalMinStars`. Cho trẻ nhìn lại ba ý: đã tiến
đến đâu với mục tiêu, còn bao nhiêu dự phòng, có dành chỗ cho nhu cầu nhỏ.

Không thêm một điểm tài chính mới. Không mô tả sao này là điểm Toán hay
đánh giá phẩm chất của trẻ. Khi chưa qua gate, dùng lời mời thử kế hoạch
khác; khi chơi lại, giữ best stars và thưởng lần đầu theo core.

## 5. Desktop, tablet và mobile

- Desktop: bốn điểm đến đặt trên cảnh; phần mô tả chặng nằm cạnh cảnh.
  Bàn kế hoạch có vùng hũ/sổ bên cạnh vùng lựa chọn khi đủ chỗ.
- Tablet: giữ cảnh lớn, chuyển mô tả xuống dưới ở chiều rộng 1100px;
  vị trí nút được đặt dưới các công trình để giữ khoảng trống giữa cảnh.
  Thu về một cột trước khi nội dung lựa chọn bị chật.
- Mobile: giữ ảnh cảnh phía trên, bốn nút thành lưới 2×2 bên dưới. Bàn kế
  hoạch theo thứ tự tình huống → số tiền → phương án → nút ghi sổ; không
  cố đặt chữ và nút nhỏ trên ảnh thu nhỏ.
- Vùng chạm ít nhất 44px; hành động chính ưu tiên 52–64px. Văn bản cơ bản
  dễ đọc, nhãn không dùng chữ quá nhỏ, không dùng hover làm cách duy nhất
  để hiểu trạng thái. Không bắt kéo/thả để hoàn thành.
- Tab đi qua các điểm đến và phương án theo thứ tự nội dung. Enter/Space
  kích hoạt nút; focus chuyển về tiêu đề tuần/biên nhận/kết quả khi đổi bước.
  Vùng thông báo chỉ đọc thay đổi cần thiết, không đọc lại toàn màn hình.

## 6. Các bất biến

- Cấp 5 + `mission-class-party-01` vẫn là điều kiện mở map từ resolver chung.
- Giữ lesson IDs, chapter version 1, thứ tự ba chặng Toán rồi mission,
  ba câu mỗi chặng, seed và checkpoint đã cấp. Không sinh số ngẫu nhiên trong UI.
- Giữ nguyên tiền khởi đầu, thu nhập, choices/deltas, seeded shuffle,
  cách replay ledger, score và gate >=3 sao trong dữ liệu/domain hiện có.
- Không biến ba phương án thành phân bổ tự do hoặc tự bổ sung chuyển tiền
  giữa tiết kiệm/dự phòng: đó sẽ là thay đổi gameplay/domain ngoài phạm vi.
- Tiền mô phỏng tách biệt xu người chơi. Phần trăm là bài Toán mô phỏng,
  không quảng bá lãi suất, đầu tư hoặc giao dịch tiền thật.
- Không thêm employee/store world flags, consequence chain, schema lưu
  mới, reward key mới hoặc đường nhận thưởng lặp.
- Reload sau khi ghi tuần phải khôi phục biên nhận và số dư đúng một lần.
  Chạm lặp xác nhận hoặc xem kết quả không ghi/phát thưởng hai lần.

## 7. Kiểm chứng trước khi gọi là hoàn tất

Unit/integration phải bảo vệ resume cùng seed, gate, chọn/xác nhận một lần,
focus, ledger và thưởng lần đầu; build/typecheck phải đạt. Kiểm tra hình ảnh
và console riêng ở 1440×900, 820×1180, 390×844 và chiều rộng 320px, kèm
bàn phím/reduced motion. Ảnh thiết kế hoặc DOM test không thay thế kiểm tra
trình duyệt thật; ghi rõ hạng mục chưa kiểm chứng nếu công cụ còn bị chặn.

## 8. Phần đã triển khai ngày 2026-10-04

- Cảnh vườn ngân hàng mới bằng Imagegen, WebP 1280×853 và 600×400 qua
  `gameAssets.maps.tinyBank`; [prompt và nguồn](assets/tiny-bank-playground-prompt.md).
- Sảnh chọn điểm đến, avatar chung, hướng dẫn ba bước và nút bắt đầu theo
  tiến trình. Mobile giữ trọn ảnh và đưa các nút xuống lưới riêng.
- Bàn kế hoạch có hũ tiền, dự phòng, thu nhập tuần và biên nhận. Preview chỉ
  hiện delta tiền, không reveal sao/điểm; lựa chọn tạm mất khi rời màn, còn
  lựa chọn đã xác nhận tiếp tục dùng checkpoint cũ.
- DOM integration bảo vệ chọn tạm, đổi lựa chọn, bấm lặp, tiếp tục sau reload,
  focus, kết thúc bốn tuần và phần thưởng một lần. Không thay generator/domain.
- Kiểm tra ảnh WebP đã tạo và review source hoàn tất. Kiểm tra layout/console
  trên trình duyệt thật vẫn chưa thực hiện được do lỗi công cụ truy cập local.
  Chủ dự án yêu cầu tiếp tục và đưa lên main sau test; đây không phải xác nhận
  visual/pilot đạt.
