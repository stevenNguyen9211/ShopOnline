# Data Model: Bộ kiểm thử tự động E2E cho SimpleShop

**Date**: 2026-06-13 | **Plan**: [plan.md](plan.md)

Tài liệu này mô tả cấu trúc của các entity trong test suite: Page Object classes,
Playwright fixtures, và constants. Locator lấy từ
[ui-contract.md](../../specs/001-simpleshop-demo/contracts/ui-contract.md).

---

## Page Object Classes

### LoginPage

**File**: `pages/LoginPage.ts`

| Member | Loại | Mô tả |
|--------|------|-------|
| `page` | `Page` (Playwright) | Nhận qua constructor |
| `loginPage` | Locator | `data-testid="login-page"` — assert đang ở trang login |
| `userButton(userId)` | `(string) => Locator` | `data-testid="login-user-{userId}"` |
| `loginAsUser(userId)` | `async (string) => void` | Bấm thẻ user, đợi redirect `/products` |
| `isAt()` | `async () => boolean` | Kiểm tra URL = `/login` |

**User IDs hợp lệ**: `minh`, `lan`, `hung`

---

### ProductsPage

**File**: `pages/ProductsPage.ts`

| Member | Loại | Mô tả |
|--------|------|-------|
| `page` | `Page` | |
| `productsGrid` | Locator | `data-testid="products-grid"` |
| `productCard(productId)` | `(string) => Locator` | `data-testid="product-card-{productId}"` |
| `productName(productId)` | `(string) => Locator` | `.getByTestId('product-name')` scoped trong card |
| `productPrice(productId)` | `(string) => Locator` | `.getByTestId('product-price')` scoped trong card |
| `productImage(productId)` | `(string) => Locator` | `.getByTestId('product-image')` scoped trong card |
| `addToCartButton(productId)` | `(string) => Locator` | `.getByTestId('add-to-cart')` scoped trong card |
| `getProductCount()` | `async () => number` | Đếm số card trong grid |
| `getProductName(productId)` | `async (string) => string` | Lấy text tên sản phẩm |
| `getProductPrice(productId)` | `async (string) => string` | Lấy text giá (đã format VND) |
| `addToCart(productId)` | `async (string) => void` | Bấm nút "Thêm vào giỏ" |
| `isAddToCartDisabled(productId)` | `async (string) => boolean` | Kiểm tra `disabled` attribute |

**Product IDs từ app data**:
```
ban-phim-co | chuot-khong-day | tai-nghe-bluetooth
balo-laptop | binh-giu-nhiet | den-ban-led
```

---

### CartPage

**File**: `pages/CartPage.ts`

| Member | Loại | Mô tả |
|--------|------|-------|
| `page` | `Page` | |
| `cartEmptyMessage` | Locator | `data-testid="cart-empty-message"` |
| `cartTotal` | Locator | `data-testid="cart-total"` |
| `cartCheckoutButton` | Locator | `data-testid="cart-checkout"` |
| `cartItem(productId)` | `(string) => Locator` | `data-testid="cart-item-{productId}"` |
| `itemQuantity(productId)` | `(string) => Locator` | `.getByTestId('cart-item-quantity')` scoped |
| `itemIncrease(productId)` | `(string) => Locator` | `.getByTestId('cart-item-increase')` scoped |
| `itemDecrease(productId)` | `(string) => Locator` | `.getByTestId('cart-item-decrease')` scoped |
| `itemRemove(productId)` | `(string) => Locator` | `.getByTestId('cart-item-remove')` scoped |
| `itemSubtotal(productId)` | `(string) => Locator` | `.getByTestId('cart-item-subtotal')` scoped |
| `getTotal()` | `async () => string` | Lấy text `cart-total` |
| `getQuantity(productId)` | `async (string) => number` | Parse quantity thành số |
| `increaseQuantity(productId)` | `async (string) => void` | Bấm nút "+" |
| `decreaseQuantity(productId)` | `async (string) => void` | Bấm nút "−" |
| `removeItem(productId)` | `async (string) => void` | Bấm nút "Xóa" |
| `goToCheckout()` | `async () => void` | Bấm "Thanh toán" |
| `isCheckoutDisabled()` | `async () => boolean` | Assert `cart-checkout` `disabled` |
| `isEmpty()` | `async () => boolean` | Kiểm tra `cart-empty-message` visible |
| `isIncreaseDisabled(productId)` | `async (string) => boolean` | |
| `isDecreaseDisabled(productId)` | `async (string) => boolean` | |

---

### CheckoutPage

**File**: `pages/CheckoutPage.ts`

