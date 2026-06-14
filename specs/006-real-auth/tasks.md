---
description: "Task list for 006-real-auth"
---

# Tasks: Real User Authentication

**Input**: Design documents from `specs/006-real-auth/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Không generate test mới. Task T008 cập nhật test hiện có (bắt buộc
vì credentials thay đổi từ mock sang thật).

**Organization**: Nhóm theo user story để mỗi story có thể implement và test
độc lập.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Có thể chạy song song (file khác nhau, không có dependency)
- **[Story]**: User story liên quan (US1–US4)
- Đường dẫn file tuyệt đối không dùng; dùng đường dẫn tương đối từ repo root

---

## Phase 1: Setup

**Purpose**: Thêm dependency mới và cấu hình môi trường

- [x] T001 Cài `@supabase/supabase-js` bằng lệnh `npm install @supabase/supabase-js` (cập nhật `package.json` và `package-lock.json`)
- [x] T002 [P] Tạo file `.env.local` tại repo root với nội dung: `VITE_SUPABASE_URL=https://uwhvzselrqhbenbxwzlr.supabase.co` và `VITE_SUPABASE_ANON_KEY=sb_publishable_YzzSiGb7SxzSKr_Kh6_2yw_OgRypDs_` (file này đã được gitignore qua `.env*`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lớp data access và auth context mới — tất cả user story đều phụ
thuộc vào phase này.

**⚠️ CRITICAL**: Không story nào có thể implement trước khi phase này hoàn thành.

- [x] T003 Tạo `src/lib/supabase.ts` — export hằng `supabase` là kết quả gọi `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)` từ `@supabase/supabase-js`
- [x] T004 Cập nhật `src/data/users.ts` — (a) xóa mảng `users` và type `User` cũ; (b) định nghĩa `export type User = { id: number; username: string }`; (c) thay `findByCredentials` sync bằng `export async function findByCredentials(username: string, password: string): Promise<User | null>` dùng `supabase.from('users').select('id, username, password').eq('username', username.trim()).maybeSingle()`; nếu `error` → throw error (lỗi DB, LoginPage sẽ hiển thị "không thể kết nối"); nếu `!data` → return `null` (không tìm thấy user, LoginPage hiển thị "tên/mật khẩu không đúng"); nếu `data.password !== password` → return `null`; nếu khớp → return `{ id: data.id, username: data.username }` (phụ thuộc T003)
- [x] T005 Cập nhật `src/context/AuthContext.tsx` — (a) xóa import `users` array; (b) cập nhật `SessionData` thành `{ userId: number; username: string }`; (c) cập nhật `loadUser()`: đọc session từ localStorage, nếu không có hoặc thiếu `userId`/`username` trả `null`, ngược lại trả `{ id: session.userId, username: session.username }` (không gọi DB và không tìm trong local array); (d) cập nhật `login` signature thành `login(user: User): void` và lưu `{ userId: user.id, username: user.username }` vào localStorage rồi `setUser(user)` (phụ thuộc T004)

**Checkpoint**: Foundation ready — US1–US4 đều có thể bắt đầu sau phase này.

---

## Phase 3: US1 + US4 — Luồng Đăng Nhập & Xử Lý Lỗi (Priority: P1/P3) 🎯 MVP

**Goal**: Người dùng nhập đúng credentials → vào `/products`; lỗi DB → thông
báo thân thiện.

**Independent Test**: Nhập `oliver_hayes` / `123` → redirect `/products`, header
hiển thị `oliver_hayes`. Nhập credentials sai → thông báo lỗi.

### Implementation

- [x] T006 [US1] Cập nhật `src/pages/LoginPage.tsx` — (a) thêm `const [loading, setLoading] = useState(false)`; (b) đổi `handleSubmit` thành `async function`; (c) sau khi validate trường rỗng, gọi `setLoading(true)` rồi bọc trong `try/catch/finally`: trong `try` gọi `const user = await findByCredentials(username, password)`, nếu `!user` set error "Tên đăng nhập hoặc mật khẩu không đúng", nếu có user gọi `login(user)` rồi `navigate('/products')`; trong `catch` set error "Không thể kết nối hệ thống, vui lòng thử lại"; trong `finally` gọi `setLoading(false)`; (d) cập nhật submit button: `disabled={loading}` và text `{loading ? 'Đang xác thực...' : 'Đăng nhập'}` (phụ thuộc T005)
- [x] T007 [P] [US1] Cập nhật `src/components/Header.tsx` — đổi `{user?.displayName}` thành `{user?.username}` tại dòng hiển thị `data-testid="header-user-name"` (phụ thuộc T005, song song với T006)

