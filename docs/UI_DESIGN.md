# UI Design — SmartKid Wallet

## 1. Visual direction
Phong cách: **modern educational simulation + colorful 2.5D/isometric world**.

Teal/xanh lá làm màu thương hiệu, kem/trắng làm nền, vàng ấm cho reward/action. Map art nhiều màu nhưng không neon; thân thiện lớp 4–5 nhưng không quá babyish.

Ưu tiên tablet, desktop tốt cho demo/NCKH, mobile phải dùng được.

## 2. Student navigation
Các màn chính:
1. Trang chủ
2. Bản đồ
3. Nhiệm vụ
4. Bảng xếp hạng
5. Hồ sơ

Desktop dùng sidebar; mobile dùng bottom nav.

## 3. World Map screen
Hiển thị luôn 4 map.

SmartMart full color, có progress và CTA Tiếp tục/Bắt đầu.

Ba map locked phải desaturated/grayscale, có lock overlay, vẫn hiển thị tên + mô tả ngắn và không giả vờ có gameplay chưa xây.

## 4. SmartMart screen
SmartMart phải giống không gian siêu thị chứ không phải 5 card LMS. Có 5 stall, trạng thái locked/open/completed, Mission HUD, budget/cart và character/route khi gameplay được dựng.

Gian đã mở có thể quay lại tự do.

## 5. Unlock Exercise UI
Panel ngắn gồm stall, skill, câu hỏi, answer input và feedback. Không hiển thị Teacher Assignment trong core flow.

## 6. Profile
Hiển thị avatar, level/XP/streak, SmartMart progress, skill strengths, badges và 4-map journey progress.

## 7. Leaderboard
Không ưu tiên doanh thu. Có thể dùng sao challenge chuẩn hóa, Mission hoàn thành, độ chính xác, streak và progress/improvement.

Nếu so sánh trực tiếp về bài học, cần cùng challenge/seed hoặc metric đã chuẩn hóa.

## 8. Gameplay camera
MVP hướng tới góc nhìn **2.5D/isometric top-down**: nhìn thấy nhiều khu vực siêu thị, nhân vật nhỏ nhưng biểu cảm, stall/sign dễ nhận ra, HUD nằm ngoài game canvas hoặc React overlay.

## 9. Accessibility
Touch target khoảng 44px trở lên, focus-visible, không dùng màu làm tín hiệu duy nhất, contrast đủ và hỗ trợ reduced motion ở phase polish.
