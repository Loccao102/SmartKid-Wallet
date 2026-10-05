# develop.md — SmartKid Wallet: kiểm tra code và kế hoạch phát triển

Kiểm tra ngày 2026-10-05 trên `main` @ `c6fe58a`. Mọi số liệu dưới đây lấy từ lần chạy thật,
không suy từ docs. Phần "Chưa kiểm chứng" ghi rõ những gì tôi không chạy được.

## 1. Hiện trạng đã kiểm chứng

| Hạng mục | Kết quả |
|---|---|
| `tsc --noEmit` | Sạch, 0 lỗi |
| `vitest run` | 30 file / 138 test đạt (13,7s) |
| `vite build` | Đạt |
| Bundle chính `index` | 568 kB (gzip 162 kB) |
| Chunk Phaser (lazy, tên `avatarSvg`) | 1.344 kB (gzip 346 kB), chỉ tải khi vào gameplay |
| CSS gộp một file | 320 kB (gzip 60 kB) |
| Edge Function `teacher-student-admin` | Đã kiểm tra: chặn user ẩn danh, kiểm tra `teacher_profiles`, kiểm tra lớp thuộc đúng giáo viên |

Dòng chảy sản phẩm khớp `AGENTS.md`: Toán mở gian, Mission, rồi Employee Mode. Không tìm thấy
`Math.random()` trong component/domain (chỉ ở `audioEngine.ts` cho nhiễu âm thanh và nhánh dự phòng
của `weeklyVariantKey.ts`). Không có emoji dùng làm icon hệ thống. Chỉ còn ký tự `★` và `✓` dạng chữ.

## 2. Phát hiện, xếp theo mức độ

### Cao

**F1. Tiến trình học chưa có nguồn sự thật phía server.** `AGENTS.md` §8 yêu cầu chuyển
server source-of-truth, nhưng `progression`, `workShift`, `missionCart`, tiến độ gian đều chỉ nằm trong
`localStorage` (Zustand `persist`). Server chỉ nhận một bản tóm tắt qua
`student_learning_snapshots` (level, XP, xu, mastery) từ `classroomRemote.ts`. Không có bảng cho
attempt, exercise instance, Mission hay Work Shift. Hệ quả: xóa dữ liệu trình duyệt hoặc đổi máy là
mất tiến trình; giáo viên chỉ thấy snapshot, không thấy từng lần làm. Đây là P3 trong ROADMAP và là khoảng
trống lớn nhất trước pilot.

**F2. Ba store có persist nhưng không có version/migrate:** `audioSettings.ts`, `learningProfile.ts`,
`researchLog.ts`. `AGENTS.md` §9 cấm đổi schema persistence mà không có kế hoạch migrate. Chưa có
test nào cho migrate của `progression`, `workShift`, `missionCart`, `avatarProfile`
(chỉ `avatarProfile` có test persistence).

**F3. Vùng không có test.** Không có test cho `TeacherApp.tsx` (2.148 dòng), `ParentApp.tsx` (545),
`WorkModeScreen.tsx` (707), `WeeklyChallengeScreen.tsx` (579), `ClassroomScreen.tsx` (637),
`teacherRemote.ts` (523), `classroomRemote.ts`, `parentRemote.ts`. Không có test nào cho RLS của
các bảng teacher/parent/classroom. `supabase-smoke.yml` chỉ kiểm tra auth ẩn danh và RLS của `research_events`,
và chỉ chạy thủ công hoặc khi sửa chính file workflow.

### Trung bình

**F4. CI mỏng.** `ci.yml` chỉ chạy build và test. Không có lint, không chạy `check:ui` /
`check:mobile-fold` / `check:supporting-ui` / `check:work-avatars` (cần Chromium; ROADMAP ghi rõ chưa gắn).
`AGENTS.md` §13 yêu cầu E2E cho flow quan trọng và kiểm tra console. Hiện kiểm tra chỉ chạy cục bộ.

