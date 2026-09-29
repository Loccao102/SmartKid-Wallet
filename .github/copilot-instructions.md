# SmartKid Wallet coding instructions

Đọc và tuân thủ AGENTS.md trước mọi thay đổi.

Các invariant quan trọng:
- MVP hiển thị 4 map nhưng chỉ triển khai sâu SmartMart.
- Ba map locked: Tiny Bank, Happy Restaurant, Weekend Market.
- SmartMart có 5 stall; mỗi stall gắn cố định với nhóm kiến thức Toán lớp 4–5.
- Teacher Assignment không còn là core dependency.
- Unlock Exercise là bài có đáp số; Scenario là bài vận dụng nâng cao.
- Progress mở map/stall là dài hạn theo account, không scope theo assignment.
- Exercise phải sinh qua Exercise Family + seeded generator.
- Không dùng Math.random() rải rác trong component.
- Scenario/rubric/effects phải data-driven.
- Tách employee rating và store reputation.
- Stable asset path đi qua src/assets/registry.ts.
- Supabase exposed tables phải RLS.
- Không đưa secret/service-role vào frontend.
