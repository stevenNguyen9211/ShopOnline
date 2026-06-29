# Data Model: Trang Đặt Hàng (Checkout)

**Feature**: 007-checkout-page | **Date**: 2026-06-29

## Entities

### Order

Đại diện cho một đơn đặt hàng đã được xác nhận. Được tạo ra client-side khi
người dùng submit form hợp lệ; truyền qua router location state đến
ConfirmationPage; không lưu localStorage sau khi cart cleared.

```typescript
type Order = {
  orderId: string         // format: "ORD-YYYYMMDD-XXXX", e.g. "ORD-20260629-A3F2"
  fullName: string        // họ tên người nhận, required, non-empty after trim
  email: string           // email, required, must contain "@" and domain part
  streetAddress: string   // số nhà và đường, required, non-empty after trim
  ward: string            // phường/xã, required, non-empty after trim
  district: string        // quận/huyện, required, non-empty after trim
  city: string            // tỉnh/thành phố, required, non-empty after trim
  phone: string           // số điện thoại, required, digits only
  postalCode: string      // mã bưu chính, required, non-empty after trim
  subtotal: number        // tạm tính (VND), = sum(price × quantity) for all items
  shippingFee: number     // phí vận chuyển (VND): 0 if subtotal >= 500_000, else 30_000
  total: number           // tổng tiền (VND), = subtotal + shippingFee
}
```

**Validation rules**:
- `fullName`, `streetAddress`, `ward`, `district`, `city`, `postalCode`: phải
  non-empty sau khi trim
- `email`: phải chứa `@` và có ít nhất một ký tự trước và sau `@`
- `phone`: phải chỉ chứa chữ số (`/^\d+$/`), non-empty
- `orderId`: tạo tự động, không validate từ user input

**State transitions**:
```
[Cart has items] → User fills form → [Form validated] → [Order created]
                                         ↓ invalid
                                    [Error messages shown per field]
```

---

### OrderSummary (computed, not stored)

Được tính trực tiếp từ CartContext tại render time — không phải entity riêng
biệt trong storage.

```typescript
// Computed values derived from CartContext + products data
const subtotal: number   // cart.total từ CartContext
const shippingFee: number = calculateShipping(subtotal)
const total: number = subtotal + shippingFee
```

---

### DeliveryInfo (form state, not stored independently)

Form state trong CheckoutPage — 8 fields, mỗi field có error state tương ứng:

```typescript
// React state within CheckoutPage component
const [fullName, setFullName] = useState('')
const [email, setEmail] = useState('')
const [streetAddress, setStreetAddress] = useState('')
const [ward, setWard] = useState('')
const [district, setDistrict] = useState('')
const [city, setCity] = useState('')
const [phone, setPhone] = useState('')
const [postalCode, setPostalCode] = useState('')

// Error state (one per field)
const [fullNameError, setFullNameError] = useState('')
const [emailError, setEmailError] = useState('')
const [streetAddressError, setStreetAddressError] = useState('')
const [wardError, setWardError] = useState('')
const [districtError, setDistrictError] = useState('')
const [cityError, setCityError] = useState('')
const [phoneError, setPhoneError] = useState('')
const [postalCodeError, setPostalCodeError] = useState('')
```

---

## Utility Functions (src/lib/order.ts)

```typescript
export const FREE_SHIPPING_THRESHOLD = 500_000  // VND
export const FLAT_SHIPPING_FEE = 30_000          // VND

// Returns 0 (free) or FLAT_SHIPPING_FEE based on subtotal
export function calculateShipping(subtotal: number): number

// Generates "ORD-YYYYMMDD-XXXX" where XXXX is 4 random chars from [A-Z0-9]
export function generateOrderId(): string
```

---

## Existing Entities (unchanged)

### CartItem (src/context/CartContext.tsx)

```typescript
type CartItem = {
  productId: string
  quantity: number
}
```

### Product (src/data/products.ts)

```typescript
type Product = {
  id: string
  name: string
  price: number   // VND
  image: string
}
```

CartContext `total` = `sum(product.price × item.quantity)` for all items.
This value becomes `Order.subtotal`.
