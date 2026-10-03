# World Chapter Core

Mục tiêu của kiến trúc này là để map mới **chỉ mở rộng gameplay/content**, không copy lại plumbing.

## 1. Ranh giới kiến trúc

### Core dùng chung

Nằm tại:

- `src/core/worldChapter/types.ts`
- `src/core/worldChapter/random.ts`
- `src/core/worldChapter/runtime.ts`
- `src/core/worldChapter/progressStore.ts`
- `src/core/worldChapter/unlock.ts`
- `src/features/world/WorldChapterQuiz.tsx`
- `src/features/world/useWorldChapterController.ts`
- `src/world-chapter-ui.css`

Core chịu trách nhiệm:

- deterministic replay seed;
- seeded RNG helpers;
- progress từng lesson;
- best stars;
- số lần replay;
- sequential lesson unlock;
- final mission star gate;
- XP / coin reward keys;
- chapter completion;
- world-map unlock resolver;
- procedural quiz flow;
- retry + hint;
- common quiz star curve.

### Map module

Map chỉ nên sở hữu:

- lesson content;
- question generator;
- mission/simulation gameplay riêng;
- mission scoring riêng;
- hero/copy/art/theme;
- map-specific animation/NPC/story.

Ví dụ:

`src/data/happyRestaurant.ts`
- định nghĩa lesson;
- sinh bài toán;
- định nghĩa Dinner Rush;
- chấm Dinner Rush.

`src/features/restaurant/HappyRestaurantScreen.tsx`
- hero nhà hàng;
- room presentation;
- Dinner Rush UI riêng;
- gọi core cho quiz/progress/reward.

## 2. Chapter definition

Mỗi chapter có một config:

```ts
const chapter: WorldChapterDefinition<LessonId> = {
  mapId: '...',
  version: 1,
  lessonOrder: [...],
  finalLessonId: '...',
  finalMinStars: 3,
  seedBase: 20260000,
  chapterXpReward: 100,
  chapterCoinReward: 100,
}
```

Không hard-code lại seed/reward/final gate trong screen.

## 3. Progress store

Không tạo Zustand store bằng tay cho map mới.

Dùng:

```ts
createWorldChapterProgressStore<LessonId>(
  'smartkid-wallet-<map>-v1',
)
```

Storage key là contract ổn định. Không đổi key nếu chưa có migration.

### Lượt chơi đang làm (schema 2)

Factory giữ thêm `savedRunsByLessonId`: mỗi lesson có seed đã cấp và checkpoint
do runner sở hữu. Migration từ schema 1 giữ completed IDs, best stars và run count,
khởi tạo danh sách lượt đang làm rỗng; không đổi storage key.

`useWorldChapterController({ resumeRuns: true })` dùng lại seed/checkpoint khi
vào lại lesson, chỉ tăng replay count khi tạo lượt mới. Hoàn tất lượt sẽ xóa
checkpoint. Tiny Bank bật tùy chọn này; Restaurant/Market giữ mặc định cũ.
Quiz lưu câu hiện tại, câu trả lời đang nhập, số lần sai và feedback; mission
Tiny Bank lưu ID lựa chọn từng tuần rồi tính lại số dư bằng dữ liệu cùng seed.
Checkpoint là local/offline state, chưa phải cloud progress hay score authoritative.

Quiz dùng nút Câu tiếp theo sau khi kiểm tra đúng để học sinh đọc feedback;
không dùng timer tự nhảy câu (tránh gửi lặp làm bỏ qua câu hỏi).

## 4. Procedural quiz

Map cung cấp:

```ts
WorldChapterQuestion[] = [{
  id,
  prompt,
  answer,
  unit,
  hint,
}]
```

UI dùng `WorldChapterQuiz`.

Không viết lại:

- answer state;
- mistakes state;
- retry;
- Enter handling;
- hint;
- star curve;
- result screen.

## 5. Mission gameplay

Mission/simulation cuối chapter **không ép vào một generic engine duy nhất**.

Lý do:
- Bank cần savings/reserve/balance.
- Restaurant cần revenue/satisfaction/waste/time.
- Market cần cash/trust/stock/waste.
- map tương lai có thể có gameplay khác hoàn toàn.

Core chỉ quy định:
- mission là final lesson;
- minimum star gate;
- result được record;
- pass mới complete chapter/reward.

Phần metric/state/choice/consequence là extension point của map.

## 6. Unlock world

Không viết lại điều kiện mở map trong UI.

`resolveWorldUnlockState()` xử lý:

- level;
- prerequisite mission;
- prerequisite chapter;
- map available/locked.

Entry mới chỉ khai báo trong `src/data/worldMaps.ts`.

## 7. Thêm map mới

Checklist tối thiểu:

1. Thêm `MapId`.
2. Thêm definition trong `worldMaps.ts`.
3. Tạo lesson IDs + chapter config.
4. Tạo question generators bằng RNG core.
5. Tạo progress store bằng factory core.
6. Tạo map screen.
7. Dùng `useWorldChapterController`.
8. Dùng `WorldChapterQuiz` cho bài procedural.
9. Chỉ viết gameplay riêng cho mission/simulation.
10. Thêm route + artwork/theme.
11. Thêm generator/scoring tests.

Nếu bước 3–8 bị copy từ map cũ, kiến trúc đang bị phá.

## 8. Core hiện tại và SmartMart

SmartMart có hệ gameplay sâu hơn được phát triển trước World Chapter Core:
- stalls;
- shopping missions;
- Work Mode;
- mastery;
- weekly arena.

Không ép SmartMart vào chapter abstraction chỉ để đồng nhất hình thức.

Các map mới có thể:
- dùng World Chapter Core cho progression;
- sau đó cắm gameplay module sâu tương tự SmartMart khi cần.

Mục tiêu dài hạn là **shared platform + gameplay plugins**, không phải mọi map giống nhau.
