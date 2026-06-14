# Contract: Supabase Query — findByCredentials

**Feature**: 006-real-auth | **File**: `src/data/users.ts`

## Interface

```typescript
findByCredentials(username: string, password: string): Promise<User | null>
```

### Input

| Parameter | Type | Constraint |
|-----------|------|-----------|
| `username` | string | Đã trim; không rỗng (validated trước khi gọi) |
| `password` | string | Không rỗng (validated trước khi gọi) |

### Output

| Value | Khi nào |
|-------|---------|
| `User` | Username tồn tại trong DB VÀ password khớp |
| `null` | Username không tồn tại HOẶC password không khớp |
| `throw Error` | Lỗi kết nối Supabase hoặc lỗi mạng |

### Behavior Contract

1. Query `public.users` với `username = $1` (case-sensitive)
2. Nếu không tìm thấy row → return `null`
3. Nếu tìm thấy row → so sánh `row.password === password` (plain text, Nguyên tắc VIII)
4. Nếu password không khớp → return `null`
5. Nếu password khớp → return `{ id: row.id, username: row.username }`
6. Nếu Supabase trả error → throw (caller xử lý)

### SQL được thực thi

```sql
SELECT id, username, password
FROM public.users
WHERE username = $1
LIMIT 1
```

*Không có INSERT/UPDATE/DELETE — Nguyên tắc IX.*

---

## AuthContext.login Contract

```typescript
login(user: User): void
```

| Step | Action |
|------|--------|
| 1 | `storageSet(KEYS.session, { userId: user.id, username: user.username })` |
| 2 | `setUser(user)` |

---

## AuthContext.loadUser Contract

```typescript
loadUser(): User | null
```

| Điều kiện | Kết quả |
|-----------|---------|
| `KEYS.session` không có trong localStorage | `null` |
| Session có `userId` + `username` | `{ id: session.userId, username: session.username }` |

*Không gọi DB — đọc từ localStorage cache.*