**Checkpoint**: Tại đây US1 và US4 có thể test độc lập — đăng nhập thành công,
lỗi credentials, lỗi kết nối đều được xử lý.

---

## Phase 4: US2 — Đăng Nhập Thất Bại — Cập Nhật Tests (Priority: P1)

**Goal**: Playwright tests dùng credentials thật từ Supabase thay vì mock data.

**Independent Test**: Chạy `npm run test:e2e -- tests/us1-login.spec.ts` — tất
cả tests phải pass với credentials mới.

### Implementation

- [x] T008 [US2] Cập nhật `tests/us1-login.spec.ts` — thay thế toàn bộ credentials mock bằng real: (a) `loginAsUser('minh')` → `loginAsUser('oliver_hayes')` và `toContain('Minh')` → `toContain('oliver_hayes')` trong test đăng nhập Minh; (b) `loginAsUser('lan')` → `loginAsUser('charlotte_reed')` và `toContain('Lan')` → `toContain('charlotte_reed')`; (c) `loginAsUser('hung')` → `loginAsUser('james_thornton')` và `toContain('Hùng')` → `toContain('james_thornton')`; cập nhật tên test string cho khớp (phụ thuộc T006, T007)

> **US3 — Bảo Vệ Trang**: Không cần task mới — `RequireAuth` trong `App.tsx`
> vẫn hoạt động vì nó chỉ check `user !== null` từ `AuthContext`. T005 đảm bảo
> `loadUser()` trả `null` khi không có session hợp lệ.

**Checkpoint**: US1 + US2 đều có test tự động pass. US3 được xác nhận qua các
test "chưa đăng nhập → redirect /login" (không thay đổi).

---

## Phase 5: Polish & CI/CD

**Purpose**: Đảm bảo CI pipeline hoạt động với Supabase env vars.

- [x] T009 Cập nhật `.github/workflows/deploy.yml` — thêm `env:` block vào bước `run: npm run build -- --base=/ShopOnline/` trong job `build` với `VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}` và `VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}`; thêm tương tự vào bước `run: npx playwright test --config playwright.ci.config.ts` trong job `test` (giữ nguyên `CI: true` hiện có)
- [x] T010 Chạy `npm run lint` và `npm run format:check` từ repo root để xác nhận không có TypeScript error hay format violation sau tất cả thay đổi

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Không phụ thuộc — bắt đầu ngay
- **Foundational (Phase 2)**: Phụ thuộc Phase 1 (T003 cần T001; T002 cần trước khi chạy app)
- **US1+US4 (Phase 3)**: Phụ thuộc Phase 2 hoàn thành (T006 cần T005; T007 cần T005)
- **US2 Tests (Phase 4)**: Phụ thuộc Phase 3 (T008 cần T006 + T007 hoàn thành)
- **Polish (Phase 5)**: Phụ thuộc Phase 4 (T009, T010 chạy sau khi tất cả implementation xong)

### Within Phase 2 (Sequential)

```
T003 (supabase.ts) → T004 (users.ts) → T005 (AuthContext.tsx)
```

### Within Phase 3 (Parallel after T005)

```
T005 done → T006 (LoginPage.tsx)
          ↘ T007 [P] (Header.tsx)   ← chạy song song với T006
```

### Within Phase 4

```
T006 + T007 done → T008 (tests update)
```

---

## Parallel Opportunities

### Phase 1

```
T001 (npm install) chạy song song với T002 (.env.local)
```

### Phase 3 — Sau khi T005 xong

```
T006 (LoginPage.tsx) song song với T007 (Header.tsx)
```

---

## Implementation Strategy

### MVP (US1 — Đăng nhập thành công)

1. Phase 1: Setup (T001, T002)
2. Phase 2: Foundational (T003 → T004 → T005)
3. Phase 3: T006 + T007 song song
4. **STOP và VALIDATE**: Mở app, login bằng `oliver_hayes/123` → phải vào /products và header hiển thị `oliver_hayes`
5. Phase 4: T008 (cập nhật tests)
6. **STOP và VALIDATE**: `npm run test:e2e -- tests/us1-login.spec.ts` phải toàn bộ pass

### Full Implementation

7. Phase 5: T009 (deploy.yml) + T010 (lint)
8. **STOP và VALIDATE**: Push lên main → CI pipeline phải pass toàn bộ

---

## Notes

- T001 và T002 có thể chạy song song
- T003 → T004 → T005 phải sequential (mỗi file import file trước)
- T006 và T007 song song sau T005
- T008 chỉ làm sau T006 + T007 để test chạy đúng
- Xóa localStorage trước khi test thủ công nếu có session cũ từ mock data (`localStorage.removeItem('simpleshop.session')` trong DevTools console)
- T002 (.env.local) chỉ cần tạo một lần; không commit lên git
