# Research: Trang Đặt Hàng (Checkout)

**Feature**: 007-checkout-page | **Date**: 2026-06-29

## Decision 1: Order ID Generation

**Decision**: Client-side format `ORD-YYYYMMDD-XXXX` — timestamp ngày (8 chữ số)
+ 4 ký tự ngẫu nhiên từ bộ `A-Z0-9`.

**Rationale**: Đã được xác nhận trong clarification session (Q1). Dễ đọc, duy
nhất đủ trong phạm vi một session demo, không cần server hay UUID library. Phù
hợp Nguyên tắc II (đơn giản).

**Alternatives considered**:
- UUID v4: đủ unique hơn nhưng khó đọc và không cần thiết cho demo
- Counter (1001, 1002...): reset khi reload — không trông như order ID thật

**Implementation**: Hàm thuần `generateOrderId()` trong `src/lib/order.ts`,
không có side effect.

---

## Decision 2: Shipping Fee Logic

**Decision**: Ngưỡng miễn phí vận chuyển = 500.000 đ; phí cố định = 30.000 đ.
Tính dựa trên `subtotal` (trước shipping).

**Rationale**: Xác nhận trong clarification session (Q2). Là hằng số được export
để test có thể import và kiểm chứng logic.

**Implementation**: Hàm thuần `calculateShipping(subtotal: number): number` +
constants `FREE_SHIPPING_THRESHOLD = 500_000` và `FLAT_SHIPPING_FEE = 30_000`
trong `src/lib/order.ts`.

---

## Decision 3: Form State Management

**Decision**: `useState` trong `CheckoutPage.tsx` — một state per field, giống
pattern hiện tại.

**Rationale**: 8 fields là số lượng manageable; không cần form library (Nguyên
tắc II). Pattern này đã được dùng trong LoginPage và CheckoutPage cũ — nhất quán.

**Alternatives considered**:
- React Hook Form / Formik: quá phức tạp cho demo, vi phạm Nguyên tắc II
- Single object state: đơn giản hơn nhưng ít minh bạch hơn khi đọc code

---

## Decision 4: Order Summary Location

**Decision**: Order summary (danh sách sản phẩm + tạm tính + shipping + total)
hiển thị trên cùng trang checkout, phía trên form thông tin nhận hàng.

**Rationale**: User cần thấy họ đang mua gì trước khi điền thông tin — đây là
UX chuẩn của checkout e-commerce. Không cần trang riêng hay modal.

**Data source**: CartContext (`items`, `total`) + `products` array từ
`src/data/products.ts`.

---

## Decision 5: Order Data Passing to Confirmation Page

**Decision**: Truyền `Order` object qua `react-router` location state
(`navigate('/confirmation', { state: { order } })`). Không lưu localStorage.

**Rationale**: Đơn hàng là transient data — chỉ cần hiển thị một lần trên trang
xác nhận rồi done. Router state là đủ và đơn giản nhất. Nếu user reload
ConfirmationPage, `order` sẽ là `null` → redirect về `/products` (behavior hiện
tại đã đúng).

---

## Decision 6: data-testid Renaming

**Decision**: Rename `checkout-fullname` → `checkout-full-name` và
`checkout-postalcode` → `checkout-postal-code` để align với spec canonical list.

**Rationale**: Constitution Principle III: data-testid là hợp đồng công khai.
Spec đã xác định canonical names. Renaming và cập nhật tests trong cùng một PR
là đúng theo quy tắc "PHẢI cập nhật test tương ứng trong cùng một thay đổi".

**Affected files**: `CheckoutPage.tsx`, `pages/CheckoutPage.ts`,
`tests/us5-checkout.spec.ts`.

---

## Decision 7: Submit Loading State

**Decision**: Nút "Đặt hàng" chuyển sang text "Đang xử lý..." và `disabled=true`
ngay khi click, cho đến khi `navigate()` được gọi.

**Rationale**: Xác nhận trong clarification session (Q4). Dùng `useState`
boolean `isSubmitting` thay vì `useRef` — cần re-render để hiển thị text mới.

**Implementation**: `const [isSubmitting, setIsSubmitting] = useState(false)`.
Trong `handleSubmit`: set true → clear cart → navigate. Nút nhận
`disabled={isSubmitting}` và text conditional.

---

## Decision 8: CheckoutPage Layout Structure

**Decision**: Hai section trong `<main>`: (1) "Tóm tắt đơn hàng" với product
list + subtotal + shipping + total; (2) "Thông tin nhận hàng" với 8 input fields.
Single-column layout (mobile-first), consistent với CartPage.

**Rationale**: Đơn giản nhất; không cần grid library; responsive tự nhiên.
