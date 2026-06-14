import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'
import { ProductsPage } from '../pages/ProductsPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { ConfirmationPage } from '../pages/ConfirmationPage'

test.describe('US5 — Happy path', () => {
  test.beforeEach(async ({ page }) => {
    const productsPage = new ProductsPage(page)
    await new LoginPage(page).loginAsUser('oliver_hayes')
    await productsPage.addToCart('ban-phim-co')
    await productsPage.addToCart('ban-phim-co')
    await page.goto('cart')
  })

  test('@ci nút Thanh toán → chuyển đến trang checkout', async ({ page }) => {
    // FR-010
    const cartPage = new CartPage(page)
    await cartPage.goToCheckout()
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('@ci checkout hợp lệ → trang xác nhận hiển thị tổng tiền khớp cart', async ({ page }) => {
    // FR-012
    const cartPage = new CartPage(page)
    const cartTotal = await cartPage.getTotal()
    await cartPage.goToCheckout()
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillFullname('Minh Nguyen')
    await checkoutPage.fillPostalcode('70000')
    await checkoutPage.submit()
    await expect(page).toHaveURL(/\/confirmation/)
    const confirmationPage = new ConfirmationPage(page)
    const confirmTotal = await confirmationPage.getTotal()
    expect(confirmTotal).toBe(cartTotal)
  })

  test('@ci sau đặt hàng thành công → badge giỏ hàng về 0', async ({ page }) => {
    // FR-012
    const cartPage = new CartPage(page)
    await cartPage.goToCheckout()
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillFullname('Minh Nguyen')
    await checkoutPage.fillPostalcode('70000')
    await checkoutPage.submit()
    const confirmationPage = new ConfirmationPage(page)
    await confirmationPage.goBackToProducts()
    const productsPage = new ProductsPage(page)
    expect(await productsPage.getCartCount()).toBe('0')
  })
})

test.describe('US5 — Form validation error paths', () => {
  test.beforeEach(async ({ page }) => {
    const productsPage = new ProductsPage(page)
    await new LoginPage(page).loginAsUser('oliver_hayes')
    await productsPage.addToCart('ban-phim-co')
    await productsPage.addToCart('ban-phim-co')
    await page.goto('checkout')
  })

  test('submit cả 2 trường trống → hiện đủ 2 lỗi, ở lại /checkout', async ({ page }) => {
    // FR-011
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.submit()
    expect(await checkoutPage.isFullnameErrorVisible()).toBe(true)
    expect(await checkoutPage.isPostalcodeErrorVisible()).toBe(true)
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('submit họ tên điền nhưng postal trống → chỉ lỗi postal', async ({ page }) => {
    // FR-011
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillFullname('Minh')
    await checkoutPage.submit()
    expect(await checkoutPage.isFullnameErrorVisible()).toBe(false)
    expect(await checkoutPage.isPostalcodeErrorVisible()).toBe(true)
  })

  test('submit cả 2 trường chỉ khoảng trắng → coi là trống, hiện 2 lỗi', async ({ page }) => {
    // FR-011
    const checkoutPage = new CheckoutPage(page)
    await checkoutPage.fillFullname('   ')
    await checkoutPage.fillPostalcode('   ')
    await checkoutPage.submit()
    expect(await checkoutPage.isFullnameErrorVisible()).toBe(true)
    expect(await checkoutPage.isPostalcodeErrorVisible()).toBe(true)
  })
})

test.describe('US5 — Empty cart guard', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsUser('oliver_hayes')
  })

  test('truy cập /checkout khi giỏ trống → redirect /cart', async ({ page }) => {
    // FR-010
    await page.goto('checkout')
    await expect(page).toHaveURL(/\/cart/)
  })
})
