# Character System — SmartKid Wallet

## Mục tiêu

Hệ nhân vật phải:
- giống hình dáng con người hơn placeholder cũ;
- thân thiện với học sinh lớp 4–5 nhưng không quá chibi;
- có tay/chân phân đoạn rõ (bắp tay, khuỷu, cẳng tay, bàn tay; đùi, gối, cẳng chân, giày);
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

Layered SVG renderer.

Player và NPC dùng cùng anatomy:
- head;
- neck;
- torso;
- upper/lower arms;
- elbow + hands;
- upper/lower legs;
- knee;
- shoes;
- hair;
- face;
- accessories.

Có props:
- age: child | adult;
- expression;
- uniform;
- decorative / accessible label.

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

## NPC

Work Mode không dùng ảnh customer cứng nữa.

NPC được resolve deterministically từ customer ID:
- cùng customer key → cùng diện mạo;
- queue khác nhau → nhiều preset khác nhau;
- Work Mode React scene và Phaser scene dùng cùng catalog màu / body / hair.

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

- 2D / 2.5D clean illustration.
- Head hơi lớn hơn realistic nhưng cơ thể vẫn có anatomy đọc được.
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