**F5. Docs lệch code.** ROADMAP còn để trống P5 (classes, dashboard giáo viên) và các mục class leaderboard,
nhưng code đã có `TeacherApp`, `ClassroomScreen`, `ParentApp`, 6 migration teacher/parent và 2 Edge
Function. Nhiều ô `[ ]` thực tế đã làm một phần. ROADMAP cũng ghi Restaurant và Weekend Market là
"Deferred", trong khi `App.tsx` đã route tới `HappyRestaurantScreen` và `WeekendMarketScreen`
(349 và 337 dòng) kèm test dữ liệu. `AGENTS.md` §2A cấm gameplay ngoài SmartMart trước depth gate
(ngoại lệ chỉ ghi cho Tiny Bank). Cần quyết định: ghi nhận ngoại lệ hoặc giấu hai map sau cờ.
Ngoài ra `AGENTS.md` nhảy số mục §14 → §18 và có hai mục không đánh số.

**F6. Nợ CSS.** `styles.css` 5.967 dòng, `production-ui.css` 2.923, `teacher-ui.css` 2.094,
`screen-ui.css` 1.522, `work-ui.css` 1.286. `AGENTS.md` §10 quy định token nền tảng chỉ ở
`design-system.css` (827 dòng). Chưa có công cụ kiểm tra màu/radius/shadow rải rác. Toàn bộ CSS vào một
file `index` 320 kB, tải ngay cả khi học sinh không dùng màn teacher/parent.

**F7. Component quá lớn.** `TeacherApp.tsx` 2.148 dòng và `workShift.ts` 1.044 dòng là điểm khó bảo trì và
khó test nhất.

**F8. Chưa có giám sát lỗi và source map production.** Chỉ có `console.error` trong `FeatureErrorBoundary`.
ROADMAP P1 còn mở: source maps, error monitoring, hiển thị phiên bản, checklist rollback.

### Thấp

- `domain/scoring.ts` và `workShiftEngine.ts` gọi `Date.now()` trực tiếp. Chỉ là siêu dữ liệu thời gian, không
  ảnh hưởng seed, nhưng nên nhận clock qua tham số để test ổn định.
- `supabase-smoke.yml` ghi cứng URL và publishable key. Publishable key vốn công khai theo thiết kế, nhưng nên chuyển
  sang `vars`/`secrets` để đổi môi trường không phải sửa workflow.
- Chưa có CAPTCHA/Turnstile cho Anonymous Auth (P6): bất kỳ ai cũng tạo được phiên ẩn danh và ghi vào
  leaderboard tuần.

## 3. Chưa kiểm chứng

- Chưa mở app trong trình duyệt. Chưa kiểm tra giao diện desktop/tablet/mobile.
- Chưa chạy `check:*` (cần Chromium/Edge).
- Chưa đọc từng migration SQL, nên chưa xác nhận RLS của teacher/parent đúng như `TEACHER_CONSOLE.md`.
  Chỉ Edge Function `teacher-student-admin` được đọc.
- Chưa đọc `parent-link` Edge Function, nội dung giáo dục của 20 Exercise Family, hay chất lượng 16 scenario.

## 4. Kế hoạch phát triển

Thứ tự theo `AGENTS.md`: ổn định và dữ liệu trước, chiều sâu SmartMart sau, mở rộng breadth cuối.
Mỗi sprint kết thúc khi build, typecheck và test đạt; thay đổi UI lớn phải có kiểm tra 3 viewport.

### Sprint 0 — Nền tảng an toàn (làm trước mọi thứ)
- [ ] Thêm `version` + `migrate` cho `audioSettings`, `learningProfile`, `researchLog` (F2).
- [ ] Viết test migrate cho `progression`, `workShift`, `missionCart`, world chapter progress: dữ liệu cũ → mới.
- [ ] Thêm ESLint (rule hooks + selector ổn định) vào `ci.yml` (F4).
- [ ] Gắn `check:*` vào CI bằng Playwright + Chromium cài trong job riêng, chỉ chạy trên `main` để không tốn quota.
- [ ] Hiển thị phiên bản build (commit SHA) ở màn Hồ sơ/Phụ huynh; ghi checklist rollback vào `DEPLOYMENT.md`.
- [ ] Đồng bộ ROADMAP và `AGENTS.md` với code (F5): tick đúng các mục đã làm, ghi quyết định về Restaurant/Market.
- **Hoàn thành khi:** CI chạy build, test, lint, E2E; mọi store persist có version và test migrate.

