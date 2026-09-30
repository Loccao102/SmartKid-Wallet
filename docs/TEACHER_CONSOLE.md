# Teacher Console & Classroom Mode

## Mục tiêu

Teacher Console biến SmartKid Wallet từ game cá nhân thành hệ lớp học:

- giáo viên quản lý nhiều lớp;
- tạo tài khoản học sinh theo lớp;
- giao bài hàng tuần;
- bài giáo viên giao dùng **cùng một đề cho cả lớp**;
- xem leaderboard nội bộ;
- xem tiến độ, mastery và telemetry từng học sinh;
- tên thật chỉ xuất hiện trong phạm vi lớp được giáo viên sở hữu.

Teacher Console chạy tại:

`/teacher`

Học sinh vào mục **Lớp học** trong app chính.

## Mô hình dữ liệu

```
Teacher
  └─ Classrooms
       ├─ Student Profiles
       │    └─ Learning Snapshot / Research Events
       └─ Weekly Assignments
            └─ Assignment Attempts
```

Các bảng:

- `teacher_profiles`
- `classrooms`
- `student_profiles`
- `weekly_assignments`
- `assignment_attempts`
- `student_learning_snapshots`

Telemetry Work Mode vẫn nằm ở `research_events`.

## Authentication

### Giáo viên

Giáo viên dùng email + password Supabase Auth.

Teacher profile chỉ được tạo cho:
- authenticated user;
- không phải anonymous user;
- không có `app_role=student`.

MVP hiện hỗ trợ self-service teacher signup. Khi triển khai thật ở trường nên chuyển sang:
- invitation;
- school admin approval; hoặc
- allow-list domain/trường.

### Học sinh

Học sinh **không tự sign up**.

Giáo viên tạo tài khoản qua Edge Function:

`teacher-student-admin`

Function dùng server-side admin API để:
- tạo auth user;
- gắn `app_role=student`;
- gắn classroom id;
- reset password;
- khóa/mở tài khoản.

Service-role key không xuất hiện trong frontend.

Học sinh đăng nhập bằng:

```
Mã lớp + username + mật khẩu
```

Frontend chuyển cặp mã lớp + username thành synthetic email nội bộ.
Synthetic email không dùng làm thông tin liên hệ.

## Row Level Security

Quy tắc chính:

- teacher chỉ xem/chỉnh lớp mình sở hữu;
- teacher chỉ xem student của lớp mình;
- student chỉ xem profile/lớp của chính mình;
- student không đọc được assignment draft;
- teacher xem assignment attempts của lớp mình;
- student chỉ insert attempt của chính mình;
- insert attempt chỉ hợp lệ khi:
  - account active;
  - assignment published;
  - nằm trong thời gian mở;
  - chưa vượt `max_attempts`;
- teacher có thể xem research events và learning snapshot của student thuộc lớp mình.

Các helper authorization nằm ở schema `private`, không đặt trong exposed `public` schema.

## Weekly Assignment

Public Weekly Arena và Teacher Assignment là hai chế độ khác nhau.

### Public Weekly Arena

Có thể dùng player-specific numeric variant để hạn chế truyền đáp án.

### Teacher Assignment

Cả lớp dùng chính xác cùng:

- challenge definition;
- exercise variant key;
- scenario ordering.

Shared variant key:

`class-shared:<assignment_id>`

Do đó leaderboard lớp so sánh trên cùng điều kiện.

## Leaderboard

Teacher Console lấy **best attempt** của mỗi học sinh:

1. điểm cao nhất;
2. nếu bằng điểm: thời gian thấp hơn;
3. pending students nằm cuối.

Public leaderboard vẫn giữ mã ẩn danh.

Class leaderboard được phép hiện tên thật vì nằm sau auth + RLS của giáo viên sở hữu lớp.

## Student Analytics

Teacher Console dùng hai nguồn:

### Assignment Attempts

Dùng cho:
- điểm;
- sao;
- thời gian;
- số lượt;
- leaderboard.

### Learning Snapshot + Research Events

Dùng cho formative analytics:
- level / XP;
- chapter đã hoàn thành;
- mastery theo skill;
- tỉ lệ math attempt;
- first-try correctness;
- scenario choices;
- số Work Shift hoàn thành.

Learning snapshot được đồng bộ nền khi student đăng nhập classroom account.

Không nên biến mastery thành điểm chính thức nếu chưa có thiết kế nghiên cứu/đánh giá được hiệu chuẩn.

## Security note về scoring

Ở MVP hiện tại, app học sinh tính score rồi submit vào `assignment_attempts`, trong khi RLS kiểm soát identity, class, trạng thái bài và giới hạn số lượt.

Điều này phù hợp prototype/lớp thử nghiệm nhưng **không phải anti-cheat server-authoritative**.

Trước khi dùng cho thi thật hoặc xếp hạng có phần thưởng, chuyển submission sang Edge Function/server scorer:
- server reconstruct exact assignment;
- validate raw answers/choices;
- calculate score server-side;
- insert attempt bằng trusted backend.

## Source of truth

Schema migrations:

`supabase/migrations/*teacher_console*.sql`

Admin Edge Function:

`supabase/functions/teacher-student-admin/`

Frontend:

- `src/teacher/TeacherApp.tsx`
- `src/lib/teacherRemote.ts`
- `src/features/classroom/ClassroomScreen.tsx`
- `src/lib/classroomRemote.ts`
- `src/features/classroom/StudentAccountBridge.tsx`

## Nguyên tắc phát triển tiếp

Không đưa real child names vào public leaderboard.

Không expose service-role key.

Không cho client tự đổi role teacher/student.

Không lấy learning snapshot client-sync làm dữ liệu authoritative cho thi/xếp hạng.

Teacher analytics nên ưu tiên:
- xu hướng;
- điểm cần luyện;
- participation;
- first-try accuracy;
thay vì gắn nhãn năng lực tuyệt đối cho trẻ.
