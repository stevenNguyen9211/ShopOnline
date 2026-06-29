# Tasks: Trang Đặt Hàng (Checkout)

**Input**: Design documents from `specs/007-checkout-page/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-testids.md ✅

**Context**: Existing `CheckoutPage.tsx` is a 2-field MVP placeholder (họ tên + mã bưu chính).
This feature expands it to 8 fields, adds an order summary panel, shipping fee logic,
order ID generation, loading state, and a fully updated confirmation page.
The implementation also renames deprecated `data-testid` values to the canonical spec list.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no cross-task dependencies)
- **[Story]**: User story label (US1–US4) mapping to spec.md
- All paths are relative to repository root

---

## Phase 1: Setup

No new project setup needed — project infrastructure already in place (TypeScript,
React 19, Vite, Playwright, CSS Modules, react-router-dom v7 all installed).

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Create the `order.ts` utility module that all four user stories depend on.

**⚠️ CRITICAL**: This phase must complete before any user story work begins.

- [x] T001 Create `src/lib/order.ts` with: exported constants `FREE_SHIPPING_THRESHOLD = 500_000` and `FLAT_SHIPPING_FEE = 30_000`; exported function `calculateShipping(subtotal: number): number` returning 0 or FLAT_SHIPPING_FEE; exported function `generateOrderId(): string` returning format `ORD-YYYYMMDD-XXXX` (4 random chars from A-Z0-9)

**Checkpoint**: `src/lib/order.ts` exists and exports 2 constants + 2 functions — US story implementation can begin.

---

## Phase 3: User Story 1 — Xem Tóm Tắt Đơn Hàng (Priority: P1) 🎯 MVP

**Goal**: Trang checkout hiển thị tóm tắt đơn hàng gồm danh sách sản phẩm (tên, số lượng,
đơn giá), tạm tính, phí vận chuyển, và tổng tiền với đúng `data-testid`.

**Independent Test**: Điều hướng thẳng đến `/checkout` với giỏ hàng có sẵn → xác nhận
`checkout-order-summary` visible, `checkout-subtotal` + `checkout-shipping-fee` + `checkout-total`
hiển thị đúng giá trị. Có thể test mà không cần submit form.

### Implementation for User Story 1

- [x] T002 [US1] Update `src/pages/CheckoutPage.tsx` — add `import { products } from '../data/products'` and `import { calculateShipping } from '../lib/order'`; add computed variables `const subtotal = total` (from CartContext) and `const shippingFee = calculateShipping(subtotal)` and `const orderTotal = subtotal + shippingFee`; add order summary JSX section above the form with `data-testid="checkout-order-summary"` container listing each cart item (product name, quantity, unit price per item) and fee rows for tạm tính, phí vận chuyển, and tổng tiền
- [x] T003 [P] [US1] Update `src/pages/CheckoutPage.tsx` — add `data-testid="checkout-subtotal"` to tạm tính span, `data-testid="checkout-shipping-fee"` to phí vận chuyển span (text: "Miễn phí" when shippingFee === 0, else formatPrice(shippingFee)), `data-testid="checkout-total"` to tổng tiền span (note: this testid already exists on the old total row — move it to the new total in the summary section and remove the old standalone `.totalRow` div)
- [x] T004 [P] [US1] Update `src/pages/CheckoutPage.module.css` — add `.summary` block styles (background card, border, border-radius, padding matching `.form`), `.summaryHeading`, `.productList`, `.productRow` (flex, space-between), `.feeRow` (flex, space-between), `.totalRowSummary` (bold, border-top, font-lg) using existing design tokens

### Tests for User Story 1

- [x] T005 [US1] Update `tests/us5-checkout.spec.ts` — add `describe('US1 — Order Summary')` block with `@ci` tests: (a) checkout-order-summary is visible after navigating to /checkout with cart item; (b) checkout-subtotal text matches formatPrice of 2 × 1.200.000 đ = 2.400.000 đ; (c) checkout-shipping-fee shows "Miễn phí" when total ≥ 500.000 đ; (d) checkout-shipping-fee shows formatPrice(30000) when total < 500.000 đ (use "Bình giữ nhiệt" 320.000 đ); (e) checkout-total = subtotal + shippingFee; annotate each test with `# FR-001 / FR-002 / FR-003 / FR-004`

