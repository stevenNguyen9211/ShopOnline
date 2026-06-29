# Quickstart Validation Guide: Trang Đặt Hàng (Checkout)

**Feature**: 007-checkout-page | **Date**: 2026-06-29

## Prerequisites

1. Node.js installed, dependencies installed: `npm install`
2. App running locally: `npm run dev` (starts at `http://localhost:5173`)
3. Playwright installed: `npx playwright install chromium`
4. A test user exists in Supabase (e.g., `oliver_hayes`) — used by existing E2E fixtures

## Scenario 1: Happy Path — Full Checkout Flow (FR-001 → FR-011, FR-014)

**Goal**: Verify the complete checkout flow from cart to confirmation.

**Steps**:
1. Log in as a test user (e.g., `oliver_hayes`)
2. Add at least one product to cart (e.g., "Bàn phím cơ" — price 1.200.000 đ)
3. Navigate to `/cart` → click "Thanh toán" (`data-testid="cart-checkout"`)
4. On `/checkout`:
   - Verify order summary is visible (`data-testid="checkout-order-summary"`)
   - Verify subtotal matches cart total (`data-testid="checkout-subtotal"`)
   - Verify shipping fee shows "Miễn phí" for 1.200.000 đ > 500.000 đ threshold
     (`data-testid="checkout-shipping-fee"`)
   - Verify total = subtotal + 0 (`data-testid="checkout-total"`)
   - Fill all 8 fields with valid data:
     - `checkout-full-name` → "Nguyễn Văn A"
     - `checkout-email` → "test@example.com"
     - `checkout-street-address` → "123 Đường Láng"
     - `checkout-ward` → "Láng Thượng"
     - `checkout-district` → "Đống Đa"
     - `checkout-city` → "Hà Nội"
     - `checkout-phone` → "0912345678"
     - `checkout-postal-code` → "10000"
   - Click `checkout-submit` — button should briefly show "Đang xử lý..."
5. On `/confirmation`:
   - Verify `checkout-success` container is visible
   - Verify `checkout-success-order-id` starts with "ORD-" and has format ORD-YYYYMMDD-XXXX
   - Verify `checkout-success-total` matches the total from checkout page
6. Navigate back to `/cart` — verify cart is empty

**Expected outcome**: ✅ User lands on confirmation page with valid order ID and correct total. Cart is empty.

---

## Scenario 2: Shipping Fee Logic (FR-003)

**Goal**: Verify free vs. paid shipping threshold.

**Steps**:
1. Add only "Bình giữ nhiệt" (320.000 đ) to cart → go to checkout
2. Verify `checkout-shipping-fee` shows 30.000 đ (not free — below 500.000 đ)
3. Also add "Balo laptop" (650.000 đ, total 970.000 đ) → go to checkout
4. Verify `checkout-shipping-fee` shows "Miễn phí"

**Expected outcome**: ✅ Shipping fee toggles correctly at 500.000 đ threshold.

---

## Scenario 3: Validation — All Fields Required (FR-006)

**Goal**: Verify no field can be left blank.

**Steps**:
1. Navigate to `/checkout` with items in cart
2. Click `checkout-submit` without filling any field
3. Verify ALL 8 error testids are visible:
   `checkout-full-name-error`, `checkout-email-error`, `checkout-street-address-error`,
   `checkout-ward-error`, `checkout-district-error`, `checkout-city-error`,
   `checkout-phone-error`, `checkout-postal-code-error`
4. Page should remain at `/checkout`

**Expected outcome**: ✅ All 8 error messages shown simultaneously.

---

## Scenario 4: Validation — Field-Specific Errors Clear on Fix (FR-006)

**Steps**:
1. Submit empty form → see all 8 errors
2. Fill `checkout-full-name` with "Test User"
3. Verify `checkout-full-name-error` disappears (trigger on field change or re-submit)
4. Other errors remain

**Expected outcome**: ✅ Error for a field clears when that field is filled.

---

## Scenario 5: Email Format Validation (FR-007)

**Steps**:
1. Fill `checkout-email` with "notanemail" (no `@`)
2. Click `checkout-submit`
3. Verify `checkout-email-error` is visible

**Expected outcome**: ✅ Invalid email format blocked.

---

## Scenario 6: Phone Digits-Only Validation (FR-008)

**Steps**:
1. Fill `checkout-phone` with "abc123"
2. Click `checkout-submit`
3. Verify `checkout-phone-error` is visible

**Expected outcome**: ✅ Non-digit phone number blocked.

---

## Scenario 7: Empty Cart Guard (FR-013)

**Steps**:
1. Ensure cart is empty (no items)
2. Navigate directly to `/checkout`
3. Verify automatic redirect to `/cart`

**Expected outcome**: ✅ User cannot reach checkout with empty cart.

---

## Run E2E Tests

```bash
# Run all checkout tests
npx playwright test tests/us5-checkout.spec.ts

# Run CI-tagged tests only
npx playwright test tests/us5-checkout.spec.ts --grep @ci

# Run with UI for debugging
npx playwright test tests/us5-checkout.spec.ts --ui
```

## Reference

- Canonical data-testid list: [contracts/ui-testids.md](contracts/ui-testids.md)
- Data model: [data-model.md](data-model.md)
- Spec: [spec.md](spec.md)
