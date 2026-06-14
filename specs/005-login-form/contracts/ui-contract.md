# UI Contract: Login Form

**Feature**: 005-login-form | **Date**: 2026-06-14

Hợp đồng giữa UI component và Playwright tests — mọi `data-testid` liệt kê ở đây là
public API ổn định. Thay đổi hoặc xóa bất kỳ testid nào là breaking change và PHẢI
cập nhật đồng thời trong cả component lẫn test.

---

## Trang đăng nhập (`/login`)

| data-testid | Element | Điều kiện hiển thị | Vai trò |
|-------------|---------|-------------------|---------|
| `login-page` | `<div>` container | Luôn hiển thị ở `/login` | Anchor để test wait navigation |
| `login-username` | `<input type="text">` | Luôn hiển thị | Nhập username |
| `login-password` | `<input type="password">` | Luôn hiển thị | Nhập password (ẩn ký tự) |
| `login-submit` | `<button type="submit">` | Luôn hiển thị | Submit form |
| `login-error` | `<p>` hoặc `<div>` | Chỉ khi có lỗi | Thông báo lỗi |

### Removed testids (breaking change có chủ ý)

Các testid sau bị xóa trong feature 005:

| Removed testid | Lý do |
|---------------|-------|
| `login-user-minh` | UI click-to-select bị xóa (FR-009) |
| `login-user-lan` | UI click-to-select bị xóa (FR-009) |
| `login-user-hung` | UI click-to-select bị xóa (FR-009) |

---

## Behaviors

### Submit hành vi

| Trạng thái | Hành vi |
|-----------|---------|
| Username hoặc password trống | `login-error` hiển thị, ở lại `/login` |
| Credentials sai | `login-error` hiển thị, ở lại `/login` |
| Credentials đúng | `login-error` không hiển thị, navigate tới `/products` |

### Error message content

| Trường hợp | Nội dung `login-error` |
|-----------|----------------------|
| Trường trống | `Vui lòng điền đầy đủ thông tin` |
| Credentials sai (username sai hoặc password sai) | `Tên đăng nhập hoặc mật khẩu không đúng` |

### Enter-to-submit

Form PHẢI submit khi người dùng nhấn Enter trong bất kỳ input nào — tương đương click `login-submit`.

---

## Playwright Page Object Interface

```typescript
// pages/LoginPage.ts — expected public API sau feature 005
class LoginPage {
  // Locators
  loginPage: Locator           // data-testid="login-page"
  usernameInput: Locator       // data-testid="login-username"
  passwordInput: Locator       // data-testid="login-password"
  submitButton: Locator        // data-testid="login-submit"
  errorMessage: Locator        // data-testid="login-error"

  // Actions
  loginAsUser(userId: string, password?: string): Promise<void>
  // default password = '123' — backward compatible với existing tests
  
  fillUsername(username: string): Promise<void>
  fillPassword(password: string): Promise<void>
  submit(): Promise<void>
  getErrorMessage(): Promise<string>
  isAt(): Promise<boolean>
}
```
