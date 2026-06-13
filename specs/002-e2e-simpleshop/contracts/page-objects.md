# Page Object API Contract: SimpleShop E2E Test Suite

**Date**: 2026-06-13 | **Plan**: [plan.md](../plan.md)

Đây là hợp đồng công khai giữa Page Object classes (`pages/`) và test files
(`tests/`). **Đổi tên method hay xóa locator là breaking change** — phải cập
nhật test files liên quan trong cùng một thay đổi.

Mọi locator trong Page Objects phải lấy từ
[ui-contract.md](../../../specs/001-simpleshop-demo/contracts/ui-contract.md).

---

## LoginPage

**Import**: `import { LoginPage } from '../pages/LoginPage'`

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `loginAsUser` | `(userId: string) => Promise<void>` | Bấm `login-user-{userId}`, đợi URL = `/products` |
| `isAt` | `() => Promise<boolean>` | Trả `true` khi URL = `/login` |

### Usage

```typescript
const loginPage = new LoginPage(page)
await loginPage.loginAsUser('minh')  // đăng nhập với user Minh
```

---

## ProductsPage

**Import**: `import { ProductsPage } from '../pages/ProductsPage'`

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `getProductCount` | `() => Promise<number>` | Số lượng product card trong grid |
| `getProductName` | `(productId: string) => Promise<string>` | Text tên sản phẩm |
| `getProductPrice` | `(productId: string) => Promise<string>` | Text giá VND (vd: "1.200.000 ₫") |
| `addToCart` | `(productId: string) => Promise<void>` | Bấm nút "Thêm vào giỏ" |
| `isAddToCartDisabled` | `(productId: string) => Promise<boolean>` | `true` khi quantity = 5 |
| `getCartCount` | `() => Promise<string>` | Text badge `header-cart-count` |
| `goToCart` | `() => Promise<void>` | Bấm `header-cart-link` |
| `logout` | `() => Promise<void>` | Bấm `header-logout`, đợi URL = `/login` |
| `getHeaderUsername` | `() => Promise<string>` | Text `header-user-name` |

### Usage

```typescript
const productsPage = new ProductsPage(page)
await productsPage.addToCart('ban-phim-co')
const count = await productsPage.getCartCount()  // "1"
```

---

## CartPage

**Import**: `import { CartPage } from '../pages/CartPage'`

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `getTotal` | `() => Promise<string>` | Text `cart-total` (vd: "1.200.000 ₫") |
| `getQuantity` | `(productId: string) => Promise<number>` | Số lượng đã parse |
| `increaseQuantity` | `(productId: string) => Promise<void>` | Bấm "+" |
| `decreaseQuantity` | `(productId: string) => Promise<void>` | Bấm "−" |
| `removeItem` | `(productId: string) => Promise<void>` | Bấm "Xóa" |
| `goToCheckout` | `() => Promise<void>` | Bấm "Thanh toán" |
| `isCheckoutDisabled` | `() => Promise<boolean>` | `true` khi giỏ trống |
| `isEmpty` | `() => Promise<boolean>` | `true` khi `cart-empty-message` visible |
| `isIncreaseDisabled` | `(productId: string) => Promise<boolean>` | `true` khi qty = 5 |
| `isDecreaseDisabled` | `(productId: string) => Promise<boolean>` | `true` khi qty = 1 |
| `getCartCount` | `() => Promise<string>` | Text `header-cart-count` |

### Usage

```typescript
const cartPage = new CartPage(page)
await cartPage.increaseQuantity('ban-phim-co')
const qty = await cartPage.getQuantity('ban-phim-co')  // 2
```

---

## CheckoutPage

**Import**: `import { CheckoutPage } from '../pages/CheckoutPage'`

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `fillFullname` | `(name: string) => Promise<void>` | Điền trường họ tên |
| `fillPostalcode` | `(code: string) => Promise<void>` | Điền trường mã bưu chính |
| `submit` | `() => Promise<void>` | Bấm "Đặt hàng" |
| `getTotal` | `() => Promise<string>` | Text `checkout-total` |
| `isFullnameErrorVisible` | `() => Promise<boolean>` | Lỗi họ tên có hiển thị không |
| `isPostalcodeErrorVisible` | `() => Promise<boolean>` | Lỗi mã bưu chính có hiển thị không |
| `getFullnameError` | `() => Promise<string>` | Text thông báo lỗi họ tên |
| `getPostalcodeError` | `() => Promise<string>` | Text thông báo lỗi mã bưu chính |

### Usage

```typescript
const checkoutPage = new CheckoutPage(page)
await checkoutPage.submit()  // submit trống → validation errors
const errorVisible = await checkoutPage.isFullnameErrorVisible()  // true
```

---

## ConfirmationPage

**Import**: `import { ConfirmationPage } from '../pages/ConfirmationPage'`

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `getTotal` | `() => Promise<string>` | Text `confirmation-total` |
| `getMessage` | `() => Promise<string>` | Text `confirmation-message` |
| `goBackToProducts` | `() => Promise<void>` | Bấm `confirmation-back-to-products` |
| `isAt` | `() => Promise<boolean>` | `true` khi URL = `/confirmation` |

### Usage

```typescript
const confirmationPage = new ConfirmationPage(page)
const total = await confirmationPage.getTotal()  // khớp với cart-total trước đó
```

---

## fixtures/index.ts

**Import**: `import { test, expect } from '../fixtures'`

Re-export `test` và `expect` từ `@playwright/test`. Test files sử dụng import
này thay vì import trực tiếp từ `@playwright/test` để sử dụng extended fixtures.

```typescript
// Dùng trong test file
import { test, expect } from '../fixtures'

test.describe('US1 - Login', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.loginAsUser('minh')
  })

  test('happy path: đăng nhập hợp lệ', async ({ page }) => {
    // FR-001: user đã ở /products
    await expect(page).toHaveURL('/products')
  })
})
```

---

## Quy tắc bắt buộc

1. **Test files KHÔNG được** khai báo locator trực tiếp (không `getByTestId`,
   `locator` inline trong test). Mọi locator phải qua method của Page Object.
2. **Page Objects KHÔNG được** import lẫn nhau (không `LoginPage` import `CartPage`).
3. **Locator chỉ dùng** `getByTestId(...)` hoặc accessible role/label
   (không class CSS, không XPath, không `nth-child`).
4. **Mỗi test** phải ghi FR code trong tên test hoặc comment (`// FR-001`).
