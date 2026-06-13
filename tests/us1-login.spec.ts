import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'
import { ProductsPage } from '../pages/ProductsPage'

test.describe('US1 — Kiểm chứng đăng nhập và bảo vệ trang', () => {
  test('hiển thị đúng 3 thẻ user trên trang login', async ({ page }) => {
    // FR-001
    await page.goto('/login')
    await expect(page.getByTestId('login-user-minh')).toBeVisible()
    await expect(page.getByTestId('login-user-lan')).toBeVisible()
    await expect(page.getByTestId('login-user-hung')).toBeVisible()
  })

  test('@ci đăng nhập bằng thẻ Minh Nguyễn → /products, header hiển thị tên', async ({ page }) => {
    // FR-001, FR-003
    const loginPage = new LoginPage(page)
    const productsPage = new ProductsPage(page)
    await loginPage.loginAsUser('minh')
    await expect(page).toHaveURL(/\/products/)
    const username = await productsPage.getHeaderUsername()
    expect(username).toContain('Minh')
  })

  test('truy cập /products khi chưa đăng nhập → redirect /login', async ({ page }) => {
    // FR-002
    await page.goto('/products')
    await expect(page).toHaveURL(/\/login/)
  })

  test('truy cập /cart khi chưa đăng nhập → redirect /login', async ({ page }) => {
    // FR-002
    await page.goto('/cart')
    await expect(page).toHaveURL(/\/login/)
  })

  test('truy cập /checkout khi chưa đăng nhập → redirect /login', async ({ page }) => {
    // FR-002
    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/login/)
  })

  test('đăng xuất → về /login, không thể vào /products', async ({ page }) => {
    // FR-003
    const loginPage = new LoginPage(page)
    const productsPage = new ProductsPage(page)
    await loginPage.loginAsUser('minh')
    await productsPage.logout()
    await expect(page).toHaveURL(/\/login/)
    await page.goto('/products')
    await expect(page).toHaveURL(/\/login/)
  })
})
