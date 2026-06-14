# Research: Login Form với Username & Password

**Feature**: 005-login-form | **Date**: 2026-06-14

---

## D1 — Lưu password trong mock data

**Decision**: Thêm trường `password: string` vào `User` type trong `src/data/users.ts`. Tất cả 3 users có `password: '123'`.

**Rationale**: Phù hợp với kiến trúc hiện tại (dữ liệu giả lập trong file), tuân thủ constitution IV (không backend thật). Không cần hash vì đây là demo — hash thêm phức tạp không cần thiết cho mục tiêu học tập.

**Alternatives considered**:
- Hardcode password trong LoginPage.tsx → từ chối vì tách dữ liệu khỏi component là đúng kiến trúc
- Lưu credentials trong AuthContext → từ chối vì AuthContext chỉ quản lý session, không phải data

---

## D2 — Vị trí logic validate credentials

**Decision**: Thêm pure function `findByCredentials(username: string, password: string): User | undefined` vào `src/data/users.ts`.

**Rationale**: Logic tìm user theo credentials là data-layer concern, không phải auth-session concern. Giữ `AuthContext.login(userId)` không đổi — đơn giản nhất, ít thay đổi nhất (YAGNI).

**Alternatives considered**:
- Đổi signature `login(userId, password)` trong AuthContext → từ chối vì gây breaking change không cần thiết; AuthContext đang làm đúng vai trò của nó
- Tạo service riêng `authService.ts` → từ chối vì quá phức tạp cho scope nhỏ này

---

## D3 — State management trong LoginPage

**Decision**: Dùng React local state (`useState`) trong `LoginPage.tsx` cho: `username`, `password`, `error`. Không đưa error state vào context.

**Rationale**: Error đăng nhập là UI-local state, không cần chia sẻ với component khác. `useState` là đơn giản nhất (constitution II).

**Alternatives considered**:
- useReducer → từ chối vì 3 state đơn giản không cần reducer
- Error trong AuthContext → từ chối vì context không nên biết về UI error

---

## D4 — Thay đổi Playwright Page Object

**Decision**: Cập nhật `pages/LoginPage.ts` — thêm locators mới (`usernameInput`, `passwordInput`, `submitButton`, `errorMessage`), cập nhật `loginAsUser(userId, password = '123')` để fill form thay vì click button.

**Rationale**: `loginAsUser` là helper dùng trong nhiều test file (us1, us4, us5). Thêm default `password = '123'` cho phép tất cả test hiện tại dùng `loginAsUser('minh')` mà không cần sửa — backward compatible.

**Alternatives considered**:
- Xóa `loginAsUser`, buộc mọi test viết lại → từ chối vì tốn công không cần thiết
- Giữ `userButton(userId)` → từ chối vì UI cũ sẽ bị xóa (FR-009)

---

## D5 — data-testid cho form mới

**Decision**: Dùng các testid sau:

| Element | data-testid |
|---------|-------------|
| Container trang | `login-page` (giữ nguyên) |
| Input username | `login-username` |
| Input password | `login-password` |
| Nút đăng nhập | `login-submit` |
| Thông báo lỗi | `login-error` |

Xóa: `login-user-minh`, `login-user-lan`, `login-user-hung` (breaking change có chủ ý — FR-009).

**Rationale**: Tên testid theo ngữ cảnh kebab-case, mô tả đúng vai trò (constitution III). `login-page` giữ nguyên vì các test hiện tại dùng nó để wait for navigation.

---

## D6 — CSS: tái sử dụng hay viết mới

**Decision**: Xóa các class `.userList`, `.userBtn`, `.avatar` trong `LoginPage.module.css`. Thêm class mới: `.form`, `.field`, `.label`, `.input`, `.inputError`, `.submitBtn`, `.errorMsg`. Giữ nguyên `.page`, `.card`, `.title`, `.subtitle`.

**Rationale**: `.page`, `.card`, `.title`, `.subtitle` vẫn dùng được cho form layout. Class mới tách biệt rõ UI cũ và mới. Toàn bộ dùng CSS variables từ `tokens.css` (constitution V).

**Alternatives considered**:
- Dùng inline styles → từ chối vì không nhất quán với codebase
- Shared form component → từ chối vì chỉ có 1 form, YAGNI

---

## D7 — Scope test thay đổi

**Decision**: Cần cập nhật 4 file test/PO:
1. `pages/LoginPage.ts` — PO update (D4)
2. `tests/us1-login.spec.ts` — test US1 login flow (hiện dùng `loginAsUser`)
3. `tests/us4-cart-management.spec.ts` — dùng `loginAsUser` trong beforeEach
4. `tests/us5-checkout.spec.ts` — dùng `loginAsUser` trong beforeEach

Thêm test mới trong `tests/us1-login.spec.ts` cho US2 (form error scenarios).

**Rationale**: `loginAsUser` được update backward-compatible (D4) nên us4 và us5 không cần sửa nội dung test, chỉ PO thay đổi. us1 cần thêm test case cho error path (constitution VI: happy path + error path).