**Checkpoint**: US1 independently testable — order summary section renders correct data from CartContext.

---

## Phase 4: User Story 2 — Điền Thông Tin Nhận Hàng (Priority: P1)

**Goal**: Form checkout có đủ 8 trường bắt buộc với `data-testid` canonical, labels rõ ràng.

**Independent Test**: Vào `/checkout` → xác nhận đủ 8 input `data-testid` canonical có mặt và
có label tương ứng. Có thể test mà không cần submit.

### Implementation for User Story 2

- [x] T006 [US2] Update `src/pages/CheckoutPage.tsx` — add `useState` for 6 new fields: `email`, `streetAddress`, `ward`, `district`, `city`, `phone` and their 6 error states; rename existing state vars from `fullName`/`postalCode` pattern to match (keep names, only testid changes); add JSX for 6 new form fields (email, streetAddress, ward, district, city, phone) each with label + input + conditional error `<p>`, following existing `.field/.label/.input/.error` CSS pattern
- [x] T007 [US2] Update `src/pages/CheckoutPage.tsx` — rename `data-testid` on existing inputs: `checkout-fullname` → `checkout-full-name`, `checkout-postalcode` → `checkout-postal-code`; rename error testids: `checkout-fullname-error` → `checkout-full-name-error`, `checkout-postalcode-error` → `checkout-postal-code-error`; add canonical testids to new 6 fields per `contracts/ui-testids.md` (`checkout-email`, `checkout-street-address`, `checkout-ward`, `checkout-district`, `checkout-city`, `checkout-phone`) and their error testids
- [x] T008 [P] [US2] Update `pages/CheckoutPage.ts` — rename `fullnameInput` locator to `fullNameInput` using `getByTestId('checkout-full-name')`; rename `postalcodeInput` → `postalCodeInput` using `getByTestId('checkout-postal-code')`; rename error locators accordingly; add 6 new locators for email, streetAddress, ward, district, city, phone inputs and their error messages; rename/add fill methods (`fillFullName`, `fillEmail`, `fillStreetAddress`, `fillWard`, `fillDistrict`, `fillCity`, `fillPhone`, `fillPostalCode`); update `isFullnameErrorVisible`/`isPostalcodeErrorVisible` method names to match new naming

### Tests for User Story 2

- [x] T009 [US2] Update `tests/us5-checkout.spec.ts` — update all existing test helper calls to use renamed POM methods (`fillFullname` → `fillFullName`, `fillPostalcode` → `fillPostalCode`); add `describe('US2 — Delivery Form')` with test: all 8 input testids visible on /checkout page; annotate with `# FR-005`

**Checkpoint**: US2 independently testable — all 8 form fields visible with correct canonical testids and labels.

---

## Phase 5: User Story 3 — Kiểm Tra Hợp Lệ (Priority: P1)

**Goal**: Hệ thống chỉ rõ từng trường bị bỏ trống khi nhấn "Đặt hàng", validate email format
và phone digits-only, và xóa lỗi khi người dùng sửa trường đó.

**Independent Test**: Nhấn "Đặt hàng" với form rỗng → xác nhận tất cả 8 error testids visible
và URL vẫn là `/checkout`. Có thể test mà không cần đơn hàng thật.

### Implementation for User Story 3

- [x] T010 [US3] Update `src/pages/CheckoutPage.tsx` — expand `validate()` function: check all 8 fields for empty-after-trim; add email format check (`value.includes('@') && value.split('@')[1]?.length > 0`); add phone digits-only check (`/^\d+$/.test(value.trim())`); return error messages for each field into corresponding `setXxxError` calls
- [x] T011 [US3] Update `src/pages/CheckoutPage.tsx` — add `onChange` error-clearing: for each field's `onChange` handler, add a call to clear that field's error state (e.g., `onChange={(e) => { setEmail(e.target.value); setEmailError('') }}`) so errors disappear as user types

