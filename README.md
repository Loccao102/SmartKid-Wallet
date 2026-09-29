# SmartKid Wallet

Web nhập vai tài chính cho học sinh lớp 4–5, tích hợp **Toán học + giáo dục tài chính + ra quyết định + trách nhiệm**.

## Concept hiện tại
Hệ thống có 4 bản đồ hiển thị từ đầu:
- 🛒 **SmartMart – Siêu thị** — mở trong MVP.
- 🏦 Ngân hàng tí hon — khóa.
- 🍽️ Nhà hàng vui vẻ — khóa.
- ⛺ Chợ cuối tuần — khóa.

SmartMart có 5 gian. Mỗi gian gắn cố định với một nhóm kiến thức Toán lớp 4–5.

Core loop:
**Unlock Exercise → mở gian → Mission vận dụng → Work Mode/thu ngân → hậu quả & tiến bộ**

Unlock Exercise là bài có đáp số được sinh từ parameterized Exercise Family. Scenario là bài vận dụng nâng cao có lựa chọn và hậu quả; hai hệ thống tách nhau.

Giáo viên không còn là dependency bắt buộc để học sinh có nội dung chơi. Role giáo viên trong MVP thiên về theo dõi tiến bộ lớp.

## Stack
React 19 + TypeScript + Vite, Phaser 4 cho gameplay, Zustand, TanStack Query, Zod; Supabase sẽ nối ở phase backend.

Tài liệu nguồn chuẩn nằm trong docs/. Coding agent phải tuân theo AGENTS.md.

> Trạng thái: đang phát triển MVP SmartMart.


## Deploy production

Frontend is Vercel-ready through `vercel.json`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLoccao102%2FSmartKid-Wallet&project-name=smartkid-wallet&repository-name=SmartKid-Wallet)

The production Supabase URL and publishable key are safe public client defaults in `src/lib/supabase.ts`, so Vercel import does not require secret environment variables.

Before cloud research sync can work, enable **Anonymous Sign-Ins** in the dedicated SmartKid Supabase project. The repository includes a manual `Supabase Smoke` GitHub Action to verify anonymous auth + INSERT/SELECT RLS + blocked UPDATE/DELETE.
