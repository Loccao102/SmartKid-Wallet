# Character System — SmartKid Wallet

## Mục tiêu

Hệ nhân vật phải:
- có phong cách chibi RPG 2D, thân thiện với học sinh lớp 4–5;
- đầu lớn, thân và chân ngắn, bàn tay tròn, giày chunky; silhouette đọc rõ khi thu nhỏ;
- mắt lớn có iris/điểm sáng, má tròn, tóc chia lớp và trang phục có cel shading;
- dùng chung renderer cho player và NPC;
- hỗ trợ custom avatar mà không cần tạo full asset cho mọi tổ hợp.

## Kiến trúc

### Catalog

`src/avatar/avatarCatalog.ts`

Chứa:
- AvatarConfig;
- body / skin / hair / eyes / outfit / accessory options;
- default student avatar;
- NPC presets;
- deterministic NPC resolver `getNpcAvatarConfig()`.

### Renderer

`src/components/avatar/AvatarCharacter.tsx`

Layered SVG renderer, canvas chuẩn `240×300` qua `AVATAR_ART_SIZE`.

Player và NPC dùng cùng anatomy:
- head;
- neck;
- torso;
- short arms + rounded hands;
- short separated legs;
- shoes;
- hair;
- face;
- accessories.

Có props:
- age: child | adult;
- expression;
- uniform;
- decorative / accessible label.
- framing: full | portrait (crop riêng cho thumbnail khuôn mặt/tóc/biểu cảm).

Tám kiểu tóc có lớp sau đầu và mái trước mặt riêng; phần mái không bị mặt che.
Shading được suy ra từ màu đã chọn, không đổi màu lưu trong config. SVG không dùng
ID gradient/filter nên nhiều thumbnail đồng thời không xung đột, và texture Phaser
không phụ thuộc CSS ngoài. Renderer tự thêm class `avatar-character`.

### Persistence

`src/store/avatarProfile.ts`

Local persisted config:
`smartkid-wallet-avatar-v1`

Sau khi có production account, config này có thể sync lên Supabase student profile.

### Customizer

`src/features/profile/AvatarCustomizer.tsx`

Player hiện custom được:
- body type;
- skin tone;
- eye style;
- hair style;
- hair color;
- top color;
- bottom color;
- shoe color;
- accessory.

Customization là cosmetic-only, không ảnh hưởng điểm số hay gameplay advantage.

Customizer hiện dùng một draft giao dịch trong `AvatarCustomizer`: mọi thay đổi
chỉ xuất hiện ở preview cho tới khi học sinh bấm `Lưu nhân vật`. `Hủy` hoặc nút
đóng modal bỏ toàn bộ draft. UI chia thành bốn tab (khuôn mặt, tóc & phụ kiện,
trang phục, biểu cảm), các lựa chọn hình dáng dùng thumbnail renderer để học
sinh lớp 4–5 có thể nhận ra kết quả trước khi chọn. Các nút chính có kích thước
touch tối thiểu 44px và tablist hỗ trợ phím mũi tên/Home/End. Biểu cảm chỉ là
preview trong customizer, không được ghi vào profile avatar.

### First-run và persistence

`src/store/avatarProfile.ts` giữ `hasCreatedAvatar` cùng config. Storage key vẫn
là `smartkid-wallet-avatar-v1` để không làm mất profile cũ; schema hiện tại là
version 2. Migration chuẩn hóa các option không còn tồn tại về `defaultStudentAvatar`.
Với payload version 1, avatar đã được đổi khác mẫu mặc định được xem là đã tạo;
payload chưa đổi mẫu sẽ mở được flow tạo lần đầu.

Flow có thể được mở từ bất kỳ screen/world nào bằng API:

```tsx
<AvatarCustomizer
  onClose={() => setAvatarOpen(false)}
  onSaved={() => continueToWorld()}
  initialTab="face"
/>
```

`onSaved` là callback tùy chọn, chạy sau khi store đã ghi config và đánh dấu
`hasCreatedAvatar = true`. Entry point có thể đọc primitive
`useAvatarProfileStore((state) => state.hasCreatedAvatar)` để yêu cầu tạo nhân
vật trước khi vào màn chơi. Avatar không chặn unlock stall hoặc các quy tắc
progression Toán.

