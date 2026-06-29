# Implementation Plan: Trang Đặt Hàng (Checkout)

**Branch**: `007-checkout-page` | **Date**: 2026-06-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-checkout-page/spec.md`

## Summary

Mở rộng trang checkout từ 2 trường (họ tên, mã bưu chính) hiện có thành form
8 trường đầy đủ, bổ sung phần tóm tắt đơn hàng (danh sách sản phẩm, tạm tính,
phí vận chuyển, tổng), sinh mã đơn hàng `ORD-YYYYMMDD-XXXX` phía client, trạng
thái loading trên nút "Đặt hàng", và hiển thị mã đơn hàng trên trang xác nhận.
Toàn bộ logic được triển khai client-side không có backend.

## Technical Context

**Language/Version**: TypeScript 5.8 + React 19

**Primary Dependencies**: react-router-dom v7, Vite 6, CSS Modules (đã có)

**Storage**: localStorage qua `CartContext` (đã có); thông tin đơn hàng truyền
qua `react-router` location state (không lưu localStorage)

**Testing**: Playwright + Page Object Model (đã có pattern)

**Target Platform**: SPA trong trình duyệt, deploy GitHub Pages

**Project Type**: Web application (frontend SPA)

**Performance Goals**: Hoàn thành luồng checkout trong < 3 phút (SC-001)

**Constraints**: Không có backend, không có API call — mọi xử lý là synchronous
client-side; không thêm thư viện mới

**Scale/Scope**: Demo project — 1 page, 8 form fields, 1 utility module mới

## Constitution Check

| Nguyên tắc | Trạng thái | Ghi chú |
|------------|-----------|---------|
| I. Code Sạch | ✅ Pass | Logic sinh orderId và tính phí vận chuyển tách vào `src/lib/order.ts` |
| II. YAGNI | ✅ Pass | Không thêm thư viện; dùng CSS Modules, formatPrice, và router state sẵn có |
| III. UI Test-able | ✅ Pass | 24 `data-testid` canonical theo FR-012; POM cập nhật tương ứng |
| IV. Không Backend | ✅ Pass | Đơn hàng giả lập hoàn toàn client-side |
| V. UX Nhất Quán | ✅ Pass | Dùng design tokens và pattern field/label/error từ LoginPage |
| VI. Test Có Kỷ Luật | ✅ Pass | Page Object, FR traceability, happy + error paths |
| VII. CI/CD | ✅ Pass | Không thêm env vars; không thay đổi workflow |
| VIII. Plain Text Pwd | N/A | Không liên quan |
| IX. Schema Cố Định | N/A | Không truy cập Supabase |

**Kết quả**: Tất cả gates pass — không cần Complexity Tracking.

**Lưu ý renaming data-testid**: Existing code dùng `checkout-fullname` /
`checkout-postalcode`; spec canonical dùng `checkout-full-name` /
`checkout-postal-code`. Đây là breaking change nhỏ — được xử lý trong cùng PR
theo Nguyên tắc III.

## Project Structure

### Documentation (this feature)

```text
specs/007-checkout-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-testids.md    # Phase 1 output — canonical data-testid contract
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── format.ts          # (existing) formatPrice
│   ├── order.ts           # (NEW) generateOrderId, calculateShipping
│   └── storage.ts         # (existing) localStorage helpers
├── pages/
│   ├── CheckoutPage.tsx   # (UPDATE) 8 fields + order summary + loading state
│   ├── CheckoutPage.module.css  # (UPDATE) styles for new layout
│   ├── ConfirmationPage.tsx     # (UPDATE) add orderId display
│   └── ConfirmationPage.module.css  # (UPDATE if needed)
└── context/
    └── CartContext.tsx    # (existing, no change)

pages/                     # Playwright Page Objects
├── CheckoutPage.ts        # (UPDATE) add new field locators + rename testids
└── ConfirmationPage.ts    # (UPDATE) add orderId locator

