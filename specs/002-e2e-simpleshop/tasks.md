# Tasks: Bộ kiểm thử tự động E2E cho SimpleShop

**Input**: Design documents from `specs/002-e2e-simpleshop/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/page-objects.md,
research.md, quickstart.md

**Manual test items**: Xem `spec.md#manual-test-coverage` — FR-014 (tiếng Việt),
FR-009 (login session reload), FR-013 trên trang checkout.

**Organization**: Task nhóm theo phase. Phase 1–2 là hạ tầng chung; Phase 3–7
mỗi phase = 1 user story, có checkpoint độc lập; Phase 8 là validation cuối.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Chạy song song được (khác file, không phụ thuộc task chưa xong)
- **[Story]**: US1–US5 theo spec.md

## Path Conventions

Repo root: `playwright.config.ts`, `tsconfig.e2e.json`
Test code: `pages/`, `fixtures/`, `tests/`
App code (không sửa): `src/`, `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Cài Playwright, cấu hình runner, file hạ tầng

- [X] T001 Cài `@playwright/test` vào devDependencies và tải browser Chromium: `npm install --save-dev @playwright/test && npx playwright install chromium`; thêm script `"test:e2e": "playwright test"` vào `package.json`
- [X] T00X Tạo `playwright.config.ts` tại repo root: `baseURL: 'http://localhost:5173'`, `webServer` tự khởi `npm run dev` (port 5173, `reuseExistingServer: !process.env.CI`), `projects` chứa 1 project `chromium` active (Firefox + WebKit comment-out), `reporter: [['html'], ['list']]`, `fullyParallel: true`, `timeout: 30_000`
- [X] T00X [P] Tạo `tsconfig.e2e.json` tại repo root: `target ES2020`, `module commonjs`, `strict true`, `types ["@playwright/test"]`, `include ["tests/**/*", "pages/**/*", "fixtures/**/*"]` — chỉ phục vụ IDE, không ảnh hưởng build app
- [X] T00X [P] Thêm `playwright-report/` và `test-results/` vào `.gitignore`

**Checkpoint**: `npx playwright test --list` chạy không lỗi (0 test, chưa có spec file)

---

## Phase 2: Foundational (Page Objects & Fixtures)

**Purpose**: 5 Page Object classes + fixture — nền tảng cho mọi test file

- [X] T00X [P] Tạo `pages/LoginPage.ts`: constructor nhận `page: Page`; locators `loginPage` (`data-testid="login-page"`), `userButton(userId)` (`data-testid="login-user-{userId}"`); methods `loginAsUser(userId: string)` (bấm thẻ user, đợi URL `/products`), `isAt()` (kiểm tra URL = `/login`)
- [X] T00X [P] Tạo `pages/ProductsPage.ts`: locators grid, card, và 4 child locators scoped trong card (name/price/image/add-to-cart); header locators (cart-count, cart-link, user-name, logout); methods `getProductCount()`, `getProductName/Price(productId)`, `addToCart(productId)`, `isAddToCartDisabled(productId)`, `getCartCount()`, `goToCart()`, `logout()`, `getHeaderUsername()` — theo contracts/page-objects.md
- [X] T00X [P] Tạo `pages/CartPage.ts`: locators cart-page, cart-empty-message, cart-total, cart-checkout; `cartItem(productId)` + 7 scoped child locators (name, unit-price, quantity, increase, decrease, subtotal, remove); `header-cart-count`; methods `getTotal()`, `getQuantity/increaseQuantity/decreaseQuantity/removeItem(productId)`, `goToCheckout()`, `isCheckoutDisabled()`, `isEmpty()`, `isIncrease/DecreaseDisabled(productId)`, `getCartCount()` — theo contracts/page-objects.md
- [X] T00X [P] Tạo `pages/CheckoutPage.ts`: locators checkout-page, fullname/postalcode input+error, checkout-total, checkout-submit; methods `fillFullname/Postalcode(value)`, `submit()`, `getTotal()`, `isFullname/PostalcodeErrorVisible()`, `getFullname/PostalcodeError()` — theo contracts/page-objects.md
- [X] T00X [P] Tạo `pages/ConfirmationPage.ts`: locators confirmation-page, confirmation-message, confirmation-total, confirmation-back-to-products; methods `getTotal()`, `getMessage()`, `goBackToProducts()`, `isAt()` — theo contracts/page-objects.md
- [X] T01X Tạo `fixtures/index.ts`: re-export `test` và `expect` từ `@playwright/test` (extended base); file này là import point cho toàn bộ test files thay vì import trực tiếp `@playwright/test`

**Checkpoint**: TypeScript compile không lỗi (`npx tsc --project tsconfig.e2e.json --noEmit`)

---

## Phase 3: User Story 1 — Kiểm chứng đăng nhập và bảo vệ trang (P1)

**Goal**: Xác nhận login 1-chạm hoạt động, header đúng, route guard chặn đúng trang

**Independent Test**: Chạy `npx playwright test tests/us1-login.spec.ts` — không cần dữ liệu giỏ hàng

- [X] T01X [US1] Tạo `tests/us1-login.spec.ts` với 6 test cases (import từ `'../fixtures'`, dùng `LoginPage` và `ProductsPage`):
  - `'hiển thị đúng 3 thẻ user trên trang login'` — assert 3 button `login-user-*` visible *(app FR-001)*
  - `'đăng nhập bằng thẻ Minh Nguyễn → /products, header hiển thị tên'` — `loginAsUser('minh')`, assert URL + `getHeaderUsername()` *(app FR-001, FR-003)*
  - `'truy cập /products khi chưa đăng nhập → redirect /login'` — `page.goto('/products')`, assert URL = `/login` *(app FR-002)*
  - `'truy cập /cart khi chưa đăng nhập → redirect /login'` — `page.goto('/cart')`, assert URL = `/login` *(app FR-002)*
  - `'truy cập /checkout khi chưa đăng nhập → redirect /login'` — `page.goto('/checkout')`, assert URL = `/login` *(app FR-002)*
  - `'đăng xuất → về /login, không thể vào /products'` — login, `logout()`, assert URL login, `page.goto('/products')` assert URL vẫn `/login` *(app FR-003)*

**Checkpoint**: `npx playwright test tests/us1-login.spec.ts` 6/6 pass

---

## Phase 4: User Story 2 — Kiểm chứng hiển thị danh sách sản phẩm (P2)

**Goal**: Xác nhận 6 card đầy đủ thông tin, định dạng giá VND đúng, alt text đúng

**Independent Test**: Chạy `npx playwright test tests/us2-products.spec.ts`

- [X] T01X [US2] Tạo `tests/us2-products.spec.ts` với 3 test cases (dùng `LoginPage`, `ProductsPage`; `beforeEach` login bằng `loginAsUser('minh')`):
  - `'danh sách sản phẩm: đúng 6 card, mỗi card có đủ name/price/image/nút'` — `getProductCount() === 6`, với card `ban-phim-co` assert name visible, price visible, image visible, button "Thêm vào giỏ" visible *(app FR-004, FR-013)*
  - `'giá sản phẩm đúng định dạng VND (X.XXX.XXX ₫)'` — `getProductPrice('ban-phim-co')` match regex `/\d{1,3}(\.\d{3})* ₫/` *(app FR-013)*
  - `'ảnh sản phẩm có alt text bằng tên sản phẩm'` — `productImage('ban-phim-co').getAttribute('alt')` === tên sản phẩm tương ứng *(app FR-004)*

**Checkpoint**: `npx playwright test tests/us2-products.spec.ts` 3/3 pass

---

## Phase 5: User Story 3 — Kiểm chứng thêm vào giỏ và badge (P3)

**Goal**: Xác nhận badge cập nhật ngay, cộng dồn đúng, giữ sau reload, disabled khi đạt 5

**Independent Test**: Chạy `npx playwright test tests/us3-add-to-cart.spec.ts`

- [X] T01X [US3] Tạo `tests/us3-add-to-cart.spec.ts` với 4 test cases (dùng `LoginPage`, `ProductsPage`; `beforeEach` login bằng `loginAsUser('minh')`):
  - `'thêm sản phẩm lần đầu → badge từ 0 lên 1'` — `getCartCount() === '0'`, `addToCart('ban-phim-co')`, `getCartCount() === '1'` *(app FR-005, FR-006)*
  - `'thêm lại cùng sản phẩm → badge cộng dồn, không tạo dòng mới'` — add 2 lần cùng `ban-phim-co`, `getCartCount() === '2'`; sau đó `goToCart()` và assert chỉ có đúng 1 `cart-item-ban-phim-co` visible (không tạo dòng trùng) *(app FR-005, FR-006)*
  - `'giỏ hàng giữ nguyên sau khi tải lại trang'` — add 2 lần, `page.reload()`, `getCartCount() === '2'` *(app FR-009)*
  - `'nút Thêm vào giỏ disabled khi sản phẩm đạt 5 trong giỏ'` — add `ban-phim-co` 5 lần, `isAddToCartDisabled('ban-phim-co') === true` *(app FR-008)*

**Checkpoint**: `npx playwright test tests/us3-add-to-cart.spec.ts` 4/4 pass

---

## Phase 6: User Story 4 — Kiểm chứng quản lý giỏ hàng (P4)

**Goal**: Xác nhận hiển thị đầy đủ, tăng/giảm/xóa hoạt động đúng, trạng thái rỗng đúng

**Independent Test**: Chạy `npx playwright test tests/us4-cart-management.spec.ts`

- [X] T01X [US4] Tạo `tests/us4-cart-management.spec.ts` với 7 test cases tổ chức thành **2 `describe` block** (dùng `LoginPage`, `ProductsPage`, `CartPage`):

  **`describe` 1 — "Giỏ có hàng" (6 tests)**: `beforeEach` login + add `ban-phim-co` 2 lần + `page.goto('/cart')`:
  - `'hiển thị đúng tên, giá đơn vị, số lượng, thành tiền, tổng'` — assert `getQuantity('ban-phim-co') === 2`, `getTotal()` match VND format, subtotal = unit-price × 2 *(app FR-007, FR-013)*
  - `'tăng số lượng → qty+1, tổng và badge cập nhật'` — `increaseQuantity('ban-phim-co')`, assert qty=3, `getTotal()` tăng, `getCartCount()` tăng *(app FR-007, FR-008)*
  - `'giảm số lượng → qty-1, các giá trị tiền cập nhật'` — `decreaseQuantity('ban-phim-co')` (từ qty=2 về 1), assert qty=1, total giảm *(app FR-008)*
  - `'nút giảm disabled khi số lượng = 1'` — `decreaseQuantity('ban-phim-co')` để về qty=1, assert `isDecreaseDisabled('ban-phim-co') === true` *(app FR-008)*
  - `'nút tăng disabled khi số lượng = 5'` — `increaseQuantity` 3 lần (2→5), assert `isIncreaseDisabled('ban-phim-co') === true` *(app FR-008)*
  - `'xóa mặt hàng → dòng biến mất, tổng và badge cập nhật'` — add thêm `chuot-khong-day` 1 lần, `removeItem('ban-phim-co')`, assert `cart-item-ban-phim-co` not visible, tổng giảm, badge giảm *(app FR-007, FR-008)*

  **`describe` 2 — "Giỏ trống" (1 test)**: `beforeEach` chỉ login + `page.goto('/cart')` (KHÔNG add hàng):
  - `'giỏ trống: hiện thông báo giỏ trống, nút Thanh toán disabled'` — `isEmpty() === true`, `isCheckoutDisabled() === true` *(app FR-010)*

**Checkpoint**: `npx playwright test tests/us4-cart-management.spec.ts` 7/7 pass

---

## Phase 7: User Story 5 — Kiểm chứng checkout và xác nhận (P5)

**Goal**: Khép kín hành trình mua hàng; phủ happy path + 4 error path

**Independent Test**: Chạy `npx playwright test tests/us5-checkout.spec.ts`

- [X] T01X [US5] Tạo `tests/us5-checkout.spec.ts` với 7 test cases tổ chức thành **3 `describe` block** (dùng `LoginPage`, `ProductsPage`, `CartPage`, `CheckoutPage`, `ConfirmationPage`):

  **`describe` 1 — "Happy path" (3 tests)**: `beforeEach` login + add `ban-phim-co` 2 lần + `page.goto('/cart')`:
  - `'nút Thanh toán → chuyển đến trang checkout'` — `goToCheckout()`, assert URL = `/checkout` *(app FR-010)*
  - `'checkout hợp lệ → trang xác nhận hiển thị tổng tiền khớp cart'` — lưu `cartTotal = cartPage.getTotal()` trước khi `goToCheckout()`, `fillFullname('Minh Nguyen')`, `fillPostalcode('70000')`, `submit()`, assert URL = `/confirmation`, `confirmationPage.getTotal() === cartTotal` *(app FR-012, FR-013)*
  - `'sau đặt hàng thành công → badge giỏ hàng về 0'` — checkout thành công, `goBackToProducts()`, `productsPage.getCartCount() === '0'` *(app FR-012)*

  **`describe` 2 — "Form validation error paths" (3 tests)**: `beforeEach` login + add `ban-phim-co` 2 lần + `page.goto('/checkout')`:
  - `'submit cả 2 trường trống → hiện đủ 2 lỗi, ở lại /checkout'` — `submit()` không fill gì, `isFullnameErrorVisible() === true`, `isPostalcodeErrorVisible() === true`, assert URL vẫn `/checkout` *(app FR-011)*
  - `'submit họ tên điền nhưng postal trống → chỉ lỗi postal'` — `fillFullname('Minh')`, `submit()`, `isFullnameErrorVisible() === false`, `isPostalcodeErrorVisible() === true` *(app FR-011)*
  - `'submit cả 2 trường chỉ khoảng trắng → coi là trống, hiện 2 lỗi'` — `fillFullname('   ')`, `fillPostalcode('   ')`, `submit()`, cả 2 error visible *(app FR-011)*

  **`describe` 3 — "Empty cart guard" (1 test)**: `beforeEach` chỉ login (KHÔNG add hàng):
  - `'truy cập /checkout khi giỏ trống → redirect /cart'` — `page.goto('/checkout')`, assert URL = `/cart` *(app FR-010)*

**Checkpoint**: `npx playwright test tests/us5-checkout.spec.ts` 7/7 pass

---

## Phase 8: Polish & Validation

- [X] T01X Chạy toàn bộ suite `npx playwright test` và xác nhận: (a) 27/27 test pass (SC-001); (b) tổng thời gian < 3 phút (SC-003); (c) `npx playwright show-report` mở được báo cáo HTML với tên test rõ ràng; (d) SC-002 "happy+error per flow" — lưu ý: error path cho luồng "xem sản phẩm" là US1-SC3 (route guard `/products`) trong `us1-login.spec.ts`, không phải trong `us2-products.spec.ts`
- [X] T01X Chạy lại `npx playwright test` 2 lần nữa (tổng 3 lần); xác nhận kết quả giống nhau — không có test nào fail hoặc skip bất thường (SC-004)
- [X] T01X [P] Rà soát toàn bộ `pages/` đối chiếu `contracts/page-objects.md` và `specs/001-simpleshop-demo/contracts/ui-contract.md`: 100% locator dùng `getByTestId` hoặc accessible role, không có `.locator('.')`, `nth()`, class CSS hay XPath nào (SC-005)

---

## Dependencies & Execution Order

```text
Phase 1 (Setup) ──▶ Phase 2 (Foundational) ──▶ US1 ──▶ US2 ──▶ US3 ──▶ US4 ──▶ US5 ──▶ Phase 8
```

- **Phase 2 chặn mọi test file**: Page Objects và fixtures phải xong trước khi viết test.
- **Phase 3 (US1) chặn US2–US5**: Login phải hoạt động để test các trang sau.
- **US2, US3, US4, US5 độc lập với nhau** sau khi US1 pass: có thể viết song song nhưng chạy riêng để debug dễ hơn.
- Trong Phase 2: T005–T010 hoàn toàn song song (5 Page Object file + fixtures đều khác file, không phụ thuộc nhau).
- Trong Phase 1: T003 và T004 song song sau T001–T002.

## Parallel Opportunities

- Phase 1: T003 ∥ T004 (sau T001–T002)
- Phase 2: T005 ∥ T006 ∥ T007 ∥ T008 ∥ T009 ∥ T010 (tất cả song song)
- Phase 8: T016 → T017 → T018 ∥ (T018 không phụ thuộc T017)

## Implementation Strategy

**Page Objects trước test**: Viết đủ 5 Page Object và fixtures (Phase 2) trước
khi bắt đầu bất kỳ test file nào. Điều này tránh viết lại locator khi refactor.

**US1 là MVP**: Checkpoint US1 (T011 pass) chứng minh toàn bộ hạ tầng (Playwright
+ webServer + Page Object + fixtures) hoạt động đầu-cuối. Sau đó các US còn lại
chỉ thêm scenario, không thêm hạ tầng.

**Test file layout chuẩn** cho mỗi file:
```typescript
import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'
// ... other page imports

test.describe('US# — Tên User Story', () => {
  test.beforeEach(async ({ page }) => { /* setup */ })

  test('mô tả scenario — (app FR-###)', async ({ page }) => {
    // Given / When / Then
  })
})
```
