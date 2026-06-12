# Implementation Plan: SimpleShop — Web bán hàng demo phục vụ học automation testing

**Branch**: `001-simpleshop-demo` | **Date**: 2026-06-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-simpleshop-demo/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

SimpleShop là SPA bán hàng demo (đăng nhập 1 chạm với 3 user định sẵn → lưới
6 sản phẩm → giỏ hàng với số lượng 1–5 → checkout giả lập → trang xác nhận),
phục vụ học automation testing. Stack: **Vite + React 19 + TypeScript**, không
backend/database — fixture tĩnh + localStorage; mọi phần tử tương tác có
`data-testid` theo hợp đồng [contracts/ui-contract.md](contracts/ui-contract.md);
app không kèm bộ test — viết test E2E là bài tập của người học (khuyến nghị
Playwright, xem research.md R7). Lý do chọn React thay
vanilla TS: xem [research.md](research.md) R1 — app nhiều state phản ứng
(badge, tổng tiền, nút vô hiệu theo ngưỡng), React loại bỏ toàn bộ tầng đồng
bộ DOM thủ công vốn là phần code dài và khó đọc nhất nếu viết vanilla.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: React 19, react-router-dom (runtime — chỉ 3 gói);
Vite (template `react-ts`), ESLint + Prettier (dev)

**Storage**: Không database. Fixture tĩnh `src/data/*.ts` (6 sản phẩm, 3 user);
localStorage 2 khóa `simpleshop.session`, `simpleshop.cart` (xem
[data-model.md](data-model.md))

**Testing**: Không kèm bộ test trong repo (R7) — khả năng test bảo đảm bằng
hợp đồng data-testid (contracts/ui-contract.md); người học tự viết E2E bằng
Playwright như bài tập, selector chỉ qua `getByTestId` + accessible role

**Target Platform**: Trình duyệt hiện đại (Chromium/Firefox/WebKit), chạy local
qua `npm run dev` (Vite dev server, cổng 5173)

**Project Type**: Web frontend SPA thuần client (single project)

**Performance Goals**: Mọi thao tác phản hồi tức thì (SC-003, cảm nhận < 1s) —
mặc nhiên đạt vì không có network call

**Constraints**: Offline 100% sau khi cài (SC-005) — không CDN, không URL ảnh
ngoài (ảnh SVG cục bộ trong `public/images/`); chạy bằng một lệnh; không biến
môi trường bí mật

**Scale/Scope**: 5 route, 6 sản phẩm, 3 user, ~10 component — cố định, không
phân trang/tìm kiếm (ngoài phạm vi theo spec)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Đánh giá | Kết quả |
|------------|----------|---------|
| I. Code Sạch & Dễ Đọc | ESLint + Prettier trong template, mỗi component một file ngắn, reducer thuần chứa quy tắc nghiệp vụ; TS strict | ✅ PASS |
| II. Đơn Giản Hơn Đầy Đủ | Chỉ 3 dependency runtime, mỗi cái có lý do ghi ở research.md (R1–R3); không state library, không UI kit, không kèm bộ test/toolchain test trong repo (R7, R9) | ✅ PASS |
| III. UI Test Tự Động Được | Toàn bộ testid là hợp đồng công khai trong contracts/ui-contract.md, quy ước kebab-case + container-động/con-tĩnh (R8); người học viết test chỉ dùng getByTestId/role | ✅ PASS |
| IV. Không Backend & DB Thật | Fixture TS tĩnh + localStorage; `npm run dev` một lệnh; offline 100% (R4, R5) | ✅ PASS |
| V. UX Nhất Quán | Design tokens trong `src/styles/tokens.css`; `formatPrice()` duy nhất cho mọi giá (R6); UI tiếng Việt thống nhất (FR-014) | ✅ PASS |

**Re-check sau Phase 1**: Không phát sinh vi phạm — data-model và ui-contract
không thêm dependency hay tầng trừu tượng mới. ✅ PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-simpleshop-demo/
├── plan.md              # File này (/speckit-plan)
├── research.md          # Phase 0 — 9 quyết định kỹ thuật (R1–R9)
├── data-model.md        # Phase 1 — entities, fixture, localStorage, vòng đời
├── quickstart.md        # Phase 1 — chạy app + kịch bản kiểm chứng US1–US4
├── contracts/
│   └── ui-contract.md   # Phase 1 — routes + danh mục data-testid (hợp đồng test)
└── tasks.md             # Phase 2 (/speckit-tasks — chưa tạo)
```

### Source Code (repository root)

```text
src/
├── main.tsx                 # entry, mount React + Router
├── App.tsx                  # khai báo routes + RequireAuth guard
├── pages/                   # mỗi route một page component
│   ├── LoginPage.tsx
│   ├── ProductsPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   └── ConfirmationPage.tsx
├── components/               # UI dùng chung
│   ├── Header.tsx            # tên user, nút đăng xuất, badge giỏ (FR-003, FR-006)
│   └── ProductCard.tsx
├── context/                  # state toàn cục (R3)
│   ├── AuthContext.tsx       # user hiện tại + login/logout, sync localStorage
│   └── CartContext.tsx       # reducer giỏ hàng (trần 5/sàn 1), sync localStorage
├── data/                     # ── PHẦN DỮ LIỆU, tách khỏi UI ──
│   ├── products.ts           # fixture 6 sản phẩm + export type Product
│   └── users.ts              # fixture 3 user + export type User
├── lib/
│   ├── format.ts             # formatPrice() — nguồn duy nhất định dạng VND (R6)
│   └── storage.ts            # đọc/ghi localStorage an toàn (parse hỏng → rỗng)
└── styles/
    ├── tokens.css            # design tokens (Nguyên tắc V)
    └── global.css

public/
└── images/                   # 6 ảnh SVG cục bộ, đặt tên theo product id (R5)
```

> Không có thư mục `tests/` trong repo — viết test E2E là bài tập của người
> học (R7), dựa trên kịch bản ở quickstart.md và selector ở ui-contract.md.

**Structure Decision**: Single project (SPA thuần client, không backend nên
không tách frontend/backend). Ranh giới UI ↔ dữ liệu theo yêu cầu người dùng:
`src/data/` chứa toàn bộ fixture (chỉ export hằng số typed, không import gì từ
UI); `src/pages/` + `src/components/` chỉ đọc dữ liệu qua context/import, không
hard-code sản phẩm/user trong JSX. `src/lib/` là tiện ích thuần không phụ thuộc
React để dễ đọc và tái dùng trong test.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Story hoàn thành không kèm test tự động trong repo (lệch dòng "acceptance scenario PHẢI có test tự động đi kèm" ở mục Quy Trình của constitution) | SimpleShop tồn tại ĐỂ người học tự viết test; kèm lời giải sẽ triệt tiêu bài tập (research.md R7). Nghĩa vụ test chuyển cho người học theo từng user story; app chỉ bảo đảm điều kiện test được qua ui-contract.md | Kèm bộ test đầy đủ: làm hộ bài tập + thêm dependency @playwright/test. Kèm 1 test mẫu: vẫn kéo toolchain vào repo trong khi ví dụ selector đã đủ trong ui-contract.md |
