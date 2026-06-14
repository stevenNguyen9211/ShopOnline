# Tasks: Login Form với Username & Password

**Input**: Design documents từ `specs/005-login-form/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Organization**: Tasks nhóm theo user story. US1 test được độc lập (MVP). US2 thêm error
coverage sau khi US1 hoàn thành. Không tạo file mới — tất cả là MODIFY.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể chạy song song (file khác nhau, không dependency lẫn nhau)
- **[Story]**: US1 = đăng nhập thành công, US2 = thông báo lỗi
- File paths tương đối từ repo root

---

## Phase 1: Foundational — Data Layer

**Purpose**: Cập nhật data model — blocking prerequisite cho cả US1 và US2 vì `LoginPage.tsx`
cần import `findByCredentials` từ `users.ts`.

- [x] T001 Update `src/data/users.ts` — thêm field `password: string` vào `User` type;
  thêm `password: '123'` vào cả 3 users; thêm pure function `findByCredentials(username: string, password: string): User | undefined` (exact match, case-sensitive, no trim):
  ```typescript
  export type User = { id: string; displayName: string; password: string }

  export const users: User[] = [
    { id: 'minh', displayName: 'Minh Nguyễn', password: '123' },
    { id: 'lan',  displayName: 'Lan Trần',    password: '123' },
    { id: 'hung', displayName: 'Hùng Phạm',   password: '123' },
  ]

  export function findByCredentials(username: string, password: string): User | undefined {
    return users.find((u) => u.id === username && u.password === password)
  }
  ```

**Checkpoint**: `npx tsc --noEmit` phải pass sau T001.

---

## Phase 2: User Story 1 — Đăng nhập thành công bằng form (Priority: P1) 🎯 MVP

**Goal**: Thay UI click-to-select bằng form username/password. Login thành công → trang sản phẩm.

**Independent Test**: `loginAsUser('minh')` (không truyền password) → chuyển tới `/products`,
header hiển thị "Minh Nguyễn". Chạy `npx playwright test tests/us1-login.spec.ts --headed`.
us4 và us5 cũng phải pass mà không cần sửa nội dung test.

- [x] T002 [US1] Update `src/pages/LoginPage.tsx` — xóa toàn bộ UI click-to-select (button list,
  avatar); thêm form với local state `username`, `password`, `error`; implement `handleSubmit`
  (validate trống → sai credentials → login + navigate); xóa import `users`, thêm import
  `findByCredentials`; `<form onSubmit>` để Enter-to-submit hoạt động; data-testids:
  `login-username` (input text), `login-password` (input password), `login-submit` (button),
  `login-error` (thông báo lỗi, chỉ render khi error !== null); error messages:
  `'Vui lòng điền đầy đủ thông tin'` khi trống, `'Tên đăng nhập hoặc mật khẩu không đúng'` khi sai;
  xóa `login-user-minh/lan/hung` testids.

- [x] T003 [P] [US1] Update `src/pages/LoginPage.module.css` — xóa class `.userList`, `.userBtn`,
  `.avatar`; giữ nguyên `.page`, `.card`, `.title`, `.subtitle`; thêm classes mới dùng CSS tokens:
  `.form` (flex column, gap: var(--space-4)),
  `.field` (display flex, flex-direction column, gap: var(--space-1), text-align left),
  `.label` (font-size var(--font-sm), color var(--color-text-muted)),
  `.input` (width 100%, padding var(--space-3), border 1px solid var(--color-border),
  border-radius var(--radius-md), font-size var(--font-base)),
  `.input:focus` (border-color var(--color-primary), outline none),
  `.inputError` (border-color var(--color-danger)),
  `.submitBtn` (width 100%, padding var(--space-3), background var(--color-primary),
  color #fff, border none, border-radius var(--radius-md), font-size var(--font-base),
  font-weight var(--font-bold), cursor pointer),
  `.submitBtn:hover` (background var(--color-primary-hover)),
  `.errorMsg` (color var(--color-danger), font-size var(--font-sm), margin-top var(--space-2))

- [x] T004 [P] [US1] Update `pages/LoginPage.ts` — thay toàn bộ PO để dùng testids mới; thêm
  locators: `usernameInput` (getByTestId 'login-username'), `passwordInput` (getByTestId
  'login-password'), `submitButton` (getByTestId 'login-submit'), `errorMessage` (getByTestId
  'login-error'); cập nhật `loginAsUser(userId: string, password = '123')` để fill form thay
  vì click button (fill username → fill password → click submit → waitForURL '**/products');
  thêm methods: `fillUsername(u)`, `fillPassword(p)`, `submit()`, `getErrorMessage()`;
  xóa method `userButton(userId)` (UI cũ bị xóa); giữ `isAt()`.

**Checkpoint**: `npx playwright test tests/us1-login.spec.ts tests/us4-cart-management.spec.ts tests/us5-checkout.spec.ts --headed` — tất cả pass.

---

## Phase 3: User Story 2 — Thông báo lỗi khi đăng nhập sai (Priority: P2)

**Goal**: Thêm test coverage cho error scenarios. Implementation đã có trong T002.

**Independent Test**: `npx playwright test tests/us1-login.spec.ts -g "lỗi" --headed` — test
error path pass, hiển thị đúng thông báo lỗi, ở lại `/login`.

- [x] T005 [US2] Update `tests/us1-login.spec.ts` — thêm `test.describe('US1 — Form error paths')`
  sau describe block hiện tại; thêm các test `@ci`:
  - `'@ci sai password → thông báo lỗi, ở lại /login'`: fillUsername('minh') + fillPassword('sai') + submit() → expect errorMessage.textContent() === 'Tên đăng nhập hoặc mật khẩu không đúng' + expect(page).toHaveURL(/\/login/)  # FR-005
  - `'@ci username không tồn tại → thông báo lỗi, ở lại /login'`: fillUsername('admin') + fillPassword('123') + submit() → cùng error message  # FR-005
  - `'@ci trường trống → thông báo lỗi, ở lại /login'`: submit() ngay (không điền gì) → expect errorMessage.textContent() === 'Vui lòng điền đầy đủ thông tin'  # FR-006
  - Mỗi test PHẢI có comment `# FR-00X` để truy xuất requirement (constitution VI)

