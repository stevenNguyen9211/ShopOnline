# Quickstart: Xác Thực Người Dùng Thật

**Feature**: 006-real-auth | **Date**: 2026-06-14

## Prerequisites

1. Node.js + npm đã cài
2. File `.env.local` tại root project với nội dung:
   ```
   VITE_SUPABASE_URL=https://uwhvzselrqhbenbxwzlr.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
3. `@supabase/supabase-js` đã được cài: `npm install`

## Chạy app

```bash
npm run dev
# → http://localhost:5173
```

## Validation Scenarios

### Scenario 1 — Đăng nhập thành công (US1, FR-001, FR-003)

1. Mở http://localhost:5173 → tự redirect về `/login`
2. Nhập username: `oliver_hayes`, password: `123`
3. Nhấn "Đăng nhập"
4. **Expect**: button đổi text "Đang xác thực..." trong vài giây
5. **Expect**: redirect sang `/products`
6. **Expect**: header hiển thị `oliver_hayes`

Thử tương tự với `charlotte_reed/123` và `james_thornton/123`.

### Scenario 2 — Password sai (US2, FR-004)

1. Nhập username: `oliver_hayes`, password: `wrongpass`
2. Nhấn "Đăng nhập"
3. **Expect**: ở lại `/login`, thông báo lỗi "Tên đăng nhập hoặc mật khẩu không đúng"

### Scenario 3 — Username không tồn tại (US2, FR-004)

1. Nhập username: `minh`, password: `123`
2. Nhấn "Đăng nhập"
3. **Expect**: ở lại `/login`, cùng thông báo lỗi như Scenario 2

### Scenario 4 — Trường rỗng (US2, FR-005)

1. Để trống cả hai trường → nhấn "Đăng nhập"
2. **Expect**: thông báo "Vui lòng điền đầy đủ thông tin", không có network request

### Scenario 5 — Session persist (US1, FR-006)

1. Đăng nhập thành công với `oliver_hayes/123`
2. Nhấn F5 (tải lại trang)
3. **Expect**: vẫn ở `/products`, header vẫn hiển thị `oliver_hayes`

### Scenario 6 — Bảo vệ route (US3, FR-007, FR-008)

1. Mở tab mới → truy cập http://localhost:5173/products trực tiếp
2. **Expect**: redirect về `/login`
3. Thử tương tự với `/cart`, `/checkout`, `/confirmation`

### Scenario 7 — Lỗi kết nối (US4, FR-010)

1. Tắt mạng hoặc thay `VITE_SUPABASE_URL` bằng URL sai trong `.env.local`
2. Khởi động lại `npm run dev`
3. Nhập username/password bất kỳ → nhấn "Đăng nhập"
4. **Expect**: thông báo "Không thể kết nối hệ thống, vui lòng thử lại"

## Chạy Playwright Tests

```bash
npm run test:e2e
# Cần .env.local được set và app đang chạy (hoặc webServer trong playwright.config.ts tự start)
```

**Tests liên quan đến feature này**: `tests/us1-login.spec.ts`

## CI/CD — Setup GitHub Secrets

Sau khi merge, thêm vào GitHub repository secrets:

```
VITE_SUPABASE_URL = https://uwhvzselrqhbenbxwzlr.supabase.co
VITE_SUPABASE_ANON_KEY = <anon key>
```

Settings → Secrets and variables → Actions → New repository secret
