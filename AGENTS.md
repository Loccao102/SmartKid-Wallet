# SmartKid Wallet — Agent Contract

Tài liệu này là luật bắt buộc cho coding agent/contributor.

## 1. Canonical product model

SmartKid Wallet có hai pha tách biệt:

### Learning / Customer Mode
- học sinh làm Toán;
- Unlock Exercise là bắt buộc để mở stall;
- Mission là vận dụng kiến thức;
- không có persistent store-world consequence.

### Employee / Work Mode
- mở sau Learning/Mission;
- mô phỏng công việc;
- Toán xuất hiện khi task cần;
- decision/world-state/deferred consequence chỉ thuộc pha này.

**Không được bỏ hoặc làm yếu cơ chế mở gian bằng Toán.**

## 2. Product invariants

- Đối tượng chính: học sinh lớp 4–5.
- SmartMart là production scope hiện tại.
- 5 stall gắn cố định với nhóm Toán.
- Teacher Assignment không phải dependency core.
- Stall unlock là progression dài hạn.
- Unlock Exercise và Scenario là hai hệ thống khác nhau.
- World-changing decision chỉ ở Employee Mode.
- Simulation metrics không phải learning score.
- Research/admin control không xuất hiện trong student UI production.

## 2A. SmartMart scope freeze

- SmartMart là gameplay scope chính.
- Không triển khai gameplay Tiny Bank, Restaurant hoặc Weekend Market trước SmartMart depth gate.
- Future maps có thể hiện ở world map nhưng không được lấy bandwidth khỏi SmartMart.
- Ưu tiên thêm situation/event/mission/work shift/challenge có chiều sâu thay vì thêm map.
- Weekly competitive content phải dùng cùng seed/version cho mọi người trong cùng tuần.
- Competitive mode không được cho phép dùng xu để mua lợi thế.
- Public leaderboard không hiển thị child PII.

Chi tiết: docs/SMARTMART_DEPTH.md

Ngoại lệ theo yêu cầu trực tiếp của chủ dự án ngày 2026-10-03: bắt đầu phát triển
map tiếp theo, Tiny Bank. Phạm vi mở gồm sảnh khám phá, bài Toán và kế hoạch
tiết kiệm; giữ điều kiện Cấp 5 + Liên hoan lớp và toàn bộ domain SmartMart.
Đây không phải xác nhận SmartMart đã đạt depth gate; Restaurant/Market vẫn đóng
băng. Chi tiết và giới hạn kiểm chứng: docs/TINY_BANK.md.

## 3. Stall curriculum

- Produce: measurement, unit price, multiplication/division.
- Food: quantity, portions, division, multi-step.
- Drinks: bill, addition/subtraction, change.
- Supplies: budget, multi-item totals, comparison.
- Promotion: percentage, increase/decrease, voucher.

Không gán skill không liên quan vào stall.

## 4. Exercise rules

- Exercise sinh từ Exercise Family.
- Stable ID/version.
- Deterministic seed.
- Không Math.random() rải trong component.
- Issued instance không đổi khi refresh.
- Generator có unit test.
- Unlock flow vẫn là Toán → hoàn thành → mở stall.

## 5. Mission rules

- Mission là learning/application layer.
- Có shopping/budget/planning.
- Không dùng employee/store world-state.
- Mission completion không tạo consequence chain kiểu Work Mode.

## 6. Work Mode rules

- Scenario ID/version ổn định.
- Work Shift deterministic từ studentKey + templateId + templateVersion + variantIndex.
- Không bắt buộc mọi customer có cùng total → scenario → change flow trong production.
- Decision/world effect nằm trong data/domain, không hard-code React/Phaser.
- Employee/store/customer metrics tách biệt.
- World flag không phải score.
- Deferred consequence deterministic.
- Resolved consequence lưu trong shift progress + research log.
- Scenario/customer context phải tương thích.

## 6A. Mastery/economy rules

- XP không bị trừ.
- Level-up thưởng 100 xu theo domain rule.
- Adventure Math retry dùng escalating fee 5 → 30; Practice retry miễn phí.
- Không được khóa việc học chỉ vì hết xu; luôn có free recovery path.
- Stars chỉ reveal sau run; 5★ là mastery, không đồng nghĩa completion.
- Scenario decision không được hiện đúng/sai hoặc score tức thời.
- World consequence phải khớp semantic của choice/version.
- Replay giữ best score/stars và không farm first-completion reward.
- Map/Mission unlock dùng level + prerequisite.
- Audio phải có master/music/ambient/SFX controls và không autoplay trước user gesture.

## 7. Research logging rules

- append-only;
- schema-versioned;
- pseudonymous;
- mọi math attempt được log;
- scenario choice log version/choice/time/before-after;
- consequence resolve là event riêng;
- seed/template/version đủ replay;
- Supabase research_events là live sink;
- student production UI không hiển thị raw session/schema/export controls.

## 8. Architecture

- React + TypeScript cho app UI.
- Phaser cho spatial/animation, lazy-loaded.
- Domain rule không nằm trong Phaser.
- Zustand là UI/cache/offline state; production learning progress phải chuyển server source-of-truth.
- TanStack Query cho server state.
- Zod validate content.
- Supabase cho Auth/Postgres/Storage.
- Không thêm microservice/Redis/K8s khi chưa có nhu cầu.

## 9. Production reliability rules

- Canonical repo: `Loccao102/SmartKid-Wallet`.
- Production deployment phải theo canonical repo.
- Không chấp nhận white-screen crash: gameplay boundary cần Error Boundary/fallback.
- Zustand selector không được tạo object/array fallback mới mỗi snapshot; dùng stable reference/select primitive.
- Thay schema/store persistence phải có migration/version plan.
- Critical flow cần integration/E2E trước pilot.

