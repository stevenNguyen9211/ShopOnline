import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'
import { ProductsPage } from '../pages/ProductsPage'

test.describe('US2 — Kiểm chứng hiển thị danh sách sản phẩm', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsUser('minh')
  })

  test('danh sách sản phẩm: đúng 6 card, mỗi card có đủ name/price/image/nút', async ({ page }) => {
    // FR-004
    const productsPage = new ProductsPage(page)
    const count = await productsPage.getProductCount()
    expect(count).toBe(6)
    await expect(productsPage.productName('ban-phim-co')).toBeVisible()
    await expect(productsPage.productPrice('ban-phim-co')).toBeVisible()
    await expect(productsPage.productImage('ban-phim-co')).toBeVisible()
    await expect(productsPage.addToCartButton('ban-phim-co')).toBeVisible()
  })

  test('giá sản phẩm đúng định dạng VND (X.XXX ₫)', async ({ page }) => {
    // FR-004
    const productsPage = new ProductsPage(page)
    const price = await productsPage.getProductPrice('ban-phim-co')
    expect(price).toMatch(/\d{1,3}(\.\d{3})*\s₫/)
  })

  test('ảnh sản phẩm có alt text bằng tên sản phẩm', async ({ page }) => {
    // FR-004
    const productsPage = new ProductsPage(page)
    const productName = await productsPage.getProductName('ban-phim-co')
    const alt = await productsPage.productImage('ban-phim-co').getAttribute('alt')
    expect(alt).toBe(productName)
  })
})
