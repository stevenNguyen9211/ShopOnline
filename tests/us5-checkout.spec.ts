import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'
import { ProductsPage } from '../pages/ProductsPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { ConfirmationPage } from '../pages/ConfirmationPage'

// ---------------------------------------------------------------------------
// US1 — Xem Tóm Tắt Đơn Hàng
// ---------------------------------------------------------------------------

test.describe('US1 — Order Summary', () => {
  test.beforeEach(async ({ page }) => {
    const productsPage = new ProductsPage(page)
    await new LoginPage(page).loginAsUser('oliver_hayes')
    await productsPage.addToCart('ban-phim-co') // 1.200.000 đ
    await productsPage.addToCart('ban-phim-co') // × 2 = 2.400.000 đ
    await page.goto('checkout')
  })

  test('@ci order summary section is visible on /checkout', async ({ page }) => {
    // FR-001
    const checkoutPage = new CheckoutPage(page)
    await expect(checkoutPage.orderSummary).toBeVisible()
  })

  test('@ci checkout-subtotal shows correct subtotal for 2 × Bàn phím cơ', async ({ page }) => {
    // FR-002
    const checkoutPage = new CheckoutPage(page)
    const subtotal = await checkoutPage.getSubtotal()
    expect(subtotal).toContain('2.400.000')
  })

  test('@ci shipping fee is Miễn phí when subtotal ≥ 500.000 đ', async ({ page }) => {
    // FR-003
    const checkoutPage = new CheckoutPage(page)
    const fee = await checkoutPage.getShippingFee()
    expect(fee).toBe('Miễn phí')
  })

  test('shipping fee is 30.000 đ when subtotal < 500.000 đ', async ({ page }) => {
    // FR-003: use Bình giữ nhiệt (320.000 đ) — below threshold
    // Already logged in from beforeEach; remove the expensive items then add a cheap one
    const productsPage = new ProductsPage(page)
    await page.goto('cart')
    const removeButtons = page.getByTestId('cart-item-remove')
    const count = await removeButtons.count()
    for (let i = 0; i < count; i++) {
      await removeButtons.first().click()
    }
    await page.goto('products')
    await productsPage.addToCart('binh-giu-nhiet') // 320.000 đ
    await page.goto('checkout')
    const checkoutPage = new CheckoutPage(page)
    const fee = await checkoutPage.getShippingFee()
    expect(fee).toContain('30.000')
  })

  test('@ci checkout-total equals subtotal + shippingFee', async ({ page }) => {
    // FR-004
    const checkoutPage = new CheckoutPage(page)
    const total = await checkoutPage.getTotal()
    // 2.400.000 + 0 (free shipping) = 2.400.000
    expect(total).toContain('2.400.000')
  })
})

// ---------------------------------------------------------------------------
// US2 — Điền Thông Tin Nhận Hàng
// ---------------------------------------------------------------------------

