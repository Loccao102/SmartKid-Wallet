# SmartKid Wallet coding instructions

Đọc và tuân thủ `AGENTS.md` trước mọi thay đổi.

Các invariant quan trọng:
- MVP: một map Siêu thị sâu.
- Flow: **giáo viên giao Assignment → học sinh làm Assignment → mở khóa 5 gian → Full Shift**.
- Học sinh không được tự lấy bài từ content bank.
- Progress bắt buộc scope theo `assignmentId`.
- Nội dung/scenario/rubric phải data-driven.
- Tách employee rating và store reputation.
- Không hard-code câu hỏi trong component.
- Supabase exposed tables phải RLS.
- Student chỉ đọc Assignment được giao cho mình/lớp mình.
- Không đưa secret/service-role vào frontend.