tests/
└── us5-checkout.spec.ts   # (UPDATE) expand tests for all 14 FRs
```

**Structure Decision**: Single SPA project, flat `src/pages/` + `src/lib/`
pattern established by existing features. Logic mới cho shipping/orderId đủ nhỏ
để đặt trong `src/lib/order.ts` — không cần thêm layer abstraction.

## Complexity Tracking

> Không có vi phạm — không cần ghi nhận.

---

## UI Redesign (2026-06-29)

**Context**: Post-ship UI iteration để cải thiện visual presentation theo mockup.
Không có FR mới; tất cả FR-001–FR-014 và data model giữ nguyên. Thay đổi thuần
UI/layout — được document retroactively theo quy trình SDD.

### Design Decisions

#### Layout: 2-Column Grid

- **Decision**: CSS Grid `grid-template-columns: 420px 1fr`
- **Left column**: Order summary card + combined address preview + submit + disclaimer
- **Right column**: Delivery form (8 fields giữ nguyên)
- **Rationale**: Tách "review đơn hàng" (trái) khỏi "nhập thông tin" (phải) —
  pattern checkout phổ biến giúp người dùng xem lại đơn trước khi submit.
- **Submit button**: Đặt ở cột trái, dùng HTML5 `form="checkout-form"` để
  submit form ở cột phải mà không cần nesting — tránh invalid HTML.
- **Mobile**: Stack thành 1 cột; form (phải) hiện trước summary (trái) qua
  CSS `order` property.

#### Product Avatars

- **Decision**: Ô vuông màu với chữ cái đầu của tên sản phẩm; màu xác định
  theo `productId` qua constant `AVATAR_COLORS`.
- **Colors**: `ban-phim-co` → #3B82F6, `chuot-khong-day` → #22C55E,
  `tai-nghe-bluetooth` → #A855F7, `balo-laptop` → #F97316,
  `binh-giu-nhiet` → #EF4444, `den-ban-led` → #EAB308
- **Rationale**: Không cần ảnh sản phẩm trong summary; phân biệt trực quan
  giúp người dùng scan đơn hàng nhanh. Màu hard-coded theo productId — đủ
  đơn giản cho demo scope (YAGNI).

#### Combined Address Display trong Summary

- **Decision**: Derived string `[streetAddress, ward, district, city].filter(Boolean).join(', ')`
  hiển thị trong order summary card, cập nhật real-time khi người dùng nhập.
- **Position**: Giữa danh sách sản phẩm và phần phí.
- **Rationale**: Cho người dùng xem địa chỉ giao hàng đầy đủ trước khi nhấn
  "Đặt hàng" mà không phải cuộn xuống form. Chỉ render khi ít nhất 1 trường
  địa chỉ có giá trị.
- **Không có testid**: Display phụ, không cần hợp đồng automation
  (quyết định Q3 — clarification session 2026-06-29).

#### Form Layout Changes

- Ward + district side-by-side (`grid-template-columns: 1fr 1fr`)
- Phone + postal code side-by-side (cùng pattern)
- "1" badge vuông xanh trước heading form (visual step indicator)
- fullName, email, streetAddress, city: full-width, xếp dọc

### Constitution Check (UI Redesign)

| Nguyên tắc | Trạng thái | Ghi chú |
|------------|-----------|---------|
| I. Code Sạch | ✅ Pass | Avatar colors là named constant; combinedAddress là computed variable |
| II. YAGNI | ✅ Pass | Không thư viện mới; CSS Modules; màu hard-coded (không cần color utility) |
| III. UI Test-able | ✅ Pass | Tất cả testids từ FR-012 giữ nguyên; combined address display không có testid theo Q3 |
| IV. Không Backend | ✅ Pass | Thuần UI change |
| V. UX Nhất Quán | ✅ Pass | Design tokens dùng xuyên suốt; formatPrice tái sử dụng |
| VI. Test Có Kỷ Luật | ✅ Pass | Không đổi test/POM; 19/19 tests pass sau redesign |
| VII. CI/CD | ✅ Pass | Không env vars mới; không đổi workflow |

**Kết quả**: Tất cả gates pass — không cần Complexity Tracking.

### Files Changed

| File | Loại thay đổi |
|------|---------------|
| `src/pages/CheckoutPage.tsx` | Rewrite: 2-column layout, avatars, combined address display, submit ở cột trái |
| `src/pages/CheckoutPage.module.css` | Rewrite: layout classes mới + 3 classes `.deliveryAddress*` |
| `specs/007-checkout-page/spec.md` | Clarifications section: 3 quyết định UI redesign |

---

## Form Polish (2026-06-29)

**Context**: Micro-refinements sau khi review mockup — spacing, placeholder color, và
placeholder text. Thuần CSS + JSX attribute changes, không ảnh hưởng logic hay testid.

### Design Decisions

#### Label-to-Input Spacing

- **Vấn đề**: Gap giữa label và input trong `.field` quá lớn, label trông "nổi cao" so với input.
- **Decision**: Giảm `gap` trong `.field` từ `var(--space-2)` xuống `var(--space-1)`.
- **Rationale**: `--space-1` (~4px) phù hợp hơn cho label-input pair; `--space-2` (~8px) dùng cho các element độc lập.

#### Placeholder Color

- **Vấn đề**: Placeholder text quá đậm, khó phân biệt với text đã nhập.
- **Decision**: Thêm CSS rule `.input::placeholder { color: var(--color-text-muted); opacity: 0.5; }`.
- **Rationale**: Dùng design token `--color-text-muted` + `opacity: 0.5` đảm bảo nhất quán với hệ thống màu hiện có mà không hard-code giá trị mới.

#### Placeholder Text — Ward / District / City

- **Vấn đề**: "Láng Thượng", "Đống Đa", "Hà Nội" quá cụ thể, áp đặt địa danh của một khu vực.
- **Decision**: Để trống — không có placeholder cho `checkout-ward`, `checkout-district`, `checkout-city`.
- **Rationale**: Label đã đủ hướng dẫn; placeholder rỗng tránh gây nhầm lẫn cho user ở tỉnh thành khác. `checkout-street-address` giữ placeholder "123 Đường Láng" vì minh hoạ format số nhà/đường rõ hơn.
- **Alternatives rejected**: "VD: Phường 1" — vẫn có thể gây nhầm ở nông thôn (xã, thôn).

### Constitution Check (Form Polish)

| Nguyên tắc | Trạng thái | Ghi chú |
|------------|-----------|---------|
| I. Code Sạch | ✅ Pass | Dùng design token, không hard-code giá trị |
| II. YAGNI | ✅ Pass | Chỉ sửa đúng 3 điểm, không thêm abstraction |
| III. UI Test-able | ✅ Pass | Không thay đổi testid nào |
| V. UX Nhất Quán | ✅ Pass | Design token `--color-text-muted` dùng nhất quán |

### Files to Change

| File | Thay đổi |
|------|----------|
| `src/pages/CheckoutPage.module.css` | Giảm `gap` trong `.field`; thêm `::placeholder` rule |
| `src/pages/CheckoutPage.tsx` | Xóa `placeholder` prop trên ward, district, city inputs |
