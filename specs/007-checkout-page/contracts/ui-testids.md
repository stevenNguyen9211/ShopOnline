# UI Contract: Canonical data-testid List

**Feature**: 007-checkout-page | **Date**: 2026-06-29

This is the canonical contract for all `data-testid` attributes on the checkout
and confirmation pages. These are public identifiers — renaming or removing any
of them is a breaking change that MUST be accompanied by a test update in the
same commit (Constitution Principle III).

## Checkout Page (`/checkout`)

### Form Fields

| `data-testid` | Element | Notes |
|---------------|---------|-------|
| `checkout-full-name` | `<input>` | Họ tên người nhận |
| `checkout-email` | `<input>` | Email |
| `checkout-street-address` | `<input>` | Số nhà và đường |
| `checkout-ward` | `<input>` | Phường/xã |
| `checkout-district` | `<input>` | Quận/huyện |
| `checkout-city` | `<input>` | Tỉnh/thành phố |
| `checkout-phone` | `<input>` | Số điện thoại (digits only) |
| `checkout-postal-code` | `<input>` | Mã bưu chính |

### Validation Error Messages

| `data-testid` | Appears when |
|---------------|-------------|
| `checkout-full-name-error` | `fullName` is empty after trim |
| `checkout-email-error` | `email` is empty or invalid format |
| `checkout-street-address-error` | `streetAddress` is empty after trim |
| `checkout-ward-error` | `ward` is empty after trim |
| `checkout-district-error` | `district` is empty after trim |
| `checkout-city-error` | `city` is empty after trim |
| `checkout-phone-error` | `phone` is empty or contains non-digit characters |
| `checkout-postal-code-error` | `postalCode` is empty after trim |

### Order Summary Section

| `data-testid` | Element | Notes |
|---------------|---------|-------|
| `checkout-order-summary` | Container `<div>` | Wraps the product list |
| `checkout-subtotal` | `<span>` | Formatted subtotal (tạm tính) |
| `checkout-shipping-fee` | `<span>` | "Miễn phí" or formatted 30.000 đ |
| `checkout-total` | `<span>` | Formatted total = subtotal + shippingFee |

### Submit Button

| `data-testid` | States |
|---------------|--------|
| `checkout-submit` | Default: "Đặt hàng"; Submitting: "Đang xử lý..." + `disabled` |

## Confirmation Page (`/confirmation`)

| `data-testid` | Element | Notes |
|---------------|---------|-------|
| `checkout-success` | Container `<div>` | Root element of success card |
| `checkout-success-order-id` | `<span>` | Mã đơn hàng, e.g. "ORD-20260629-A3F2" |
| `checkout-success-total` | `<span>` | Formatted total tiền đã thanh toán |

## Renamed from Previous Implementation

These testids were renamed to align with the canonical spec. Old names must not
be used in new tests.

| Old (deprecated) | New (canonical) |
|-----------------|----------------|
| `checkout-fullname` | `checkout-full-name` |
| `checkout-fullname-error` | `checkout-full-name-error` |
| `checkout-postalcode` | `checkout-postal-code` |
| `checkout-postalcode-error` | `checkout-postal-code-error` |
| `confirmation-message` | — (not in canonical list; not a test target) |
| `confirmation-total` | `checkout-success-total` |
