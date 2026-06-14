# Implementation Plan: Real User Authentication

**Branch**: `006-real-auth` | **Date**: 2026-06-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-real-auth/spec.md`

## Summary

Thay thế cơ chế xác thực mock (mảng tĩnh trong `src/data/users.ts`) bằng truy
vấn trực tiếp đến bảng `public.users` trên Supabase thông qua `@supabase/supabase-js`
client. Chỉ có SELECT — plain text comparison — không có Supabase Auth. UI giữ
nguyên hoàn toàn; chỉ thay đổi lớp data access, AuthContext, và LoginPage.

**Schema thực tế** (đã xác minh qua Supabase MCP):
- Bảng: `public.users`
- Cột: `id` (integer PK), `username` (varchar unique, login credential),
  `password` (varchar plain text), `created_at` (timestamptz, không dùng)
- Test data: `oliver_hayes/123`, `charlotte_reed/123`, `james_thornton/123`

> ⚠️ **Ghi chú spec**: Clarification session chọn option A (`id` là login
> credential, có cột `display_name`) nhưng schema thực tế dùng `username`
> làm login credential và không có `display_name`. Plan này phản ánh schema
> thực tế. Spec đã được cập nhật trong mục Clarifications.

> ⚠️ **Bảo mật (RLS)**: `public.users` chưa bật Row Level Security — bất kỳ
> ai có anon key đều có thể đọc toàn bộ bảng. Đây là vấn đề cần biết nhưng
> **không sửa** trong feature này theo Nguyên tắc IX (schema cố định). Anon
> key dùng trong browser sẽ expose trong JS bundle — chấp nhận cho học tập.

## Technical Context

**Language/Version**: TypeScript 5.8 / React 19

**Primary Dependencies**: React Router DOM 7, `@supabase/supabase-js` (mới —
xem Complexity Tracking), Vite 6

**Storage**: Supabase PostgreSQL (read-only SELECT), localStorage (session)

**Testing**: Playwright 1.60 (E2E, Page Object Model)

**Target Platform**: Browser SPA (Vite + React), deploy GitHub Pages

**Performance Goals**: Login response < 3s (mạng bình thường)

**Constraints**: Plain text password comparison (Nguyên tắc VIII); chỉ SELECT
trên `public.users` (Nguyên tắc IX); không Supabase Auth; không thay đổi UI

**Scale/Scope**: 3 users trong DB học tập; 1 luồng auth duy nhất

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Trạng thái | Ghi chú |
|---|---|---|
| I. Code Sạch | ✅ Pass | Service layer nhỏ gọn, tên hàm mô tả rõ |
| II. Đơn Giản (YAGNI) | ✅ Pass với biện minh | 1 dependency mới — xem Complexity Tracking |
| III. UI Testable | ✅ Pass | `data-testid` hiện tại giữ nguyên; button text thay đổi testable qua `textContent` |
| IV. Không Backend Thật | ✅ Pass (ngoại lệ IX) | Ngoại lệ đã ghi rõ trong constitution v1.3.0 |
| V. UX Nhất Quán | ✅ Pass | Loading state nhất quán với nguyên tắc thiết kế |
| VI. Test Có Kỷ Luật | ✅ Pass | POM giữ nguyên; credentials trong test cập nhật sang thật |
| VII. CI/CD Có Kiểm Soát | ✅ Pass với task | Cần thêm 2 GitHub Secrets cho CI build/test |
| VIII. Plain Text Password | ✅ Pass | So sánh `===` trực tiếp, không hashing |
| IX. Schema Cố Định | ✅ Pass | Chỉ `SELECT id, username, password FROM public.users WHERE username = $1` |

**Kết quả gate**: ✅ Tất cả pass — tiến hành Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/006-real-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── supabase-query.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── supabase.ts      # NEW — Supabase client singleton
│   ├── storage.ts       # unchanged
│   └── format.ts        # unchanged
├── data/
│   └── users.ts         # MODIFY — replace mock array with async Supabase query
├── context/
│   └── AuthContext.tsx  # MODIFY — async login(), updated User type + session shape
├── pages/
│   └── LoginPage.tsx    # MODIFY — async handleSubmit + loading state
└── components/
    └── Header.tsx       # MODIFY — user?.username replaces user?.displayName

tests/
└── us1-login.spec.ts    # MODIFY — update credentials to real DB users

.env.local               # NEW (gitignored) — Supabase env vars
```

**Structure Decision**: Web SPA (single project). Không tạo thư mục mới. Supabase
client đặt trong `src/lib/` theo pattern hiện có. Data access giữ trong
`src/data/users.ts` nhưng async thay vì đồng bộ.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Thêm `@supabase/supabase-js` | Kết nối Supabase để query `public.users` | Không có alternative — feature yêu cầu Supabase client; fetch thuần không handle Supabase auth header và response format |
