# SmartKid Wallet — Production v1 Concept Set

Bộ ảnh này là **design reference** để dựng lại UI/UX production. Không dùng trực tiếp làm screenshot/background cố định của sản phẩm.

Các ảnh đã được nén xuống WebP 640×480 để giữ repository nhẹ. Khi cần production art thật, dựng lại thành component/vector/sprite/asset riêng.

## Bộ concept

| File | Màn hình / mục đích |
| --- | --- |
| `01-world-map.webp` | World map: SmartMart mở, các map tương lai locked |
| `02-smartmart-hub.webp` | Hub SmartMart với 5 gian, trạng thái open/locked |
| `03-unlock-math.webp` | Unlock Exercise: Toán là điều kiện bắt buộc để mở gian |
| `04-stall-shopping.webp` | Trải nghiệm trong gian hàng + cart |
| `05-mission-class-party.webp` | Mission Liên hoan lớp, budget/reserve/objective |
| `06-work-checkout.webp` | Employee Mode: cashier/POS/customer |
| `07-work-scenario.webp` | Employee Mode: scenario/decision |
| `08-work-result.webp` | Kết ca: learning/work performance tách simulation metrics |
| `09-profile-leaderboard.webp` | Profile + progression + leaderboard concept |

## Character direction

Nhân vật trong ảnh chỉ là **mood reference**, chưa phải character art cuối.

Production cần làm nhân vật ít “AI generated” hơn:
- silhouette đơn giản, nhận diện nhanh;
- tỷ lệ cơ thể nhất quán giữa mọi màn;
- 2D/2.5D vector hoặc sprite sạch thay vì CGI bóng/glossy;
- shading giới hạn 1–2 cấp;
- mắt/miệng đơn giản, tránh biểu cảm quá cường điệu;
- palette cố định theo character;
- tạo character sheet chuẩn: front / 3-4 / side / expressions;
- tái sử dụng một số archetype NPC thay vì mỗi màn sinh một người mới;
- không dùng chi tiết ngẫu nhiên kiểu AI (tay, tóc, phụ kiện, logo thay đổi).

## UI rule

- Text trong concept chỉ để minh họa. Production phải render text bằng HTML/CSS.
- Không bake nút, số liệu, text vào background image.
- UI icon dùng Lucide/canonical asset, không dùng emoji production.
- Learning Mode sáng, đơn giản, ít metric.
- Employee Mode lấy customer/task/POS làm focal point.
- Không biến student UI thành dashboard SaaS.
- Font/body text phải phù hợp học sinh lớp 4–5.
- Mobile/tablet là first-class.

## Product invariants

1. Mở gian hàng bằng Toán là bắt buộc.
2. Mission thuộc Learning/Application.
3. World state + decision consequence chỉ thuộc Employee/Work Mode.
4. Simulation rating không phải learning score.