### Tests for User Story 3

- [x] T012 [US3] Update `tests/us5-checkout.spec.ts` — expand `describe('US5 — Form validation error paths')` to cover all 8 fields (currently only tests fullname + postalcode); add tests: (a) submit empty → all 8 error testids visible; (b) email "notvalid" → checkout-email-error visible; (c) phone "abc123" → checkout-phone-error visible; (d) fill field after error → error disappears; annotate each test with `# FR-006 / FR-007 / FR-008`

**Checkpoint**: US3 independently testable — all 8 validation scenarios work; errors appear per-field and clear on fix.

---

## Phase 6: User Story 4 — Đặt Hàng Thành Công và Xác Nhận (Priority: P1)

**Goal**: Nhấn "Đặt hàng" với form hợp lệ → nút hiển thị "Đang xử lý..." → trang xác nhận
hiển thị mã đơn hàng `ORD-YYYYMMDD-XXXX` và tổng tiền → giỏ hàng được xóa.

**Independent Test**: Điền đủ 8 trường hợp lệ → nhấn submit → xác nhận `checkout-success`
visible, `checkout-success-order-id` khớp pattern `ORD-\d{8}-[A-Z0-9]{4}`,
`checkout-success-total` khớp tổng tiền trên trang checkout, giỏ hàng trống.

### Implementation for User Story 4

- [x] T013 [US4] Update `src/pages/CheckoutPage.tsx` — expand `Order` type export to include all 12 fields: `orderId: string`, all 8 delivery fields, `subtotal: number`, `shippingFee: number`, `total: number`; add `import { generateOrderId } from '../lib/order'`; add `const [isSubmitting, setIsSubmitting] = useState(false)`; update `handleSubmit`: call `setIsSubmitting(true)`, build full `Order` object with `orderId: generateOrderId()` and all 8 field values and computed `subtotal`, `shippingFee`, `orderTotal`, then `dispatch({ type: 'CLEAR' })` then `navigate('/confirmation', { state: { order } })`; update submit button: `disabled={isSubmitting}` and text `{isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}`; add `data-testid="checkout-submit"` (already exists — keep it)
- [x] T014 [P] [US4] Update `src/pages/ConfirmationPage.tsx` — update `Order` type import to include `orderId` field; add `data-testid="checkout-success"` to root container (replace or supplement `data-testid="confirmation-page"`); add `<span data-testid="checkout-success-order-id">` displaying `order.orderId`; rename `data-testid="confirmation-total"` → `data-testid="checkout-success-total"`; remove `data-testid="confirmation-message"` from the success paragraph (no longer a required test target per contracts/ui-testids.md)
- [x] T015 [P] [US4] Update `pages/ConfirmationPage.ts` — add `orderIdText: Locator` using `getByTestId('checkout-success-order-id')`; rename `totalText` locator to use `getByTestId('checkout-success-total')`; add `getOrderId(): Promise<string>` method; keep `getTotal()` method name for backward compat but point to new testid

### Tests for User Story 4

- [x] T016 [US4] Update `tests/us5-checkout.spec.ts` — update all `beforeEach` happy-path helpers to call `checkoutPage.fillFullName`, `fillEmail`, `fillStreetAddress`, `fillWard`, `fillDistrict`, `fillCity`, `fillPhone`, `fillPostalCode` with valid data; update `confirmationPage.getTotal()` call (method name kept); add new `@ci` tests: (a) order-id on confirmation matches pattern `/^ORD-\d{8}-[A-Z0-9]{4}$/`; (b) checkout-success container is visible; annotate with `# FR-009 / FR-010 / FR-011 / FR-014`

