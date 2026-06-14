import { test, expect } from '../fixtures'
import { LoginPage } from '../pages/LoginPage'
import { ProductsPage } from '../pages/ProductsPage'

test.describe('US1 — Kiểm chứng đăng nhập và bảo vệ trang', () => {
  test('hiển thị form đăng nhập với username và password', async ({ page }) => {
    // FR-001
    await page.goto('login')
    await expect(page.getByTestId('login-username')).toBeVisible()
    await expect(page.getByTestId('login-password')).toBeVisible()
    await expect(page.getByTestId('login-submit')).toBeVisible()
  })

  test('@ci đăng nhập bằng oliver_hayes/123 → /products, header hiển thị tên', async ({ page }) => {
    // FR-001, FR-003, FR-004
    const loginPage = new LoginPage(page)
    const productsPage = new ProductsPage(page)
    await loginPage.loginAsUser('oliver_hayes')
    await expect(page).toHaveURL(/\/products/)
    const username = await productsPage.getHeaderUsername()
    expect(username).toContain('oliver_hayes')
  })

  test('@ci đăng nhập bằng charlotte_reed/123 → /products, header hiển thị tên', async ({ page }) => {
    // FR-003, FR-004, SC-002
    const loginPage = new LoginPage(page)
    const productsPage = new ProductsPage(page)
    await loginPage.loginAsUser('charlotte_reed')
    await expect(page).toHaveURL(/\/products/)
    const username = await productsPage.getHeaderUsername()
    expect(username).toContain('charlotte_reed')
  })

  test('@ci đăng nhập bằng james_thornton/123 → /products, header hiển thị tên', async ({ page }) => {
    // FR-003, FR-004, SC-002
    const loginPage = new LoginPage(page)
    const productsPage = new ProductsPage(page)
    await loginPage.loginAsUser('james_thornton')
    await expect(page).toHaveURL(/\/products/)
    const username = await productsPage.getHeaderUsername()
    expect(username).toContain('james_thornton')
  })

  test('truy cập /products khi chưa đăng nhập → redirect /login', async ({ page }) => {
    // FR-002
    await page.goto('products')
    await expect(page).toHaveURL(/\/login/)
  })

  test('truy cập /cart khi chưa đăng nhập → redirect /login', async ({ page }) => {
    // FR-002
    await page.goto('cart')
    await expect(page).toHaveURL(/\/login/)
  })

  test('truy cập /checkout khi chưa đăng nhập → redirect /login', async ({ page }) => {
    // FR-002
    await page.goto('checkout')
    await expect(page).toHaveURL(/\/login/)
  })

  test('đăng xuất → về /login, không thể vào /products', async ({ page }) => {
    // FR-003
    const loginPage = new LoginPage(page)
    const productsPage = new ProductsPage(page)
    await loginPage.loginAsUser('oliver_hayes')
    await productsPage.logout()
    await expect(page).toHaveURL(/\/login/)
    await page.goto('products')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('US1 — Form error paths', () => {
  test('@ci sai password → thông báo lỗi, ở lại /login', async ({ page }) => {
    // FR-005
    const loginPage = new LoginPage(page)
    await page.goto('login')
    await loginPage.fillUsername('oliver_hayes')
    await loginPage.fillPassword('sai-mat-khau')
    await loginPage.submit()
    await expect(page.getByTestId('login-error')).toBeVisible()
    expect(await loginPage.getErrorMessage()).toBe('Tên đăng nhập hoặc mật khẩu không đúng')
    await expect(page).toHaveURL(/\/login/)
  })

  test('@ci username không tồn tại → thông báo lỗi, ở lại /login', async ({ page }) => {
    // FR-005
    const loginPage = new LoginPage(page)
    await page.goto('login')
    await loginPage.fillUsername('admin')
    await loginPage.fillPassword('123')
    await loginPage.submit()
    await expect(page.getByTestId('login-error')).toBeVisible()
    expect(await loginPage.getErrorMessage()).toBe('Tên đăng nhập hoặc mật khẩu không đúng')
    await expect(page).toHaveURL(/\/login/)
  })

  test('@ci trường trống → thông báo lỗi, ở lại /login', async ({ page }) => {
    // FR-006
    const loginPage = new LoginPage(page)
    await page.goto('login')
    await loginPage.submit()
    await expect(page.getByTestId('login-error')).toBeVisible()
    expect(await loginPage.getErrorMessage()).toBe('Vui lòng điền đầy đủ thông tin')
    await expect(page).toHaveURL(/\/login/)
  })
})
