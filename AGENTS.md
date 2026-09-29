# SmartKid Wallet — Agent Contract

Tài liệu này là luật bắt buộc cho coding agent/contributor trong repository.

## 1. Product invariants
- Đối tượng chính: học sinh lớp 4–5.
- Core: **Toán là công cụ → quyết định là gameplay → hậu quả là phản hồi học tập**.
- Không biến sản phẩm thành quiz phủ skin game.
- Hiển thị 4 map từ đầu; MVP chỉ mở SmartMart.
- Ba map locked: Tiny Bank, Happy Restaurant, Weekend Market.
- SmartMart có 5 stall, mỗi stall gắn cố định với nhóm kiến thức.
- Teacher Assignment không phải core dependency. Học sinh phải chơi được mà không cần giáo viên tạo bài trước.
- Stall unlock là account progression dài hạn.
- Phân biệt Unlock Exercise (có đáp số) và Scenario (vận dụng nâng cao).
- Sau hành trình người mua, Work Mode/thu ngân mới được mở.
- Phân biệt employee rating và store reputation.

## 2. Stall curriculum
- Produce: measurement, unit price, multiplication/division.
- Food: quantity, portions, division, multi-step.
- Drinks: bill, addition/subtraction, change.
- Supplies: budget, multi-item totals, comparison.
- Promotion: percentage, increase/decrease, voucher.

Không gán skill không liên quan vào stall.

## 3. Exercise rules
- Exercise được sinh từ Exercise Family.
- Family phải có stable ID, skills, parameters, generator, constraint, answer model.
- Random phải deterministic/replayable bằng seed.
- Không dùng Math.random() rải rác trong component.
- Exercise instance đã phát không đổi khi refresh.
- Generator phải được unit test.

## 4. Scenario rules
- Scenario ID/version ổn định.
- Parameters, rubric, effects nằm trong data.
- Feedback mô tả hậu quả, không gắn nhãn đạo đức tốt/xấu.
- Event trước có thể ảnh hưởng scenario sau qua world state.

## 5. Architecture
- React + TypeScript cho app UI.
- Phaser cho gameplay spatial/animation và phải lazy-load.
- Zustand local game state.
- TanStack Query server state.
- Zod validate content từ JSON/CMS/backend.
- Supabase khi backend được nối.
- Không thêm microservice/Redis/K8s nếu chưa có nhu cầu.

## 6. Asset rules
- Stable assets: public/assets.
- UI/system icons mặc định dùng `lucide-react`; import từng icon trực tiếp.
- Không dùng emoji làm UI icon production. Emoji chỉ được dùng tạm trong prototype hoặc nội dung minh họa có chủ đích.
- Component/game code phải resolve qua src/assets/registry.ts khi có asset canonical.
- Không rải hard-coded asset path khắp code.
- Ưu tiên WebP/AVIF cho static art; sprite atlas cho animation Phaser.
- Xem docs/ASSET_SYSTEM.md.

## 7. Security
- RLS cho bảng exposed.
- Không đưa service role/secret vào frontend.
- Teacher chỉ xem lớp thuộc quyền.
- Student chỉ truy cập dữ liệu của mình theo policy.
- UPDATE policy có USING + WITH CHECK.

## 8. Quality gates
1. Typecheck/build pass.
2. Test generator/progression/scoring khi liên quan.
3. Verify responsive desktop/tablet/mobile.
4. Không secret trong git.
5. Cập nhật docs khi đổi game rule/schema.
6. Supabase change phải review RLS.

## 9. Source of truth
- Product: docs/PRODUCT_SPEC.md
- Gameplay: docs/GAME_DESIGN.md
- Content: docs/CONTENT_RULES.md
- Scenario/rubric: docs/SCENARIO_RUBRIC.md
- Architecture: docs/ARCHITECTURE.md
- UI: docs/UI_DESIGN.md
- Assets: docs/ASSET_SYSTEM.md
- Roadmap: docs/ROADMAP.md