**Checkpoint**: US4 independently testable — full checkout flow produces confirmation with valid order ID and cleared cart.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T017 [P] Run `npm run lint` from repo root and fix any TypeScript or ESLint errors introduced by new code in `src/lib/order.ts`, `src/pages/CheckoutPage.tsx`, `src/pages/ConfirmationPage.tsx`
- [x] T018 [P] Run `npm run format:check` from repo root; run `npm run format` if any files need formatting
- [x] T019 Run `npx playwright test tests/us5-checkout.spec.ts` from repo root and confirm all tests pass (0 failures)
- [x] T020 Manually validate Scenario 1 (happy path) and Scenario 3 (validation) from `specs/007-checkout-page/quickstart.md` in a local browser (`npm run dev`)

**Checkpoint**: All linting, formatting, and E2E tests clean. Feature ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (Foundational)**: No dependencies — start immediately
- **Phase 3 (US1)**: Depends on T001 (`src/lib/order.ts` must exist for `calculateShipping` import)
- **Phase 4 (US2)**: Depends on Phase 3 completion (CheckoutPage.tsx modified in US1; US2 continues editing same file)
- **Phase 5 (US3)**: Depends on Phase 4 completion (validate() expands the 8-field form added in US2)
- **Phase 6 (US4)**: Depends on Phase 5 completion (handleSubmit uses all 8 validated fields)
- **Phase 7 (Polish)**: Depends on all user story phases complete

### Within Each User Story

- T003, T004 within US1 are marked [P] — they touch different concerns (testids vs. CSS) and can be done in parallel with T002
- T008 within US2 is marked [P] — POM update is independent of CheckoutPage.tsx changes
- T014, T015 within US4 are marked [P] — ConfirmationPage.tsx and POM are different files

### Cross-Cutting Warning

Renaming `checkout-fullname` → `checkout-full-name` in T007 breaks the existing POM
until T008 is also applied. **T007 and T008 must be committed together** to avoid
a broken test suite between commits. Same for T014 + T015 (ConfirmationPage rename).

---

## Parallel Example: User Story 1

```bash
# Can run in parallel (different files/concerns):
Task T003: Add testid attributes to order summary spans in CheckoutPage.tsx
Task T004: Add order summary CSS styles in CheckoutPage.module.css
# Must run after T002:
Task T002 (first): Add order summary JSX and computed values to CheckoutPage.tsx
```

## Parallel Example: User Story 4

```bash
# Can run in parallel (different files):
Task T013: Update CheckoutPage.tsx (Order type, handleSubmit, loading state)
Task T014: Update ConfirmationPage.tsx (orderId display, canonical testids)
Task T015: Update pages/ConfirmationPage.ts POM (orderId locator)
# Must run after T013–T015:
Task T016: Update us5-checkout.spec.ts (uses new POM methods + tests new behavior)
```

---

## Implementation Strategy

### MVP First (All stories are P1 — implement in sequence)

1. Complete Phase 2 (T001) → order.ts utility ready
2. Complete Phase 3 (T002–T005) → order summary visible, SC-001/SC-003 testable
3. Complete Phase 4 (T006–T009) → 8-field form with correct testids
4. Complete Phase 5 (T010–T012) → full validation, SC-002 achieved
5. Complete Phase 6 (T013–T016) → end-to-end order flow, all 14 FRs covered
6. Complete Phase 7 (T017–T020) → clean, shippable

### Incremental Delivery

After each phase checkpoint, the feature delivers a verifiable increment:
- After US1: Order summary visible (even with old 2-field form still in place)
- After US2: All 8 fields present with canonical testids
- After US3: Validation complete and testable
- After US4: Full checkout-to-confirmation flow working

---

## Notes

- [P] tasks = different files with no inter-task dependency in that phase
- [US1]–[US4] maps to the 4 P1 stories in spec.md
- All 14 FRs are covered across phases (FR-001–FR-014)
- `tests/us5-checkout.spec.ts` is updated across multiple phases — commit each phase's test updates alongside its implementation tasks
- The `data-testid` rename (T007 + T008) is a breaking change handled atomically in Phase 4
- Total test count: existing 6 tests updated + ~10 new tests added across 4 user stories

