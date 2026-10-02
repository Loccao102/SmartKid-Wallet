# Chibi RPG Character Kit v1

Kit hình ảnh chibi RPG 2D đã chốt cho SmartKid Wallet, phù hợp học sinh lớp
4–5. Kit được lưu với `version: 1.0.0` và `savedOn: 2026-10-02`.

## Phạm vi kit

- `reference-sheet.png`: bảng mẫu tám nhân vật đã được chốt.
- `manifest.json`: version, palette, option IDs, preset và danh sách file.
- `svg/`: hình nhân vật full body cho tám kiểu tóc: `short`, `side`, `bob`,
  `ponytail`, `curly`, `waves`, `crop`, `bun`.
- `portraits/`: crop chân dung tương ứng cho preview và lựa chọn trong
  customizer.
- `expressions/`: năm mẫu biểu cảm; `svg/default-student.svg` và
  `svg/smartmart-uniform.svg`: avatar mặc định và đồng phục.
- `source/src/avatar/avatarCatalog.ts` và
  `source/src/components/avatar/AvatarCharacter.tsx`: snapshot source đã đóng
  băng của catalog và renderer tại thời điểm kit được lưu.
- `source/src/game/avatarSvg.ts`: snapshot cầu nối serialize SVG cho Phaser.

Trong repo, asset nằm ở `public/assets/characters/chibi-rpg/v1/`, còn README và
source snapshot ở `docs/kits/chibi-rpg-v1/`. Bản ZIP `docs/kits/chibi-rpg-v1.zip`
gom thành một thư mục gồm `README.md`, `assets/`, `source/` để lưu trữ hoặc bàn giao.
`assets/manifest.json` ghi SHA-256 từng SVG, bảng mẫu và các source snapshot.

Các file SVG trong kit là asset tĩnh front pose. Kit không hứa hẹn animation,
walk cycle hoặc sprite atlas; animation chỉ được thêm qua một art pass riêng.

## Baseline được chấp nhận

- Canvas full body: `240 × 300`, dùng `AVATAR_ART_SIZE`.
- Portrait framing: `viewBox="28 8 190 178"`.
- Silhouette đầu lớn, thân và chân ngắn, tay tròn, giày chunky.
- Layer chính: back hair → body → head/face → front hair → accessory.
- Màu option đi qua cel shading suy ra từ màu catalog; không đổi giá trị màu đã
  lưu trong `AvatarConfig`.
- Player và NPC dùng chung `AvatarCharacter`; không có renderer NPC riêng.

## Nguồn runtime

Catalog và persistence hiện tại nằm tại:

- `src/avatar/avatarCatalog.ts`
- `src/components/avatar/AvatarCharacter.tsx`
- `src/store/avatarProfile.ts`

Phaser lấy SVG đã render từ React, serialize bằng
`src/game/avatarSvg.ts`, rồi tải thành texture khi scene khởi tạo. SmartMart
player dùng avatar profile hiện tại; Work Mode NPC dùng `getNpcAvatarConfig()`
deterministic. Nhân vật là lớp dùng chung; background, stall, prop và portrait
frame vẫn thuộc namespace asset của từng map.

## Quy tắc mở rộng

V1 là bản gốc lưu trữ; giữ nguyên các file trong kit. Phát triển trên source runtime
hiện tại, đối chiếu với v1 rồi xuất một phiên bản kit mới khi chốt lần tiếp theo.
Thay đổi anatomy hoặc xóa/đổi nghĩa option ID cần major version mới; bổ sung tương
thích có thể tăng minor version.

Thêm cosmetic không breaking cần:

1. thêm ID vào catalog, giữ nguyên ID cũ; manifest của bản mới sinh từ catalog;
2. thêm layer vào renderer dùng chung;
3. giữ profile v2 khi chỉ thêm option; nếu đổi cấu trúc, xóa hoặc đổi nghĩa option,
   cập nhật persistence version và migration để avatar cũ vẫn tải được;
4. cập nhật preview, Phaser serialization và asset registry nếu có file mới;
5. kiểm tra fallback, desktop/tablet/mobile và không gán năng lực học tập cho
   ngoại hình.

Cosmetic chỉ thay diện mạo, không tăng điểm, xu, tốc độ mở stall hay lợi thế
competitive. Không đưa asset map vào character renderer và không dùng asset
nhân vật để thay thế artwork riêng của map.

## Xuất bản ứng viên cho lần mở rộng tiếp theo

Trong repo đã cài dependencies, chạy (thay version và ngày theo lần xuất):

```sh
node scripts/export-avatar-kit.mjs --version 1.1.0 --date 2026-10-02
```

Script dùng React SSR và Vite để xuất SVG từ component thật, không cần browser hay
API bên ngoài. Kết quả nằm ở `output/ui-redesign/chibi-kit-candidate/`, không ghi đè
kit v1. `scripts/capture-avatar-art.mjs` tạo bảng mẫu trên dev server để review hình
ảnh. Khi chốt, đóng gói asset, source, manifest và bảng mẫu vào phiên bản mới.

Các source snapshot là component React/TypeScript và catalog, không phải một app
độc lập. Bản kit này không thay đổi gameplay, schema dữ liệu hoặc nội dung học.
