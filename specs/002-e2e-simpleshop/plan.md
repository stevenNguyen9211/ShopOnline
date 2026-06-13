# Implementation Plan: Bộ kiểm thử tự động E2E cho SimpleShop

**Branch**: `002-e2e-simpleshop` | **Date**: 2026-06-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-e2e-simpleshop/spec.md`

## Summary

Bộ kiểm thử tự động E2E cho SimpleShop sử dụng Playwright Test + TypeScript theo
mô hình Page Object Model. 5 Page Object classes (LoginPage, ProductsPage,
CartPage, CheckoutPage, ConfirmationPage) chứa locators từ ui-contract.md và
actions cấp thấp; 5 test files tổ chức theo user story (US1–US5); 1 custom
fixture `loggedIn` thiết lập trạng thái xác thực qua UI. ~27 test cases chạy
song song trên Chromium; HTML report đầu ra.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, target ES2020)

**Primary Dependencies**: @playwright/test ^1.45 — test runner, assertions tích
hợp (`expect`), fixtures, HTML reporter, browser management. **1 dependency
duy nhất** (theo Constitution II — YAGNI).

**Storage**: Không có storage riêng cho test suite; app dùng localStorage
(Playwright tự cô lập theo browser context — mỗi test nhận context sạch mới).

**Testing**: Playwright Test là framework; test suite này chính là deliverable.
Không có unit test cho test suite.

**Target Platform**: Chrome/Chromium (mặc định, theo spec clarification Q1).
Firefox + WebKit cấu hình sẵn nhưng disabled (xem Complexity Tracking).

**Project Type**: E2E test suite

**Performance Goals**: Toàn bộ suite < 3 phút (SC-003); `fullyParallel: true`
để tối đa song song theo file.

**Constraints**:
- Mọi precondition (login, add-to-cart) phải qua UI (spec Q2; FR-004)
- Locator chỉ dùng `data-testid` hoặc accessible role/label (Constitution III)
- 0 truy cập trực tiếp localStorage trong test code
- App phải chạy ở localhost:5173 trước khi test (webServer config tự xử lý)

**Scale/Scope**: ~27 test cases, 5 Page Objects, 5 test files, 1 fixture file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Đánh giá | Ghi chú |
|------------|----------|---------|
| I. Code Sạch & Dễ Đọc | ✅ PASS | POM tách locator khỏi test logic; method names mô tả đúng hành vi; TypeScript strict đảm bảo kiểu; async/await thống nhất |
| II. Đơn Giản Hơn Đầy Đủ | ✅ PASS | 1 dependency duy nhất; không BasePage class (YAGNI); không helper thừa |
| III. UI Phải Test Tự Động Được | ✅ PASS | Suite này là hiện thân của Nguyên tắc III; mọi locator lấy từ ui-contract.md |
| IV. Không Backend & Database Thật | ✅ PASS | `webServer` khởi Vite dev server local; app client-only, không API ngoài |
| V. Trải Nghiệm Người Dùng Nhất Quán | ✅ PASS | HTML report nhất quán; quy ước đặt tên test theo US- prefix thống nhất |
| VI. Kiểm Thử Tự Động Có Kỷ Luật | ✅ PASS | POM ✓; test độc lập + parallel ✓; data-testid ✓; FR mapping ✓; happy+error paths ✓ |

**Constitution Check: 6/6 PASS**

## Project Structure

### Documentation (this feature)

```text
specs/002-e2e-simpleshop/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── page-objects.md  # Page Object API contract
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
/ (repo root — cùng cấp với src/ và public/ của app 001)
├── playwright.config.ts       # Playwright: baseURL, webServer, projects, reporter
├── tsconfig.e2e.json          # TypeScript config cho IDE (pages/, fixtures/, tests/)
├── package.json               # Thêm @playwright/test devDep; thêm script "test:e2e"
│
├── pages/                     # Page Object classes (FR-005)
│   ├── LoginPage.ts
│   ├── ProductsPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   └── ConfirmationPage.ts
│
├── fixtures/                  # Custom Playwright fixtures
│   └── index.ts               # Re-export test/expect extended với loggedIn fixture
│
└── tests/                     # Test files theo user story (FR-003)
    ├── us1-login.spec.ts       # US1: đăng nhập, route guard (FR-001, FR-002, FR-003)
    ├── us2-products.spec.ts    # US2: danh sách sản phẩm (FR-004)
    ├── us3-add-to-cart.spec.ts # US3: thêm vào giỏ, badge (FR-005, FR-006, FR-009)
    ├── us4-cart-management.spec.ts  # US4: quản lý giỏ (FR-007, FR-008, FR-010)
    └── us5-checkout.spec.ts    # US5: checkout, confirmation (FR-011, FR-012, FR-013)
```

**Structure Decision**: Thư mục test ngang hàng với `src/` app, không phải
subproject riêng. Playwright thêm vào `package.json` hiện có. Phù hợp với
layout mặc định `npm init playwright@latest`; 1 lệnh `npm install`, 1
`node_modules/`; `src/` và `tests/` tách biệt rõ ràng.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `playwright.config.ts` chứa config Firefox + WebKit bị comment-out (spec clarification Q1: "Chỉ Chrome/Chromium", "đa trình duyệt nằm ngoài phạm vi") | Plan input người dùng yêu cầu "cấu hình chạy đa trình duyệt"; profiles Firefox/WebKit comment-out → Chromium vẫn là target duy nhất được chạy; chi phí runtime = 0 | Bỏ hoàn toàn Firefox/WebKit config — mất cơ hội học multi-browser expansion bằng cách bỏ comment 3 dòng; giá trị học tập về Playwright projects cao mà chi phí = 0 |
