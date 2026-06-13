# Research: Bộ kiểm thử tự động E2E cho SimpleShop

**Date**: 2026-06-13 | **Plan**: [plan.md](plan.md)

## R1: Framework — Playwright Test + TypeScript

**Decision**: @playwright/test ^1.45 với TypeScript strict mode

**Rationale**: Người dùng đã chỉ định. Playwright là lựa chọn tốt nhất cho dự án
học tập vì: API async/await rõ ràng, assertions tích hợp sẵn (`expect`), trình
chạy test tích hợp (không cần Jest/Mocha riêng), fixtures pattern mạnh, HTML
reporter tích hợp sẵn, và multi-browser từ một codebase. 1 dependency duy nhất.

**Alternatives considered**:
- Cypress: phổ biến nhưng không hỗ trợ fixtures pattern kiểu Playwright; mô hình
  callback khó hơn async/await cho người học.
- WebdriverIO: tốt nhưng phức tạp hơn, cần thêm nhiều config.
- Selenium + TypeScript: cũ, không native async/await, cần WebDriver server riêng.

## R2: Cấu trúc thư mục

**Decision**: `tests/`, `pages/`, `fixtures/`, `playwright.config.ts` tại repo
root (cùng cấp với `src/`). Playwright thêm vào `package.json` hiện có.

**Rationale**:
- Khớp với cấu trúc người dùng yêu cầu
- Khớp với output của `npm init playwright@latest`
- 1 lệnh `npm install`, 1 `node_modules/`, không subproject riêng
- `src/` (app code) và `tests/` (test code) tách biệt rõ ràng ở cùng cấp
- `tsconfig.app.json` đã có `"include": ["src"]` → không pick up test files

**Cần thêm**: `tsconfig.e2e.json` để IDE hiểu path `pages/`, `fixtures/`,
`tests/` (Playwright tự compile TS nội bộ, tsconfig này chỉ cho IDE).

**Alternatives considered**:
- `e2e/` subdirectory với package.json riêng: tách biệt hoàn toàn nhưng thêm
  độ phức tạp (2 package.json, 2 node_modules). Không cần cho học tập.
- `src/__tests__/`: sai — trộn lẫn app source với test code.

## R3: Auth Fixture — UI Login (không dùng storageState)

**Decision**: Custom Playwright fixture `loggedIn` thực hiện đăng nhập qua UI
(bấm `login-user-minh`). KHÔNG dùng `storageState` file hay `globalSetup` để
inject localStorage trực tiếp.

**Rationale**: Spec clarification Q2 rõ ràng: "Toàn bộ qua UI — không can thiệp
trực tiếp localStorage." Đăng nhập qua UI:
- Tuân thủ FR-004 và spec clarification Q2
- Tự nhiên kiểm chứng luồng login như precondition (miễn phí)
- App chạy local (localhost:5173, Vite) → đủ nhanh (< 2 giây)
- Không coupling vào schema localStorage nội bộ (tránh rò rỉ implementation detail)

**Implementation**: `test.extend()` tạo fixture `loggedIn`; fixture setup gọi
`new LoginPage(page).loginAsUser('minh')` trước mỗi test.

**Alternatives considered**:
- `storageState` file: nhanh hơn ~1 giây nhưng bypass UI → vi phạm spec Q2.
- `globalSetup` + `storageState`: cùng vấn đề trên.

## R4: Multi-browser Configuration

**Decision**: `playwright.config.ts` khai báo 3 Playwright projects:
- `chromium` — ACTIVE, chạy mặc định (theo spec clarification Q1)
- `firefox` — COMMENTED OUT (config sẵn, bật bằng cách bỏ comment)
- `webkit` — COMMENTED OUT (config sẵn, bật bằng cách bỏ comment)

**Rationale**: Spec Q1 giới hạn "Chỉ Chrome/Chromium." Người dùng đồng thời
yêu cầu "cấu hình chạy đa trình duyệt" trong plan input. Giải pháp:
Chromium là project duy nhất active; Firefox + WebKit config comment-out → bật
dễ dàng, chi phí runtime = 0 khi tắt. Dạy được khái niệm Playwright projects.

