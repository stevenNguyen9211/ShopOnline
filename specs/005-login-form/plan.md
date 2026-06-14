# Implementation Plan: Login Form với Username & Password

**Branch**: `005-login-form` | **Date**: 2026-06-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification từ `specs/005-login-form/spec.md`

## Summary

Thay thế màn hình đăng nhập click-to-select bằng form username/password. Thay đổi tập
trung vào 3 layer: data (thêm `password` vào `users.ts`), UI (`LoginPage.tsx` + CSS),
và test (`pages/LoginPage.ts` PO + `us1-login.spec.ts`). Không cần thêm dependency mới.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18

**Primary Dependencies**: React (useState, useNavigate), React Router DOM — tất cả đã có sẵn

**Storage**: Mock data trong `src/data/users.ts` (in-memory array)

**Testing**: Playwright với Page Object Model

**Target Platform**: SPA chạy trên GitHub Pages (sub-path `/ShopOnline/`)

**Performance Goals**: Instantaneous — mock validation không có I/O

**Constraints**: Không thêm dependency mới; giữ nguyên `AuthContext.login(userId)` signature

**Scale/Scope**: 3 users, 1 form, ~5 files thay đổi

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Sạch | ✅ PASS | Tên rõ nghĩa: `findByCredentials`, `login-username`, `login-error` |
| II. YAGNI | ✅ PASS | Không thêm library; `AuthContext` không đổi; default password trong PO |
| III. UI Test | ✅ PASS | 4 testid mới: `login-username`, `login-password`, `login-submit`, `login-error` |
| IV. No Backend | ✅ PASS | Password là string giả lập trong `users.ts` |
| V. UX Nhất quán | ✅ PASS | Dùng CSS variables từ `tokens.css`; giữ `.card`, `.title`, `.subtitle` |
| VI. Test Kỷ luật | ✅ PASS | POM updated; happy path + error path; FR reference trong test |
| VII. CI/CD | ✅ PASS | Không thay đổi pipeline; smoke test coverage giữ nguyên |

**Gate**: ✅ Tất cả principles PASS — không cần Complexity Tracking.

## Project Structure

### Documentation (feature này)

```text
specs/005-login-form/
├── plan.md             ✅ File này
├── research.md         ✅ 7 quyết định kỹ thuật
├── data-model.md       ✅ User entity + LoginFormState
├── quickstart.md       ✅ 7 kịch bản validation
├── contracts/
│   └── ui-contract.md  ✅ data-testid contract + PO interface
└── tasks.md            (tạo bởi /speckit-tasks)
```

### Source Code — Files cần thay đổi

```text
src/
  data/
    users.ts              MODIFY — thêm password field + findByCredentials()
  pages/
    LoginPage.tsx         MODIFY — thay UI click-to-select → form
    LoginPage.module.css  MODIFY — xóa .userList/.userBtn/.avatar, thêm form styles

pages/
  LoginPage.ts            MODIFY — cập nhật PO locators + loginAsUser()

tests/
  us1-login.spec.ts       MODIFY — thêm test cases cho US2 (error path)
  (us4, us5 không đổi nội dung — PO update là đủ)
```

**Không tạo file mới** — tất cả thay đổi trong file hiện có.

## Implementation Detail

### 1. `src/data/users.ts` — Thêm password + findByCredentials

```typescript
export type User = {
  id: string
  displayName: string
  password: string          // MỚI
}

export const users: User[] = [
  { id: 'minh', displayName: 'Minh Nguyễn', password: '123' },
  { id: 'lan',  displayName: 'Lan Trần',    password: '123' },
  { id: 'hung', displayName: 'Hùng Phạm',   password: '123' },
]

// MỚI — pure function, exact match, case-sensitive, no trim
export function findByCredentials(username: string, password: string): User | undefined {
  return users.find((u) => u.id === username && u.password === password)
}
```

### 2. `src/pages/LoginPage.tsx` — Form UI

Thay toàn bộ phần return JSX. State: `username`, `password`, `error`.

Key behaviors:
- `handleSubmit`: validate không trống → `findByCredentials` → login + navigate hoặc setError
- Input `onChange`: xóa error khi user bắt đầu nhập lại
- `<form onSubmit>` để Enter-to-submit hoạt động tự nhiên
- 2 error messages: `'Vui lòng điền đầy đủ thông tin'` khi trống, `'Tên đăng nhập hoặc mật khẩu không đúng'` khi sai

### 3. `src/pages/LoginPage.module.css` — Form styles

Xóa: `.userList`, `.userBtn`, `.avatar`

Thêm:
- `.form` — flex column, gap
- `.field` — label + input group
- `.label` — visible label trên input (accessible)
- `.input` — full width, border, padding, border-radius từ tokens
- `.input:focus` — border-color primary
- `.inputError` — border-color danger (khi có lỗi)
- `.submitBtn` — full width, primary color (giống nút "Thêm vào giỏ")
- `.errorMsg` — màu `--color-danger`, margin top

### 4. `pages/LoginPage.ts` — Playwright Page Object

Xem chi tiết trong [contracts/ui-contract.md](contracts/ui-contract.md).

Thay đổi chính: thêm `usernameInput`, `passwordInput`, `submitButton`, `errorMessage` locators.
`loginAsUser(userId, password = '123')` fill form thay vì click button — backward compatible.

### 5. `tests/us1-login.spec.ts` — Thêm US2 error path

Các test `@ci` hiện tại (US1 happy path) không thay đổi — `loginAsUser` vẫn hoạt động.

Thêm `test.describe('US1 — Form error paths')` với các test `@ci`:
- Sai credentials → error message `'Tên đăng nhập hoặc mật khẩu không đúng'`
- Trường trống → error message `'Vui lòng điền đầy đủ thông tin'`

## Complexity Tracking

*Không có vi phạm constitution — bảng này để trống theo quy ước.*
