# World, Modes & Mission Progression v1

## 1. World progression

Map mở theo **level + prerequisite**, không chỉ level.

### Baseline

| Map | Level | Prerequisite | Gameplay identity |
| --- | ---: | --- | --- |
| SmartMart | 1 | none | mua sắm, giá, ngân sách, phần trăm |
| Tiny Bank | 5 | SmartMart key mission | tiết kiệm, mục tiêu, kế hoạch |
| Happy Restaurant | 8 | bank chapter | hóa đơn, khẩu phần, vận hành |
| Weekend Market | 12 | restaurant chapter | mua bán, margin, tồn kho |

Map chưa có content production vẫn hiện trên world map để tạo long-term motivation, nhưng phải ghi rõ requirement.

## 2. Modes

### Adventure
Core progression:
Toán → mở stall → Mission → chapter progression.

### Practice
- chọn skill/stall đã mở;
- retry miễn phí;
- không farm XP;
- dành cho mastery.

### Work
- roleplay nhân viên;
- scenario/trade-off/world state;
- hidden score;
- consequence.

### Daily Challenge
- fixed daily seed;
- ngắn;
- reward giới hạn 1 lần/ngày;
- leaderboard/research friendly.

## 3. Mission unlock

Mission definition production phải có:
- unlockLevel;
- prerequisites;
- targetTimeSeconds;
- xpReward;
- coinReward optional;
- contentVersion;
- star scoring profile.

## 4. SmartMart mission ladder

Baseline content ladder:
1. Bữa sáng cho nhóm bạn
2. Chuẩn bị liên hoan lớp
3. Picnic cuối tuần
4. Giỏ hàng tiết kiệm
5. Ca làm nhân viên tập sự
6. Quầy đông khách

Shopping Missions dùng chung engine; không copy component riêng cho từng mission.

## 5. Dynamic events

Mission có thể reveal event giữa run:
- yêu cầu mới;
- thay đổi khuyến mãi;
- nhu cầu đặc biệt;
- item quality/availability.

Event phải:
- seeded/replayable;
- có clue;
- không random "gài" người chơi;
- không phá objective không thể cứu.

## 6. Content identity

Mỗi activity:
- stable id;
- version;
- seed nếu generated;
- unlock conditions;
- scoring profile.

Best star lưu theo activity/version.


## 7. Trạng thái implementation hiện tại

Đã chạy trong app:
- Adventure unlock bằng Toán;
- Practice retry miễn phí;
- Work Mode hidden trade-off + deferred consequence;
- Daily Challenge 5 câu seeded theo ngày;
- 4 Shopping Mission definitions mở theo level/prerequisite;
- Mission soft-goal/clue xuất hiện giữa lượt nhưng không hard-fail;
- best stars / best score / replay;
- Teacher 5★ Challenge model và one-time reward;
- future map requirements hiển thị theo level/prerequisite.

Chưa coi là hoàn thành:
- Tiny Bank / Restaurant / Weekend Market gameplay riêng;
- Teacher workspace để phát challenge từ UI;
- cloud persistence cho XP/xu/star/progression.
