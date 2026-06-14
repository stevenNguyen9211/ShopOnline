# Quickstart: Login Form — Validation Scenarios

**Feature**: 005-login-form | **Date**: 2026-06-14

## Prerequisites

```bash
npm ci
npx playwright install chromium --with-deps
npm run dev   # dev server chạy ở http://localhost:5173/
```

---

## Kịch bản 1: Đăng nhập thành công với cả 3 tài khoản

**Mục tiêu**: Xác nhận FR-003 và FR-004 — 3 tài khoản hợp lệ đăng nhập được và hiển thị đúng tên.

```bash
npx playwright test tests/us1-login.spec.ts --headed
```

**Expected**: 3 test case pass — mỗi user chuyển sang `/products` và header hiển thị đúng tên (`Minh Nguyễn`, `Lan Trần`, `Hùng Phạm`).

---

## Kịch bản 2: Thông báo lỗi khi nhập sai

**Mục tiêu**: Xác nhận FR-005 và FR-006 — lỗi đúng, ở lại `/login`.

**Manual**:
1. Mở `http://localhost:5173/login`
2. Nhập `minh` / `sai-mat-khau` → click Đăng nhập
3. Kỳ vọng: thông báo "Tên đăng nhập hoặc mật khẩu không đúng" xuất hiện, URL vẫn là `/login`
4. Nhập `admin` / `123` → click Đăng nhập
5. Kỳ vọng: cùng thông báo lỗi
6. Xóa cả 2 trường → click Đăng nhập
7. Kỳ vọng: thông báo "Vui lòng điền đầy đủ thông tin"

**Auto**:
```bash
npx playwright test tests/us1-login.spec.ts -g "lỗi" --headed
```

---

## Kịch bản 3: Enter-to-submit

**Mục tiêu**: Xác nhận FR-007 — form submit bằng phím Enter.

**Manual**:
1. Mở `http://localhost:5173/login`
2. Click vào input Username, gõ `minh`
3. Tab sang Password, gõ `123`
4. Nhấn Enter (không click nút)
5. Kỳ vọng: chuyển sang `/products`, header hiển thị "Minh Nguyễn"

---

## Kịch bản 4: Password masking

**Mục tiêu**: Xác nhận FR-002 — ký tự password ẩn.

**Manual**:
1. Mở `http://localhost:5173/login`
2. Gõ `123` vào trường Password
3. Kỳ vọng: hiển thị `•••` (dấu chấm/sao), không hiển thị `123`
4. DevTools → inspect element → `input[data-testid="login-password"]` có `type="password"`

---

## Kịch bản 5: Visual consistency

**Mục tiêu**: Xác nhận FR-008 và SC-004 — giao diện nhất quán với phần còn lại của app.

**Manual**:
1. Đăng nhập với `minh` / `123` → trang Products
2. So sánh header (màu xanh `#2563eb`) với màu nút "Đăng nhập" ở trang login
3. So sánh font, khoảng cách, border radius card giữa login và product card
4. Kỳ vọng: không có sự khác biệt về palette màu

---

## Kịch bản 6: Smoke test trên GitHub Pages (sau deploy)

**Mục tiêu**: Xác nhận login flow hoạt động trên môi trường production.

```bash
npx playwright test --config playwright.smoke.config.ts
```

**Expected**: 9 @ci tests pass — bao gồm login happy path trong `us1-login.spec.ts`.

---

## Kịch bản 7: Tests cũ (us4, us5) không bị ảnh hưởng

**Mục tiêu**: Xác nhận backward compatibility của `loginAsUser()` trong Page Object.

```bash
npx playwright test tests/us4-cart-management.spec.ts tests/us5-checkout.spec.ts --headed
```

**Expected**: Tất cả tests pass — `loginAsUser('minh')` (không truyền password) hoạt động với default `'123'`.
