# Data Model: Real User Authentication

**Feature**: 006-real-auth | **Date**: 2026-06-14

## Entities

### User (App-level type)

Đại diện cho người dùng đã xác thực trong React app. Được tạo từ kết quả
Supabase query — không có `password` (không lưu trong state).

```typescript
type User = {
  id: number        // từ cột id (integer PK)
  username: string  // từ cột username (login credential + display name)
}
```

**Nguồn dữ liệu**: `public.users` (Supabase, read-only)
**Lifecycle**: Tồn tại trong React state + localStorage session; bị xóa khi logout.

---

### Session (localStorage)

Dữ liệu được persist trong localStorage để duy trì đăng nhập qua page refresh.

```typescript
type SessionData = {
  userId: number    // id từ DB — dùng để identify user
  username: string  // username từ DB — dùng để hiển thị, không re-query DB
}
```

**Key**: `simpleshop.session` (hiện có trong `src/lib/storage.ts`)
**Lifecycle**: Được ghi khi `login()` thành công; bị xóa khi `logout()`.

---

### DB Row (Supabase response)

Shape của row trả về từ Supabase query (trước khi map sang `User`):

```typescript
type DbUser = {
  id: number
  username: string
  password: string  // chỉ dùng để compare, không lưu vào User type
}
```

---

## State Transitions

```
[Unauthenticated]
       │
       │  findByCredentials(username, password) → User
       ▼
[Authenticated]  ──── AuthContext.user: User ────►  Header hiển thị username
       │              localStorage: SessionData
       │
       │  logout() → xóa localStorage
       ▼
[Unauthenticated]
```

---

## Validation Rules

| Field | Rule | Enforced tại |
|-------|------|--------------|
| username | Không được rỗng hoặc chỉ khoảng trắng | `LoginPage.handleSubmit` (trước query) |
| password | Không được rỗng hoặc chỉ khoảng trắng | `LoginPage.handleSubmit` (trước query) |
| username match | Phải tồn tại trong `public.users` | `findByCredentials` (Supabase query) |
| password match | `row.password === inputPassword` (plain text) | `findByCredentials` (sau query) |

---

## Type Changes vs. Current Code

| Type/Field | Trước | Sau |
|---|---|---|
| `User.id` | `string` | `number` |
| `User.displayName` | `string` | ❌ removed |
| `User.password` | `string` | ❌ removed |
| `User.username` | ❌ không có | `string` (mới) |
| `SessionData.userId` | `string` | `number` |
| `SessionData.username` | ❌ không có | `string` (mới) |