**Checkpoint**: `npx playwright test tests/us1-login.spec.ts` — bao gồm cả happy path và error
path, tất cả pass.

---

## Phase 4: Polish & Validation

- [x] T006 TypeScript check — `npx tsc --noEmit` phải pass không có error (verify T001-T004 đúng types)

- [x] T007 Full test suite — `npx playwright test` chạy toàn bộ (us1 + us4 + us5); xác nhận
  không có regression; chạy Kịch bản 1, 2, 3, 4 từ `specs/005-login-form/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: T001 — không dependencies, bắt đầu ngay
- **US1 (Phase 2)**: T002, T003, T004 — đều depends on T001 (T002 import findByCredentials,
  T003 phải biết class names T002 dùng, T004 phải biết testids T002 khai báo)
- **US2 (Phase 3)**: T005 — depends on T002 + T004 (implementation và PO phải hoàn chỉnh)
- **Polish (Phase 4)**: T006, T007 — depends on T001-T005

### Parallel Opportunities

Sau khi T001 và T002 hoàn thành:

- **T003 [P] + T004 [P]** có thể chạy song song — file khác nhau, không dependency lẫn nhau:
  - T003: `src/pages/LoginPage.module.css`
  - T004: `pages/LoginPage.ts`

### Sequential Must

```
T001 → T002 → [T003 || T004] → T005 → [T006 || T007]
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. T001: Update data layer (`users.ts`)
2. T002: Implement form UI (`LoginPage.tsx`)
3. T003 + T004 (song song): CSS + PO
4. **STOP và VALIDATE**: `loginAsUser('minh')` pass, us4/us5 không vỡ

Tại thời điểm này: login form hoạt động hoàn chỉnh, ứng dụng dùng được.

### Incremental (US2)

5. T005: Thêm error path tests → xác nhận error messages đúng
6. T006 + T007: TypeScript + full suite

---

## Notes

- **Không tạo file mới**: Tất cả 5 files đều là MODIFY
- **Backward compatible**: `loginAsUser(userId)` (không truyền password) vẫn hoạt động — us4/us5 không cần sửa
- **Breaking testids**: `login-user-minh/lan/hung` bị xóa — breaking change có chủ ý (FR-009)
- **AuthContext không đổi**: `login(userId)` giữ nguyên signature; LoginPage gọi sau khi validate
- **Tổng số tasks**: 7 tasks (1 foundational + 3 US1 + 1 US2 + 2 polish)