## 10. UI rules

- Student UI không mang cảm giác dashboard SaaS.
- Learning và Employee có visual language khác nhau.
- Body text production cho trẻ không dùng dày đặc .5rem/.6rem.
- Touch target ≥44px; input/action gameplay ưu tiên 52–64px khi phù hợp.
- Mobile là first-class; không chỉ co desktop xuống một cột.
- Mỗi màn chỉ có một hierarchy chính: context → task → primary action → supporting state.
- Không dùng raw-looking form/table/card; mọi surface phải đi qua visual system chung.
- Không lồng card quá hai tầng.
- Dùng Lucide nhất quán; icon hệ thống production không dùng emoji.
- Foundation token nằm tại `src/design-system.css`; không tự thêm màu/radius/shadow nền tảng rải rác.
- Work Mode visual layer nằm tại `src/work-ui.css`; screen composition nằm tại `src/screen-ui.css`.
- Simulation metric và learning performance phải trình bày tách biệt.
- Research technical UI chuyển sang Researcher/Admin.
- Giữ visible focus, keyboard navigation, contrast và prefers-reduced-motion.
- Sau thay đổi UI lớn phải kiểm tra desktop + tablet + mobile và browser console.

## 11. Asset rules

- Stable assets: public/assets.
- UI icon: lucide-react.
- Không dùng emoji như production system icon.
- Canonical asset path qua registry khi có.
- Ưu tiên WebP/AVIF + sprite atlas.

## 12. Security

- RLS cho mọi bảng exposed.
- Không service-role/secret trong frontend.
- Teacher chỉ xem lớp thuộc quyền.
- Student chỉ truy cập dữ liệu của mình.
- UPDATE policy dùng USING + WITH CHECK.
- Research event append-only.

## 13. Quality gates

1. Build/typecheck pass.
2. Relevant unit tests pass.
3. Critical flow smoke/E2E khi liên quan.
4. UI lớn: visual verification ở desktop/tablet/mobile, không chỉ dựa vào typecheck.
5. Browser console không có runtime error mới.
6. Responsive desktop/tablet/mobile.
7. React: tránh unstable Zustand selector/fallback object-array mới mỗi snapshot; giữ heavy gameplay lazy-loaded.
8. Không secret trong git.
9. Docs update khi đổi rule/schema.
10. Supabase change review RLS + generated types.
11. Không merge partial UI iteration vào `main`; gom coherent pass trên feature branch.
12. Production deploy source phải là canonical repo; Vercel giữ main-only để tránh quota preview.

## 14. Source of truth

- Production direction: docs/PRODUCTION_PLAN.md
- Deployment: docs/DEPLOYMENT.md
- Product: docs/PRODUCT_SPEC.md
- Gameplay: docs/GAME_DESIGN.md
- UI/UX: docs/UI_DESIGN.md
- Work Mode: docs/WORK_MODE.md
- Architecture: docs/ARCHITECTURE.md
- Roadmap: docs/ROADMAP.md
- Research logging: docs/RESEARCH_LOGGING.md
- Supabase: docs/SUPABASE_SETUP.md
- Content: docs/CONTENT_RULES.md
- Exercise catalog: docs/EXERCISE_CATALOG.md
- Scenario/rubric: docs/SCENARIO_RUBRIC.md
- Assets: docs/ASSET_SYSTEM.md
- Scoring/progression/economy: docs/SCORING_PROGRESSION.md
- World/modes/missions: docs/WORLD_MODES_MISSIONS.md
- Audio: docs/AUDIO_SYSTEM.md
- SmartMart depth: docs/SMARTMART_DEPTH.md
- Character/avatar system: docs/CHARACTER_SYSTEM.md
- World/map extension architecture: docs/WORLD_CHAPTER_CORE.md
- Teacher/classroom architecture: docs/TEACHER_CONSOLE.md
- Parent/review architecture: docs/PARENT_PORTAL.md
- Astra UI implementation brief: docs/ASTRA_UI_BRIEF.md


## 18. World Chapter Core

- Map mới không được tự tạo lại progress store, RNG, quiz runner, reward flow hoặc unlock resolver.
- Dùng `src/core/worldChapter/*` và `useWorldChapterController`.
- Procedural math dùng `WorldChapterQuiz`.
- Mission/simulation đặc thù là extension point của từng map và được phép khác hoàn toàn.
- Xem `docs/WORLD_CHAPTER_CORE.md` trước khi thêm world/map mới.


## Teacher / Classroom

- Không hiển thị tên thật học sinh trên public leaderboard.
- Không dùng service-role key trong frontend; tạo/reset/khóa tài khoản học sinh phải qua server/Edge Function.
- Mọi bảng classroom phải có RLS theo teacher ownership / student identity.
- Teacher Assignment dùng cùng một đề/variant cho cả lớp; Public Weekly Arena có thể dùng variant riêng.
- Learning snapshot là formative analytics, không coi là dữ liệu chấm thi authoritative.
- Xem `docs/TEACHER_CONSOLE.md` trước khi sửa auth, lớp, assignment hoặc teacher analytics.


## Parent / Teacher Review Privacy

- Parent chỉ được đọc dữ liệu của student đã liên kết qua `parent_student_links`.
- Mã liên kết phụ huynh phải dùng một lần và có hạn; redeem qua server/Edge Function.
- Không expose tên thật, review hoặc parent link ra public leaderboard.
- Gameplay mới nên submit kết quả chi tiết qua `student_activity_submissions` thay vì tạo bảng kết quả riêng nếu không cần thiết.
- Teacher review là dữ liệu riêng của lớp, không dùng làm public score.
- Xem `docs/PARENT_PORTAL.md` trước khi sửa parent auth, review hoặc detailed submissions.
