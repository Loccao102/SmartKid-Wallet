# SmartKid Wallet coding instructions

Đọc và tuân thủ `AGENTS.md` trước mọi thay đổi.

Các invariant quan trọng:
- MVP: một map Siêu thị sâu.
- Flow: mở khóa 5 gian hàng trước, sau đó mới Full Shift.
- Nội dung/scenario/rubric phải data-driven.
- Tách employee rating và store reputation.
- Không hard-code câu hỏi trong component.
- Supabase exposed tables phải RLS.
- Không đưa secret/service-role vào frontend.
