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
