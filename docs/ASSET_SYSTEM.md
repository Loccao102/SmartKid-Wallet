# Asset System — SmartKid Wallet

## Goal
Giữ visual asset nhất quán, tái sử dụng được và không gắn chặt vào component/game code.

## Art direction
- 2.5D/isometric cartoon;
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