**Complexity Tracking**: Mở rộng nhỏ so với spec Chrome-only; ghi trong
Complexity Tracking của plan.md.

**Alternatives considered**:
- Chromium only, không config Firefox/WebKit: đơn giản nhất nhưng mất cơ hội
  học multi-browser config với 3 dòng uncomment.

## R5: Tổ chức test file theo User Story

**Decision**: 1 file per user story → 5 files trong `tests/`:
`us1-login.spec.ts`, `us2-products.spec.ts`, `us3-add-to-cart.spec.ts`,
`us4-cart-management.spec.ts`, `us5-checkout.spec.ts`

**Rationale**: Khớp với spec US1–US5; mỗi file là 1 luồng nghiệp vụ hoàn chỉnh;
đọc và tìm test dễ; Playwright chạy parallel theo file (mỗi file = 1 worker) →
song song tự nhiên mà không cần config thêm.

**Alternatives considered**:
- 1 file per page: không phản ánh luồng nghiệp vụ; ít học được hơn.
- 1 file duy nhất: không song song được; file quá lớn.

## R6: Page Object — Plain Class, không Base Class

**Decision**: Mỗi Page Object là plain TypeScript class. Constructor nhận
`page: Page`. Methods return `Promise<void>` (hoặc `Promise<T>` khi cần giá
trị). KHÔNG có BasePage class chung.

**Rationale**: 5 classes là quá ít để justify inheritance (YAGNI — Constitution
II). Mỗi trang có cấu trúc khác nhau, không có đủ behavior chung để share qua
base class. Plain class rõ ràng nhất cho người học.

**Locator pattern**: `this.page.getByTestId('...')` — khớp Constitution III và
ui-contract.md. Locators khai báo tại constructor (lazy, Playwright tự resolve).

**Alternatives considered**:
- `BasePage` với `navigate()`, `waitForLoad()`: premature abstraction.
- Module-level singleton: mất isolation giữa các test.

## R7: Quản lý App Server — webServer config

**Decision**: `playwright.config.ts` dùng `webServer`:
```ts
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
}
```

**Rationale**: Tự động khởi Vite dev server trước khi chạy test; không cần nhớ
mở terminal riêng. `reuseExistingServer: true` khi dev local (server đã chạy sẵn
thì dùng lại); `false` khi CI (luôn khởi server fresh).

**Alternatives considered**:
- Manual start, tài liệu trong README: dễ quên, dễ port mismatch.
- Preview build (`npm run build && npm run preview`): chậm hơn, không cần thiết.

## R8: Reporter — HTML + List

**Decision**: `reporter: [['html'], ['list']]`
- `html`: tạo `playwright-report/` — xem chi tiết, ảnh chụp lúc fail, trace.
  Mở bằng `npx playwright show-report`.
- `list`: in kết quả real-time ra terminal khi chạy.

`playwright-report/` phải thêm vào `.gitignore`.

**Alternatives considered**:
- `dot`: quá tối giản; `junit`: chỉ cần cho CI tool integration.

## R9: TypeScript Config cho IDE

**Decision**: Thêm `tsconfig.e2e.json` tại repo root. Playwright compile TypeScript
nội bộ bằng esbuild — không cần ts-node hay tsc khi chạy test.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "types": ["@playwright/test"]
  },
  "include": ["tests/**/*", "pages/**/*", "fixtures/**/*"]
}
```

**Rationale**: File này chỉ phục vụ IDE (VS Code type checking + autocomplete
cho Playwright types). Tránh conflict với `tsconfig.app.json` (Vite app).

**Alternatives considered**:
- Chỉnh `tsconfig.json` gốc: có thể ảnh hưởng Vite build.
- Bỏ qua hoàn toàn: IDE mất autocomplete cho Playwright API.