### Sprint 1 — Cloud progression (P3, F1)
- [ ] Migration mới: `student_progress` (tiến độ gian, level, xu, XP), `exercise_attempts`
  (seed, template, version, đáp án, thời gian), `shift_progress`. RLS: học sinh chỉ đọc/ghi dòng của mình.
- [ ] Server là source-of-truth; Zustand chỉ làm cache/offline. Chiến lược merge offline ghi trong
  `ARCHITECTURE.md` trước khi viết code (last-write-wins sai với XP và xu: cần merge theo sự kiện).
- [ ] Nâng cấp tài khoản ẩn danh → tài khoản thường mà không mất tiến trình.
- [ ] Test RLS tự động cho các bảng mới trong `supabase-smoke`, chạy trên mỗi PR chạm `supabase/`.
- **Hoàn thành khi:** đổi thiết bị vẫn tiếp tục đúng bài/ca; xóa localStorage không mất tiến trình; test RLS đạt.

### Sprint 2 — Test và tách nhỏ vùng rủi ro (F3, F7)
- [ ] Test RLS cho bảng teacher/parent/classroom (giáo viên A không đọc được lớp của B; phụ huynh chỉ đọc
  học sinh đã liên kết; mã liên kết dùng một lần và có hạn).
- [ ] Tách `TeacherApp.tsx` theo route/tab; test smoke cho từng tab.
- [ ] Test hành vi cho `WorkModeScreen` và `WeeklyChallengeScreen` (luồng chính, lỗi mạng, retry).
- [ ] Test cho `teacherRemote` / `classroomRemote` / `parentRemote` với client Supabase giả.

### Sprint 3 — Chiều sâu SmartMart (P2.6)
Mục tiêu theo ROADMAP: 30+ scenario đã review, 8+ Shopping Mission, 5+ Work Shift (hiện 16, 4, 3).
- [ ] Mỗi nội dung mới qua Zod, có ID/version ổn định và đủ để replay theo seed.
- [ ] Review giáo dục bởi giáo viên cho 20 Exercise Family hiện có trước khi thêm nội dung mới.
- [ ] Class-scoped leaderboard; xác minh kết quả thử thách ở server (chống gian lận).
- Giữ nguyên các bất biến: không hiện đúng/sai tức thời ở scenario, không mua lợi thế bằng xu, không PII trẻ em.

### Sprint 4 — CSS và hiệu năng (F6)
- [ ] Script kiểm tra màu/radius/shadow nằm ngoài `design-system.css`; dọn `styles.css` dần theo từng màn.
- [ ] Tách CSS theo route (teacher/parent/work) để học sinh không tải CSS không dùng.
- [ ] Đặt ngân sách hiệu năng (ví dụ `index` ≤ 150 kB gzip, kiểm trong CI) và đo trên thiết bị tầm thấp.

### Sprint 5 — Sẵn sàng pilot (P6)
- [ ] Source maps production + error monitoring (F8).
- [ ] Luồng consent/riêng tư, chính sách lưu giữ dữ liệu, CAPTCHA/Turnstile cho Anonymous Auth.
- [ ] Kiểm tra truy cập (a11y), ma trận thiết bị/trình duyệt, thử sao lưu/khôi phục.
- [ ] Đóng băng nội dung và ghim phiên bản cho nghiên cứu; checklist pilot.

## 5. Quyết định cần chủ dự án chốt

1. **Restaurant/Weekend Market:** đang route được trong `App.tsx`. Ghi nhận là ngoại lệ có chủ đích, hay ẩn sau
   feature flag cho đến khi qua SmartMart depth gate?
2. **Thứ tự Sprint 1 và Sprint 3:** cloud progression trước (an toàn dữ liệu) hay nội dung SmartMart trước
   (giá trị nhìn thấy)? Đề xuất cloud trước, vì thêm nội dung lên nền chưa có server source-of-truth
   sẽ phải di trú lại.
3. **Tài khoản thường cho học sinh:** dùng username do giáo viên cấp (đã có) hay thêm đăng nhập qua phụ huynh?
   Ảnh hưởng thiết kế bảng ở Sprint 1.

## 6. Lệnh kiểm tra nhanh

```
npm ci --ignore-scripts
npx tsc --noEmit
npm test
npm run build
npm run check:ui   # cần Vite đang chạy + Chromium/Edge
```
