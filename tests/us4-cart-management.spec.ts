import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'
import { ProductsPage } from '../pages/ProductsPage'
import { CartPage } from '../pages/CartPage'

test.describe('US4 — Giỏ có hàng', () => {
  test.beforeEach(async ({ page }) => {
    const productsPage = new ProductsPage(page)
    await new LoginPage(page).loginAsUser('minh')
    await productsPage.addToCart('ban-phim-co')
    await productsPage.addToCart('ban-phim-co')
    await page.goto('cart')
  })

  test('@ci hiển thị đúng tên, giá đơn vị, số lượng, thành tiền, tổng', async ({ page }) => {
    // FR-007
    const cartPage = new CartPage(page)
    expect(await cartPage.getQuantity('ban-phim-co')).toBe(2)
    await expect(cartPage.cartItem('ban-phim-co').getByTestId('cart-item-unit-price')).toBeVisible()
    await expect(cartPage.cartItem('ban-phim-co').getByTestId('cart-item-subtotal')).toBeVisible()
    const total = await cartPage.getTotal()
    expect(total).toMatch(/\d{1,3}(\.\d{3})*\s₫/)
  })

  test('tăng số lượng → qty+1, badge cập nhật', async ({ page }) => {
    // FR-007, FR-008
    const cartPage = new CartPage(page)
    await cartPage.increaseQuantity('ban-phim-co')
    expect(await cartPage.getQuantity('ban-phim-co')).toBe(3)
    expect(await cartPage.getCartCount()).toBe('3')
  })

  test('giảm số lượng → qty-1, tổng cập nhật', async ({ page }) => {
    // FR-008
    const cartPage = new CartPage(page)
    await cartPage.decreaseQuantity('ban-phim-co')
    expect(await cartPage.getQuantity('ban-phim-co')).toBe(1)
    const total = await cartPage.getTotal()
    expect(total).toMatch(/\d{1,3}(\.\d{3})*\s₫/)
  })

  test('nút giảm disabled khi số lượng = 1', async ({ page }) => {
    // FR-008
    const cartPage = new CartPage(page)
    await cartPage.decreaseQuantity('ban-phim-co')
    expect(await cartPage.getQuantity('ban-phim-co')).toBe(1)
    expect(await cartPage.isDecreaseDisabled('ban-phim-co')).toBe(true)
  })

  test('nút tăng disabled khi số lượng = 5', async ({ page }) => {
    // FR-008
    const cartPage = new CartPage(page)
    await cartPage.increaseQuantity('ban-phim-co')
    await cartPage.increaseQuantity('ban-phim-co')
    await cartPage.increaseQuantity('ban-phim-co')
    expect(await cartPage.getQuantity('ban-phim-co')).toBe(5)
    expect(await cartPage.isIncreaseDisabled('ban-phim-co')).toBe(true)
  })

  test('xóa mặt hàng → dòng biến mất, badge cập nhật', async ({ page }) => {
    // FR-007, FR-008
    const productsPage = new ProductsPage(page)
    const cartPage = new CartPage(page)
    await page.goto('products')
    await productsPage.addToCart('chuot-khong-day')
    await page.goto('cart')
    await cartPage.removeItem('ban-phim-co')
    await expect(cartPage.cartItem('ban-phim-co')).not.toBeVisible()
    expect(await cartPage.getCartCount()).toBe('1')
  })
})

test.describe('US4 — Giỏ trống', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsUser('minh')
    await page.goto('cart')
  })

  test('giỏ trống: hiện thông báo giỏ trống, nút Thanh toán disabled', async ({ page }) => {
    // FR-010
    const cartPage = new CartPage(page)
    expect(await cartPage.isEmpty()).toBe(true)
    expect(await cartPage.isCheckoutDisabled()).toBe(true)
  })
})
