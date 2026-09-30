# Audio System v1

## Mục tiêu

Âm thanh làm SmartKid Wallet giống một game nhẹ nhàng hơn, không gây quá tải khi học.

## Mix

Ba bus:

1. Music
2. Ambient
3. SFX

Master volume áp dụng lên cả ba.

Default:
- Master: 70%
- Music: 40%
- Ambient: 30%
- SFX: 75%

## Music direction

- chill / lo-fi educational;
- không lời;
- tempo chậm;
- loop dài;
- không âm thanh sắc hoặc bass mạnh.

Bản code foundation có procedural Web Audio ambience để không phụ thuộc asset ngoài.

Production art/audio sau này có thể thay bằng track licensed/original mà không đổi settings API.

## SFX

Tối thiểu:
- UI click;
- correct;
- retry;
- coins;
- XP;
- unlock;
- level up;
- mission complete;
- POS scan;
- work consequence.

## Settings

Student có thể:
- mute toàn bộ;
- bật/tắt Music;
- bật/tắt Ambient;
- bật/tắt SFX;
- chỉnh Master/Music/Ambient/SFX volume.

Setting persist local và sau này sync account.

## Browser policy

Audio chỉ start sau user gesture.

Không autoplay có âm thanh trước interaction đầu tiên.

## Accessibility

- reduced motion không đồng nghĩa mute;
- mọi thông tin audio quan trọng phải có visual equivalent;
- không dùng âm thanh để truyền duy nhất trạng thái đúng/sai.
