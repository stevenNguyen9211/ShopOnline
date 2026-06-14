# Data Model: Login Form với Username & Password

**Feature**: 005-login-form | **Date**: 2026-06-14

---

## Entity: User

**File**: `src/data/users.ts`

| Field | Type | Validation | Notes |
|-------|------|-----------|-------|
| `id` | `string` | Unique, kebab-case, no spaces | Dùng làm session key (`userId`) |
| `displayName` | `string` | Non-empty | Tên hiển thị ở header sau login |
| `password` | `string` | Non-empty | Mật khẩu giả lập — thêm mới trong feature này |

**Dữ liệu hiện tại (sau thay đổi)**:

| id | displayName | password |
|----|-------------|----------|
| `minh` | Minh Nguyễn | `123` |
| `lan` | Lan Trần | `123` |
| `hung` | Hùng Phạm | `123` |

**Validation rules**:
- `findByCredentials(username, password)` so sánh exact match (case-sensitive, no trim) với từng user trong mảng
- Trả về `User | undefined` — `undefined` khi không khớp

---

## Entity: LoginFormState (UI-local, không persistent)

**Scope**: React component state trong `LoginPage.tsx`

| Field | Type | Initial | Notes |
|-------|------|---------|-------|
| `username` | `string` | `''` | Giá trị input username |
| `password` | `string` | `''` | Giá trị input password |
| `error` | `string \| null` | `null` | Thông báo lỗi hoặc null khi không có lỗi |

**State transitions**:
```
Initial (error: null)
  → [submit, trường trống] → error: 'Vui lòng điền đầy đủ thông tin'
  → [submit, credentials sai] → error: 'Tên đăng nhập hoặc mật khẩu không đúng'
  → [submit, credentials đúng] → navigate('/products') [reset state]
  → [nhập lại sau lỗi] → error: null (xóa khi user bắt đầu nhập)
```

---

## Entity: Session (unchanged)

**File**: `src/lib/storage.ts` + `src/context/AuthContext.tsx`

Không thay đổi. Session vẫn lưu `{ userId: string }` trong localStorage. `AuthContext.login(userId)` nhận userId sau khi LoginPage đã validate credentials.

---

## Relationships

```
users[] ──findByCredentials()──▶ User | undefined
                                        │
                                        ▼
                              AuthContext.login(user.id)
                                        │
                                        ▼
                              Session { userId } → localStorage
                                        │
                                        ▼
                              Header hiển thị user.displayName
```
