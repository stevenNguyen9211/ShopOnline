import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'
import { ProductsPage } from '../pages/ProductsPage'
import { CartPage } from '../pages/CartPage'

test.describe('US3 — Kiểm chứng thêm vào giỏ và badge', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsUser('minh')
  })

  test('thêm sản phẩm lần đầu → badge từ 0 lên 1', async ({ page }) => {
    // FR-005, FR-006
    const productsPage = new ProductsPage(page)
    expect(await productsPage.getCartCount()).toBe('0')
    await productsPage.addToCart('ban-phim-co')
    expect(await productsPage.getCartCount()).toBe('1')
  })

  test('thêm lại cùng sản phẩm → badge cộng dồn, không tạo dòng mới', async ({ page }) => {
    // FR-005, FR-006
    const productsPage = new ProductsPage(page)
    await productsPage.addToCart('ban-phim-co')
    await productsPage.addToCart('ban-phim-co')
    expect(await productsPage.getCartCount()).toBe('2')
    await productsPage.goToCart()
    const cartPage = new CartPage(page)
    await expect(cartPage.cartItem('ban-phim-co')).toHaveCount(1)
  })

  test('giỏ hàng giữ nguyên sau khi tải lại trang', async ({ page }) => {
    // FR-009
    const productsPage = new ProductsPage(page)
    await productsPage.addToCart('ban-phim-co')
    await productsPage.addToCart('ban-phim-co')
    await page.reload()
    await page.waitForLoadState('networkidle')
    expect(await productsPage.getCartCount()).toBe('2')
  })

  test('nút Thêm vào giỏ disabled khi sản phẩm đạt 5 trong giỏ', async ({ page }) => {
    // FR-008
    const productsPage = new ProductsPage(page)
    for (let i = 0; i < 5; i++) {
      await productsPage.addToCart('ban-phim-co')
    }
    expect(await productsPage.isAddToCartDisabled('ban-phim-co')).toBe(true)
  })
})