---

## UI Redesign (2026-06-29) — Retroactive

**Context**: Post-ship UI iteration theo mockup. Không có FR mới. Tất cả tasks
đã được thực hiện và đánh dấu `[x]`. Document này ghi lại retrospectively theo
quy trình SDD.

**Input**: Design decisions từ `specs/007-checkout-page/plan.md#ui-redesign`
và clarification session 2026-06-29.

---

### Phase R1: Layout & Visual Redesign

**Goal**: Chuyển từ single-column layout sang 2-column layout theo mockup;
thêm product avatars và visual enhancements trong order summary.

- [x] T021 [P] [US1] Rewrite `src/pages/CheckoutPage.module.css` — 2-column CSS Grid layout (`420px 1fr`), summary card styles, product avatar/row/badge classes, delivery address display classes, responsive mobile stack
- [x] T022 [US1] Rewrite `src/pages/CheckoutPage.tsx` — 2-column layout JSX, `AVATAR_COLORS` constant, product avatar rendering (colored square + first letter), "Số lượng: X" format, badge pill "X sản phẩm", submit button in left column using `form="checkout-form"`, "Miễn phí" with green class, "1" badge before form heading, disclaimer text, page title "Thông tin đặt hàng" + subtitle

**Checkpoint**: Trang checkout hiển thị 2 cột; sản phẩm có avatar màu; submit button ở cột trái.

---

### Phase R2: Combined Address Display

**Goal**: Thêm hiển thị địa chỉ giao hàng gộp real-time trong order summary card.

- [x] T023 [US2] Update `src/pages/CheckoutPage.tsx` — thêm `combinedAddress` computed variable `[streetAddress, ward, district, city].filter(Boolean).join(', ')`; render conditional `<div className={styles.deliveryAddress}>` với label "Địa chỉ giao hàng" và text gộp trong summary card, giữa product list và divider; không có `data-testid`

**Checkpoint**: Khi người dùng nhập địa chỉ, cột trái cập nhật real-time.

---

### Phase R3: Form Layout Refinements

**Goal**: Cải thiện layout form — ward/district side-by-side, phone/postal side-by-side.

- [x] T024 [US2] Update `src/pages/CheckoutPage.tsx` — dùng `.fieldRow` (grid 1fr 1fr) cho cặp ward+district và phone+postalCode; giữ fullName, email, streetAddress, city là full-width fields dọc

**Checkpoint**: Form có 2 hàng 2 cột: (ward, district) và (phone, postalCode).

---

### Phase R4: Polish & Validation

- [x] T025 [P] Run `npm run lint` — confirm no errors sau rewrite
- [x] T026 [P] Run `npm run format` — auto-fix formatting trong `src/pages/CheckoutPage.tsx` và `src/pages/CheckoutPage.module.css`
- [x] T027 Run `npx playwright test tests/us5-checkout.spec.ts` — confirm 19/19 pass (POM và tests không đổi vì testid contract giữ nguyên)

**Checkpoint**: Lint sạch, format sạch, 19/19 E2E tests pass.

---

### Dependencies (UI Redesign)

- T021 [P] T022 có thể chạy song song (CSS vs TSX, khác file)
- T023 phụ thuộc T022 (cần form state `streetAddress`, `ward`, `district`, `city` đã có)
- T024 phụ thuộc T022 (cần `.fieldRow` class từ T021 và JSX structure từ T022)
- T025–T027 phụ thuộc T021–T024 hoàn thành

### Notes (UI Redesign)

- Tổng 7 tasks mới (T021–T027), tất cả `[x]`
- POM (`pages/CheckoutPage.ts`) và tests (`tests/us5-checkout.spec.ts`) **không thay đổi** — testid contract FR-012 giữ nguyên
- Combined address display không có testid theo quyết định Q3 clarification session
- `src/pages/CheckoutPage.module.css` được rewrite hoàn toàn (không chỉ update)
