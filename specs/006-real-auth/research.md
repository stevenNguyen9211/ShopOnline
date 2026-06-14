# Research: Real User Authentication

**Feature**: 006-real-auth | **Date**: 2026-06-14

## 1. Schema xác thực từ Supabase (đã query trực tiếp)

**Decision**: Sử dụng schema thực tế từ Supabase MCP query.

| Cột | Kiểu | Vai trò |
|-----|------|---------|
| `id` | integer (PK, auto-increment) | Primary key — KHÔNG dùng làm login |
| `username` | varchar (unique) | Login credential (user nhập vào form) |
| `password` | varchar | Mật khẩu plain text |
| `created_at` | timestamptz (nullable) | Không dùng trong auth flow |

**Test data trong DB**:
- `oliver_hayes` / `123`
- `charlotte_reed` / `123`
- `james_thornton` / `123`

**Rationale**: Schema thực tế là nguồn chân lý — không thể thay đổi (Nguyên
tắc IX). Login flow: `SELECT * FROM public.users WHERE username = $1`, sau đó
so sánh `row.password === inputPassword`.

**Alternatives considered**: Dùng cột `id` làm login credential (spec
clarification ban đầu chọn A) — bị loại vì `id` là integer PK auto-increment,
không phải human-readable login name.

---

## 2. Supabase JS Client — cách khởi tạo

**Decision**: `createClient(url, anonKey)` singleton trong `src/lib/supabase.ts`.

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**Rationale**: Singleton pattern ngăn nhiều connection; Vite expose biến
`VITE_*` vào bundle client qua `import.meta.env`.

**Alternatives considered**: Tạo client trong mỗi lần gọi — bị loại vì lãng phí
và không phù hợp pattern Supabase.

---

## 3. Query pattern — tìm user theo username

**Decision**: Dùng Supabase JS query builder, chọn đúng các cột cần thiết.

```typescript
const { data, error } = await supabase
  .from('users')
  .select('id, username, password')
  .eq('username', username.trim())
  .maybeSingle()
```

Dùng `.maybeSingle()` thay vì `.single()` vì `.single()` throw error khi
không tìm thấy row (không mong muốn — chỉ cần return null).

**Rationale**: Explicit column selection (không `select('*')`) giảm data
transfer; `.maybeSingle()` trả `null` thay vì error khi user không tồn tại.

**Alternatives considered**: `fetch` thuần với PostgREST URL — bị loại vì cần
tự xử lý auth header, URL encoding, error parsing.

---

## 4. Session storage — localStorage vs sessionStorage

**Decision**: Giữ localStorage (cơ chế hiện tại trong `src/lib/storage.ts`).

Session shape thay đổi từ `{ userId: string }` → `{ userId: number, username: string }`.

**Rationale**: localStorage đã implement sẵn; sessionStorage sẽ yêu cầu thay
đổi `storage.ts` mà không có lợi ích nào cho dự án học tập. Spec clarification
(Q2) đã xác nhận: cache `userId` + `displayName` trong localStorage, không
re-query DB khi refresh. `username` giữ vai trò `displayName`.

**Alternatives considered**: sessionStorage (xoá khi đóng tab) — bị loại vì
phức tạp hơn, không nhất quán với cơ chế cart đang dùng localStorage.

---

## 5. Hiển thị tên người dùng trong Header

**Decision**: Hiển thị `username` (ví dụ: `oliver_hayes`) trong `data-testid="header-user-name"`.

**Rationale**: Không có cột `display_name` trong DB. `username` là thông tin duy
nhất có thể hiển thị. Thay đổi duy nhất trong Header: `user?.displayName` →
`user?.username`.

**Alternatives considered**: Không hiển thị gì — bị loại vì test hiện tại kiểm
tra `header-user-name` có nội dung.

---

## 6. Cập nhật Playwright tests

**Decision**: Cập nhật `tests/us1-login.spec.ts` với credentials thực tế.

| Mock (cũ) | Real DB (mới) | Assertion cũ | Assertion mới |
|-----------|--------------|--------------|---------------|
| `minh` | `oliver_hayes` | `toContain('Minh')` | `toContain('oliver_hayes')` |
| `lan` | `charlotte_reed` | `toContain('Lan')` | `toContain('charlotte_reed')` |
| `hung` | `james_thornton` | `toContain('Hùng')` | `toContain('james_thornton')` |

**Rationale**: Tests cũ dùng mock data không tồn tại trong DB thật — sẽ fail
sau khi switch sang Supabase. Phải update để phản ánh thực tế.

---

## 7. CI/CD — Environment Variables

**Decision**: Thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` vào GitHub
Actions secrets.

**Values** (anon/publishable key — safe to use in browser):
- `VITE_SUPABASE_URL`: `https://uwhvzselrqhbenbxwzlr.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: publishable key (sb_publishable_...)

**Rationale**: Vite inline `VITE_*` vars vào bundle tại build time. Nếu không
có, client sẽ là `undefined` và query sẽ fail. CI cần vars này cho cả build
job lẫn Playwright test job.

**Alternatives considered**: Hard-code trong code — bị loại vì expose vào git
history; dùng mock trong CI — bị loại vì test cần kết nối thật.

---

## 8. Error handling — phân loại lỗi

**Decision**: Phân biệt 2 loại lỗi trong `LoginPage`:

| Tình huống | Xử lý | Thông báo |
|-----------|-------|-----------|
| Username/password không khớp | `return null` từ service | "Tên đăng nhập hoặc mật khẩu không đúng" |
| Lỗi kết nối / Supabase error | `throw error` từ service | "Không thể kết nối hệ thống, vui lòng thử lại" |

`LoginPage.handleSubmit` dùng `try/catch` để bắt lỗi mạng; service trả `null`
khi credentials sai (không throw).

**Rationale**: Hai loại lỗi cần thông báo khác nhau — Không lộ thông tin về
sự tồn tại của user khi thông tin sai.
