# Parent Portal & Teacher Reviews

## Vai trò

### Giáo viên

Giáo viên dùng Teacher Console để:

- tạo và quản lý lớp;
- cấp tài khoản học sinh;
- giao bộ nội dung SmartMart đã cấu hình;
- xem assignment score và số lượt thử;
- xem submission chi tiết từ:
  - class assignment;
  - shopping mission;
  - Work Shift;
- xem rubric từng tiêu chí;
- xem giỏ hàng/kết quả nhiệm vụ khi gameplay có dữ liệu đó;
- ghi nhận xét cho học sinh hoặc một submission cụ thể;
- tạo mã liên kết phụ huynh dùng một lần.

### Phụ huynh

Parent Portal chạy tại `/parent`.

Phụ huynh:

- có tài khoản auth riêng;
- liên kết bằng mã do giáo viên tạo;
- mỗi tài khoản parent chỉ liên kết với một học sinh;
- chỉ xem dữ liệu của học sinh đã liên kết;
- xem:
  - assignment results;
  - nhận xét giáo viên;
  - xu hiện có;
  - level / XP;
  - mastery;
  - chapter / mission progress;
  - các submission gần đây;
  - xu hướng điểm theo thời gian.

## Dữ liệu chi tiết

`student_activity_submissions` là nguồn chung cho Teacher và Parent.

Một submission gồm:

- activity kind;
- content id;
- attempt number;
- score;
- stars;
- elapsed time;
- criteria JSON;
- cart JSON;
- result JSON.

Điều này giúp gameplay map mới chỉ cần submit payload phù hợp, không cần tạo schema riêng cho từng map.

## Nhận xét giáo viên

`teacher_reviews` có thể gắn:

- trực tiếp với student;
- hoặc với một submission;
- hoặc với một assignment.

Parent và student chỉ đọc. Teacher sở hữu lớp mới được tạo/sửa/xóa review.

## Liên kết phụ huynh

Teacher tạo `parent_link_codes`:

- random code;
- dùng một lần;
- hết hạn sau 7 ngày.

Parent redeem qua Edge Function `parent-link`.

Edge Function:

- xác thực session;
- từ chối student account;
- kiểm tra code;
- kiểm tra chưa dùng/chưa hết hạn;
- tạo parent profile;
- tạo parent-student link;
- đánh dấu code đã dùng;
- gắn `app_role=parent`.

Service-role key không xuất hiện ở frontend.

## Privacy

- Public leaderboard không chứa tên thật học sinh.
- Parent không được xem danh sách lớp hoặc học sinh khác.
- Teacher chỉ xem student thuộc lớp mình.
- Parent chỉ đọc dữ liệu của student được liên kết.
- Tên thật và review không dùng trong public analytics.
- Không dùng Parent Portal để suy diễn năng lực tuyệt đối; mastery và trend là formative indicators.

## Files

- `src/lib/activityRemote.ts`
- `src/lib/parentRemote.ts`
- `src/parent/ParentApp.tsx`
- `src/parent-ui.css`
- `supabase/functions/parent-link/`
- `supabase/migrations/*parent*.sql`
