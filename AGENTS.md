# SmartKid Wallet — Agent Contract

Tài liệu này là luật bắt buộc cho mọi coding agent, contributor và AI làm việc trong repository.

## 1. Product invariants
- Đối tượng chính: học sinh lớp 4–5.
- Core: **Toán học là công cụ → ra quyết định là gameplay → hậu quả là phản hồi học tập**.
- Không biến sản phẩm thành quiz được phủ giao diện game.
- MVP chỉ làm sâu **Map Siêu thị** trước.
- Flow bắt buộc của Map Siêu thị: **mở khóa 5 gian hàng → đủ 5 gian → mở Full Shift → 5–6 khách + 1–2 event**.
- Nội dung học tập phải nằm trong data/scenario, không hard-code vào component.
- Học sinh nhìn thấy đánh giá 1–5 sao; dữ liệu nghiên cứu lưu dimension chi tiết bên dưới.
- Phân biệt rõ **đánh giá nhân viên** và **danh tiếng siêu thị**.

## 2. Educational rules
- Mỗi nhiệm vụ phải chỉ rõ: grade, mathSkills, financialSkills, values, difficulty, rubric.
- Không chấm đạo đức bằng nhãn “tốt/xấu”. Phản hồi bằng hậu quả cụ thể.
- Một lựa chọn có thể đồng thời có lợi và bất lợi.
- Random phải có kiểm soát theo slot để các lượt chơi vẫn tương đương về cấu trúc.
- Không dùng leaderboard doanh thu đơn thuần làm thước đo thành công.

## 3. Architecture rules
- React + TypeScript cho UI.
- Phaser cho lớp gameplay 2D/2.5D khi bắt đầu dựng simulation.
- Zustand cho local game state.
- TanStack Query cho server state.
- Zod validate mọi scenario/content đi từ JSON/CMS/backend.
- Supabase cho Auth/Postgres/Storage/Realtime khi backend được nối.
- Không thêm microservice, Redis, queue, Kubernetes hoặc backend riêng nếu chưa có nhu cầu thực.

## 4. Supabase/security rules
- Mọi bảng ở schema exposed phải bật RLS.
- Không bao giờ đưa service role/secret key vào frontend.
- Authorization không dựa vào user-editable metadata.
- RLS phải kiểm tra ownership/relationship, không chỉ `TO authenticated`.
- UPDATE policy phải có cả USING và WITH CHECK.
- Ưu tiên SECURITY INVOKER. SECURITY DEFINER chỉ dùng khi có lý do và phải review.
- Dependency phải pin version; lockfile phải được commit ngay khi môi trường có thể cài package.

## 5. React rules
- Component nhỏ, rõ trách nhiệm.
- Không định nghĩa component bên trong component.
- Không duplicate derived state bằng effect.
- Tránh import barrel gây bundle phình.
- Phaser/game engine phải dynamic-load ở route/game screen để dashboard không phải tải game bundle.
- Accessibility: button thật, keyboard focus, contrast đọc được, target chạm phù hợp tablet.

## 6. Content/data rules
- Scenario ID ổn định, không tái sử dụng ID.
- Rubric và effect phải nằm trong data.
- Event trước có thể ảnh hưởng scenario sau qua store state.
- Mọi random seed quan trọng phải có khả năng lưu/replay phục vụ nghiên cứu.
- Không dùng Math.random() rải rác trong component; random phải đi qua một service/seeded generator.

## 7. Quality gates
Trước khi merge feature:
1. Typecheck/build pass.
2. Test logic scoring/progression.
3. Verify responsive UI trên desktop + tablet + mobile.
4. Không có secret trong git.
5. Docs phải được cập nhật nếu thay đổi game rule/schema.
6. Với thay đổi Supabase: review RLS + verify query.

## 8. Source of truth
- Product: `docs/PRODUCT_SPEC.md`
- Gameplay: `docs/GAME_DESIGN.md`
- Content rules: `docs/CONTENT_RULES.md`
- Scenario/rubric: `docs/SCENARIO_RUBRIC.md`
- Architecture: `docs/ARCHITECTURE.md`
- Roadmap: `docs/ROADMAP.md`