| Member | Loại | Mô tả |
|--------|------|-------|
| `page` | `Page` | |
| `fullnameInput` | Locator | `data-testid="checkout-fullname"` |
| `fullnameError` | Locator | `data-testid="checkout-fullname-error"` |
| `postalcodeInput` | Locator | `data-testid="checkout-postalcode"` |
| `postalcodeError` | Locator | `data-testid="checkout-postalcode-error"` |
| `totalText` | Locator | `data-testid="checkout-total"` |
| `submitButton` | Locator | `data-testid="checkout-submit"` |
| `fillFullname(name)` | `async (string) => void` | Clear + fill input họ tên |
| `fillPostalcode(code)` | `async (string) => void` | Clear + fill input mã bưu chính |
| `submit()` | `async () => void` | Bấm "Đặt hàng" |
| `getTotal()` | `async () => string` | Lấy text `checkout-total` |
| `isFullnameErrorVisible()` | `async () => boolean` | |
| `isPostalcodeErrorVisible()` | `async () => boolean` | |
| `getFullnameError()` | `async () => string` | Lấy text lỗi họ tên |
| `getPostalcodeError()` | `async () => string` | Lấy text lỗi mã bưu chính |

---

### ConfirmationPage

**File**: `pages/ConfirmationPage.ts`

| Member | Loại | Mô tả |
|--------|------|-------|
| `page` | `Page` | |
| `confirmationMessage` | Locator | `data-testid="confirmation-message"` |
| `totalText` | Locator | `data-testid="confirmation-total"` |
| `backToProductsLink` | Locator | `data-testid="confirmation-back-to-products"` |
| `getTotal()` | `async () => string` | Lấy text `confirmation-total` |
| `getMessage()` | `async () => string` | Lấy text thông điệp |
| `goBackToProducts()` | `async () => void` | Bấm link về `/products` |
| `isAt()` | `async () => boolean` | Kiểm tra URL = `/confirmation` |

---

## Header Locators

Header không phải page riêng (không có route). Các Page Object cần Header sẽ
expose helper methods dùng các locators này trực tiếp trên `this.page`.

| data-testid | Expose qua | Method đề xuất |
|-------------|-----------|----------------|
| `header-user-name` | ProductsPage, CartPage, CheckoutPage | `getHeaderUsername()` |
| `header-logout` | ProductsPage | `logout()` |
| `header-cart-link` | ProductsPage | `goToCart()` |
| `header-cart-count` | ProductsPage, CartPage | `getCartCount()` |

---

## Fixtures

### fixtures/index.ts — re-export point

**File**: `fixtures/index.ts`

**Mục đích**: Re-export `test` và `expect` từ `@playwright/test`. Tất cả test
file import từ `'../fixtures'` thay vì trực tiếp từ `'@playwright/test'` để
dễ mở rộng sau này nếu cần thêm custom fixture.

> **Ghi chú thiết kế** (cập nhật sau audit 2026-06-13): Thiết kế ban đầu dự
> kiến dùng `loggedIn` fixture qua `test.extend()`. Sau audit quyết định dùng
> `beforeEach` trong từng `test.describe` — đơn giản hơn (YAGNI, Constitution
> II), không cần `test.extend()`, và rõ ràng hơn cho người học. `fixtures/
> index.ts` chỉ làm nhiệm vụ re-export.

**Pattern login chuẩn trong test file**:

```typescript
import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'

// Describe block cho tests CẦN đăng nhập
test.describe('US# — Tests cần đăng nhập', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsUser('minh')
  })
  // tests...
})

// Describe block RIÊNG cho tests không cần đăng nhập hoặc cần giỏ trống
test.describe('US# — Tests không cần login hoặc cần state khác', () => {
  test.beforeEach(async ({ page }) => {
    // beforeEach riêng hoặc không có
  })
  // tests...
})
```

**Teardown**: Playwright tự đóng context sau mỗi test → xóa toàn bộ
localStorage, cookies, session — đảm bảo independence (FR-004).

---

## Constants (dùng trong test files)

Không import từ `src/` (coupling với app internals). Khai báo trong test files
hoặc fixtures khi cần.

```typescript
// Product IDs đại diện dùng trong test
const PRODUCT_IDS = {
  banPhimCo: 'ban-phim-co',        // Bàn phím cơ, 1.200.000 ₫
  chuotKhongDay: 'chuot-khong-day', // Chuột không dây, 450.000 ₫
} as const

// User IDs
const USERS = {
  minh: 'minh',
  lan: 'lan',
  hung: 'hung',
} as const
```
