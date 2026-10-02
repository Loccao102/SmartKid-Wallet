# Asset System — SmartKid Wallet

## Goal
Giữ visual asset nhất quán, tái sử dụng được và không gắn chặt vào component/game code.

## Art direction
- world/map mới dùng minh họa 2D storybook; vector stall/props hiện có giữ tương thích với scene;
- màu sáng, mềm, thân thiện học sinh lớp 4–5;
- hình khối rõ, ít chi tiết nhiễu;
- cùng hệ tỷ lệ/perspective giữa map, stall, character và props.

## UI icon system
- Dùng `lucide-react` làm icon library mặc định cho navigation, trạng thái, action, badge/system icon.
- Import trực tiếp từng icon để giữ tree-shaking; không import toàn bộ icon registry.
- Không dùng emoji làm icon UI chính thức.
- Product, character, stall booth, map art và scenario prop vẫn là game asset riêng, không thay bằng Lucide nếu cần hình minh họa 2.5D.

## Runtime groups
public/assets/
- brand/
- ui/
- maps/
- stalls/
- products/
- characters/
- missions/
- scenarios/
- achievements/

Git không lưu empty folder; chỉ tạo folder khi có asset runtime đầu tiên.

## Registry
Canonical path nằm trong src/assets/registry.ts. Không viết trực tiếp path asset rải rác trong component.

## 4 map
MVP cần:
- SmartMart: thumbnail + background/full gameplay art.
- Tiny Bank: thumbnail locked.
- Happy Restaurant: thumbnail locked.
- Weekend Market: thumbnail locked.

Ba map locked chưa cần full environment asset.

## SmartMart asset checklist
### Brand/UI
Logo, mascot/star guide, badge frame và feedback effect. Nav/system icon dùng Lucide; chỉ tạo asset riêng khi cần illustration hoặc branded icon.

### Map/environment
SmartMart exterior thumbnail, interior/background, floor/path, entrance, checkout, plants/signs/carts/baskets và decorations.

### Stalls
Mỗi stall có icon, booth/sign, locked/open/completed visual nếu cần và category decorations.

### Products
MVP khoảng 30–40 SKU. Product có thể có thumbnail, in-game, cart, damaged và expiring variants.

### Characters
Khoảng 10–15 base characters. Animation nên dùng sprite atlas: idle, walk directions, talk, happy, thinking/confused, celebrate.

### Scenario props
Damaged item, expiry tag, sale sign, voucher, receipt, cash/card/QR, complaint indicator và stock box.

### Rewards
Badges, medals, trophy, unlock effect, confetti và XP/coin burst.

## File formats
- WebP/AVIF cho static art.
- PNG khi cần alpha và pipeline không hỗ trợ WebP.
- Sprite atlas + JSON cho Phaser animation.
- SVG cho icon/UI đơn giản được kiểm soát.

## Naming
Dùng kebab-case, ví dụ:
- apple-fuji-game.webp
- student-boy-01-idle.webp
- smartmart-thumbnail.webp

## Storage strategy
Stable game assets version cùng code trong repo/CDN.

Supabase Storage chỉ dùng sau này cho seasonal banner, mission media, admin-uploaded content hoặc user-generated media.

DB chỉ lưu asset key/path, không lưu binary image.

## Performance
- không load full gameplay asset ở dashboard;
- preload theo map/scene;
- Phaser atlas thay nhiều request nhỏ;
- lazy-load SmartMart bundle;
- có thumbnail riêng, không dùng background lớn làm thumbnail.

## Map packs — adventure edition

`src/assets/mapPacks.ts` là registry typed theo MapId, có version, theme, scene, thumbnail và landmark riêng cho từng map. Assets thực nằm tại `public/assets/maps/<map-id>/`. SmartMart sở hữu thêm products/stalls/environment; avatar và Lucide vẫn dùng chung. Các key maps/stalls cũ trong gameAssets đã được trỏ về file thật thay cho đường dẫn placeholder. Ảnh map mới dùng WebP, thumbnails dưới 120 KB, scene lớn chỉ tải khi cần. Test mapPacks xác minh mỗi map có file riêng trong đúng namespace.

Ba map kế tiếp chỉ nhận bộ hình ảnh riêng trong pass này; không thêm gameplay. Quy trình tạo ảnh và prompt xem [UI_REDESIGN.md](UI_REDESIGN.md) và [adventure-art-prompts.md](assets/adventure-art-prompts.md).

## Character kit

Character baseline chibi RPG v1 được lưu trong
[docs/kits/chibi-rpg-v1/README.md](kits/chibi-rpg-v1/README.md), gồm manifest,
reference sheet, SVG full body, portrait crop và snapshot source. Đây là kit
nhân vật dùng chung; asset map, stall, product và scenario prop vẫn phải nằm
trong namespace của map tương ứng. Giữ nguyên kit v1 làm mốc đối chiếu, xuất version
mới khi chốt một lần mở rộng. `gameAssets.characterKits.chibiRpgV1` cung cấp đường
dẫn manifest và bảng mẫu chuẩn.