### Map asset boundary

Mỗi map giữ asset art riêng trong registry `src/assets/registry.ts` và namespace
asset của map trong `public/assets`. Avatar là lớp nhân vật dùng chung, còn nền,
props, palette môi trường và portrait frame phải lấy từ namespace map đang mở;
không đặt asset SmartMart vào renderer avatar. Map mới dùng core world chapter
để giữ progress/RNG/quiz/reward chung và chỉ thay phần scene-specific art.

## NPC

Work Mode không dùng ảnh customer cứng nữa.

NPC được resolve deterministically từ customer ID:
- cùng customer key → cùng diện mạo;
- queue khác nhau → nhiều preset khác nhau;
- Work Mode React scene và Phaser scene dùng cùng `AvatarCharacter`, không có bộ vẽ NPC riêng bằng Graphics.

Khi cần NPC quan trọng có identity cố định lâu dài, thêm preset ID explicit vào content thay vì phụ thuộc hash.

## Expression set

Renderer hỗ trợ:
- neutral;
- happy;
- thinking;
- confused;
- concerned.

Expression phản ánh context UI, không dùng để suy luận đúng/sai về lựa chọn đạo đức của học sinh.

## Art direction

- Chibi RPG 2D, khoảng hai đầu cao, viền có màu và cel shading nhẹ.
- Đầu chiếm khoảng nửa chiều cao nhân vật; thân nhỏ, tay chân ngắn, giày bo tròn.
- Mắt có iris, điểm sáng và biểu cảm; mũi/miệng đơn giản, má có blush nhẹ.
- Tóc có silhouette riêng (tóc nhọn, rẽ bên, bob, đuôi ngựa, xoăn, gợn, tém, búi).
- Áo cổ nhỏ, cúc, huy hiệu, thắt lưng; phụ kiện túi đeo, kính, mũ, băng đô cùng nét vẽ.
- Không glossy 3D face.
- Không tay que.
- Không đổi silhouette chỉ bằng màu áo.
- NPC cần đa dạng tóc, màu da, dáng người, outfit và phụ kiện.
- Không gán tính cách/năng lực học tập theo ngoại hình.

## Future extension

Có thể thêm sau:
- cosmetic unlock theo badge/mission/level;
- outfit inventory;
- seasonal items;
- work uniforms theo role;
- expression animation;
- character portrait export;
- server sync;
- teacher-safe avatar presets.

Không biến cosmetic thành pay-to-win hoặc competitive advantage.

Nhân vật trong chế độ đi dạo SmartMart và NPC Work Mode dùng cùng `AvatarCharacter`
với React: serialize SVG nội bộ sang data URL base64 UTF-8 và tải thành texture Phaser
khi vào scene. Giữ tỷ lệ canvas, không kéo dài thân nhân vật để vừa khung cũ. Không
cần thư viện render phía server, không thay logic di chuyển hoặc tương tác.

Art pass chibi chỉ thay renderer và framing; vẫn giữ nguyên option ID và persistence
version 2. Avatar đã lưu giữ nguyên tóc, màu, dáng và phụ kiện khi chuyển sang nét vẽ mới.
Biểu cảm preview dùng chính diện mạo đang chỉnh, không thay về nhân vật mặc định.

Visual review: `scripts/capture-avatar-art.mjs` tạo contact sheet từ production renderer;
`scripts/check-ui.mjs` kiểm tra save/cancel/reload, keyboard và desktop/tablet/mobile;
`scripts/check-supporting-ui.mjs` kiểm tra nhân vật ở walking/work scenes.

## Kit art đã chốt

Baseline chibi RPG v1, reference sheet, manifest, SVG, portrait và snapshot
source được lưu tại [docs/kits/chibi-rpg-v1/README.md](kits/chibi-rpg-v1/README.md).
Kit dùng canvas `240×300`, portrait `viewBox="28 8 190 178"`, front pose tĩnh và
không cam kết animation atlas. Giữ nguyên v1 để đối chiếu; các lần mở rộng xuất
version kit mới và giữ tương thích avatar đã lưu.