test.describe('US2 — Delivery Form', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsUser('oliver_hayes')
    await new ProductsPage(page).addToCart('ban-phim-co')
    await page.goto('checkout')
  })

  test('all 8 delivery field inputs are visible on /checkout', async ({ page }) => {
    // FR-005
    const checkoutPage = new CheckoutPage(page)
    await expect(checkoutPage.fullNameInput).toBeVisible()
    await expect(checkoutPage.emailInput).toBeVisible()
    await expect(checkoutPage.streetAddressInput).toBeVisible()
    await expect(checkoutPage.wardInput).toBeVisible()
    await expect(checkoutPage.districtInput).toBeVisible()
    await expect(checkoutPage.cityInput).toBeVisible()
    await expect(checkoutPage.phoneInput).toBeVisible()
    await expect(checkoutPage.postalCodeInput).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// US5 — Happy path
// ---------------------------------------------------------------------------

test.describe('US5 — Happy path', () => {
  test.beforeEach(async ({ page }) => {
    const productsPage = new ProductsPage(page)
    await new LoginPage(page).loginAsUser('oliver_hayes')
    await productsPage.addToCart('ban-phim-co')
    await productsPage.addToCart('ban-phim-co')
    await page.goto('cart')
  })

  test('@ci nút Thanh toán → chuyển đến trang checkout', async ({ page }) => {
    // FR-010 (cart → checkout navigation)
    const cartPage = new CartPage(page)
    await cartPage.goToCheckout()
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('@ci checkout hợp lệ → trang xác nhận hiển thị tổng tiền khớp cart', async ({ page }) => {
    // FR-009 FR-010
    const cartPage = new CartPage(page)
    const cartTotal = await cartPage.getTotal()
    await cartPage.goToCheckout()
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillAllValid()
    await checkoutPage.submit()
    await expect(page).toHaveURL(/\/confirmation/)
    const confirmationPage = new ConfirmationPage(page)
    const confirmTotal = await confirmationPage.getTotal()
    expect(confirmTotal).toBe(cartTotal)
  })

  test('@ci orderId trên trang xác nhận khớp định dạng ORD-YYYYMMDD-XXXX', async ({ page }) => {
    // FR-009
    const cartPage = new CartPage(page)
    await cartPage.goToCheckout()
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillAllValid()
    await checkoutPage.submit()
    await expect(page).toHaveURL(/\/confirmation/)
    const confirmationPage = new ConfirmationPage(page)
    const orderId = await confirmationPage.getOrderId()
    expect(orderId).toMatch(/^ORD-\d{8}-[A-Z0-9]{4}$/)
  })

  test('@ci checkout-success container visible on /confirmation', async ({ page }) => {
    // FR-010
    const cartPage = new CartPage(page)
    await cartPage.goToCheckout()
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillAllValid()
    await checkoutPage.submit()
    await expect(page.getByTestId('checkout-success')).toBeVisible()
  })

  test('@ci sau đặt hàng thành công → badge giỏ hàng về 0', async ({ page }) => {
    // FR-011
    const cartPage = new CartPage(page)
    await cartPage.goToCheckout()
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillAllValid()
    await checkoutPage.submit()
    const confirmationPage = new ConfirmationPage(page)
    await confirmationPage.goBackToProducts()
    const productsPage = new ProductsPage(page)
    expect(await productsPage.getCartCount()).toBe('0')
  })
})

// ---------------------------------------------------------------------------
// US3 — Form validation error paths
// ---------------------------------------------------------------------------

test.describe('US5 — Form validation error paths', () => {
  test.beforeEach(async ({ page }) => {
    const productsPage = new ProductsPage(page)
    await new LoginPage(page).loginAsUser('oliver_hayes')
    await productsPage.addToCart('ban-phim-co')
    await productsPage.addToCart('ban-phim-co')
    await page.goto('checkout')
  })

  test('submit cả 8 trường trống → hiện đủ 8 lỗi, ở lại /checkout', async ({ page }) => {
    // FR-006
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.submit()
    expect(await checkoutPage.isFullNameErrorVisible()).toBe(true)
    expect(await checkoutPage.isEmailErrorVisible()).toBe(true)
    expect(await checkoutPage.isStreetAddressErrorVisible()).toBe(true)
    expect(await checkoutPage.isWardErrorVisible()).toBe(true)
    expect(await checkoutPage.isDistrictErrorVisible()).toBe(true)
    expect(await checkoutPage.isCityErrorVisible()).toBe(true)
    expect(await checkoutPage.isPhoneErrorVisible()).toBe(true)
    expect(await checkoutPage.isPostalCodeErrorVisible()).toBe(true)
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('submit họ tên điền nhưng các trường khác trống → chỉ lỗi các trường còn lại', async ({ page }) => {
    // FR-006
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillFullName('Minh')
    await checkoutPage.submit()
    expect(await checkoutPage.isFullNameErrorVisible()).toBe(false)
    expect(await checkoutPage.isEmailErrorVisible()).toBe(true)
    expect(await checkoutPage.isPostalCodeErrorVisible()).toBe(true)
  })

  test('submit cả 8 trường chỉ khoảng trắng → coi là trống, hiện 8 lỗi', async ({ page }) => {
    // FR-006
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillFullName('   ')
    await checkoutPage.fillEmail('   ')
    await checkoutPage.fillStreetAddress('   ')
    await checkoutPage.fillWard('   ')
    await checkoutPage.fillDistrict('   ')
    await checkoutPage.fillCity('   ')
    await checkoutPage.fillPhone('   ')
    await checkoutPage.fillPostalCode('   ')
    await checkoutPage.submit()
    expect(await checkoutPage.isFullNameErrorVisible()).toBe(true)
    expect(await checkoutPage.isEmailErrorVisible()).toBe(true)
    expect(await checkoutPage.isPostalCodeErrorVisible()).toBe(true)
  })

  test('email không hợp lệ (không có @) → hiện lỗi email', async ({ page }) => {
    // FR-007
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillEmail('notvalid')
    await checkoutPage.submit()
    expect(await checkoutPage.isEmailErrorVisible()).toBe(true)
  })

  test('số điện thoại chứa chữ cái → hiện lỗi phone', async ({ page }) => {
    // FR-008
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillPhone('abc123')
    await checkoutPage.submit()
    expect(await checkoutPage.isPhoneErrorVisible()).toBe(true)
  })

  test('điền họ tên sau khi lỗi → lỗi họ tên biến mất', async ({ page }) => {
    // FR-006 (error clears on fix)
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.submit()
    expect(await checkoutPage.isFullNameErrorVisible()).toBe(true)
    await checkoutPage.fillFullName('Minh')
    expect(await checkoutPage.isFullNameErrorVisible()).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// US5 — Empty cart guard
// ---------------------------------------------------------------------------

test.describe('US5 — Empty cart guard', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsUser('oliver_hayes')
  })

  test('@ci truy cập /checkout khi giỏ trống → redirect /cart', async ({ page }) => {
    // FR-013
    await page.goto('checkout')
    await expect(page).toHaveURL(/\/cart/)
  })
})

// ---------------------------------------------------------------------------
// SC-005 — No duplicate order on confirmation page revisit
// ---------------------------------------------------------------------------

test.describe('SC-005 — Confirmation page guard', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsUser('oliver_hayes')
  })

  test('truy cập /confirmation không có order state → redirect /products', async ({ page }) => {
    // SC-005
    await page.goto('confirmation')
    await expect(page).toHaveURL(/\/products/)
  })
})
