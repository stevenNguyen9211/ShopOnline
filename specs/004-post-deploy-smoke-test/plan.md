# Implementation Plan: Post-Deploy Smoke Test

**Branch**: `004-post-deploy-smoke-test` | **Date**: 2026-06-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-post-deploy-smoke-test/spec.md`

## Summary

Thêm job `smoke-test` vào workflow CI/Deploy hiện có (`.github/workflows/deploy.yml`) với
`needs: deploy`. Job này chờ deploy thành công, sleep 30 giây cho CDN propagate, rồi
chạy lại 9 happy path tests đã tag `@ci` — nhưng với `baseURL` trỏ đến live GitHub Pages
URL thay vì localhost. Cần một `playwright.smoke.config.ts` mới override `baseURL` và tắt
`webServer`. Khi smoke test fail, artifact upload lên GitHub Actions và commit/PR hiển thị ❌.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (Playwright config), YAML (GitHub Actions workflow)

**Primary Dependencies**:
- `@playwright/test` ^1.60.0 — đã cài, đã có `playwright.ci.config.ts` làm reference
- `actions/upload-artifact@v4` — đã dùng trong job `test` hiện tại
- `actions/checkout@v4`, `actions/setup-node@v4` — đã dùng trong các job khác

**Storage**: N/A

**Testing**: Playwright 1.60.0; cần `playwright.smoke.config.ts` mới (parallel với `playwright.ci.config.ts`)

**Target Platform**: GitHub Actions `ubuntu-latest` → Chromium headless → live GitHub Pages URL

**Performance Goals**: Smoke test hoàn thành ≤ 5 phút (FR-008 / SC-004)

**Constraints**:
- Headless, no display server (FR-006 / Constitution VII)
- `webServer` phải bị tắt trong smoke config — không start dev server khi test live URL
- `needs: deploy` tự động đảm bảo FR-007 (deploy fail → smoke-test không chạy)
- Không thay đổi behavior của job `build`, `test`, `deploy` hiện có

**Scale/Scope**: 9 @ci tests, 1 browser (Chromium), 1 job mới trong deploy.yml

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Note |
|-----------|-------------|--------|------|
| I — Clean Code | Config rõ ràng, không có magic values | ✅ PASS | smoke config extend base, chỉ override cần thiết |
| II — YAGNI | Không thêm abstraction không cần thiết | ✅ PASS | 1 config file + 1 job — minimal |
| III — UI Testable | Reuse `@ci` tests với `data-testid` locator | ✅ PASS | Không viết test mới, reuse POM-based tests |
| IV — No Backend | N/A (CI workflow) | ✅ PASS | |
| V — Consistent UX | N/A (CI workflow) | ✅ PASS | |
| VI — Testing Discipline | Reuse POM, FR traceability, @ci tags | ✅ PASS | Tests đã có FR comments từ feature 002 |
| VII — CI/CD Controlled | Fail fast (`needs:`), artifacts on fail, headless | ✅ PASS | Tất cả requirements của Principle VII đáp ứng đủ |

**All gates PASS. Không có vi phạm cần justify.**

## Project Structure

### Documentation (this feature)

```text
specs/004-post-deploy-smoke-test/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← /speckit-tasks output (chưa tạo)
```

Không có `data-model.md` (không có data entities — pure CI workflow).
Không có `contracts/` (internal CI plumbing — không có external interface).

### Source Code (changes for this feature)

```text
playwright.smoke.config.ts       ← NEW: Playwright config cho smoke test live site
.github/workflows/deploy.yml     ← MODIFIED: thêm job smoke-test sau deploy
```

**Structure Decision**: Minimal — 1 file mới + 1 file modified. Không tạo thư mục mới.
Reuse toàn bộ `tests/` và `src/pages/` (POM) từ feature 002.

## Workflow Architecture

```
push to main
     │
     ▼
┌────────────┐    ┌────────────┐
│   build    │    │    test    │  ← parallel (pre-deploy gate, localhost)
│  (dist/)   │    │  (@ci)     │
└─────┬──────┘    └─────┬──────┘
      │                 │
      └────────┬─────────┘
               │ needs: [build, test]
               ▼
         ┌──────────┐
         │  deploy  │  ← GitHub Pages deployment
         └─────┬────┘
               │ needs: deploy
               ▼
        ┌─────────────┐
        │ smoke-test  │  ← live URL (@ci, GitHub Pages)
        └─────────────┘
```

**4-job pipeline**: `build` + `test` → `deploy` → `smoke-test`

Smoke-test là job cuối. Nếu fail: commit/PR hiển thị ❌ nhưng **không rollback** deploy
đã xảy ra — đây là behavior đúng theo spec (báo cáo, không undeploy).

## Smoke Config Detail

```typescript
// playwright.smoke.config.ts
import { defineConfig } from '@playwright/test'
import baseConfig from './playwright.config'

export default defineConfig({
  ...baseConfig,
  grep: /@ci/,
  webServer: undefined,    // tắt dev server — test trực tiếp live URL
  use: {
    ...baseConfig.use,
    baseURL: 'https://stevennguyen9211.github.io/ShopOnline/',
  },
})
```

**Key differences từ `playwright.ci.config.ts`:**

| Setting | `playwright.ci.config.ts` | `playwright.smoke.config.ts` |
|---------|--------------------------|------------------------------|
| `grep` | `/@ci/` | `/@ci/` |
| `retries` | kế thừa base (2 khi CI=true) | kế thừa base (2 khi CI=true) |
| `baseURL` | localhost (base config) | `https://stevennguyen9211.github.io/ShopOnline/` |
| `webServer` | kế thừa base (start dev server) | `undefined` — tắt hoàn toàn |

**Lý do `webServer: undefined`**: Base config có `webServer` start `npm run dev`. Nếu không
override, Playwright sẽ cố start dev server trước khi test — sai với mục đích smoke test
(cần test live URL, không phải localhost).

**Lý do không override `retries`**: Base config đã có `retries: process.env.CI ? 2 : 0`.
Khi smoke-test job chạy với `env: CI: true`, retries=2 được kế thừa tự động.

## CDN Propagation Strategy

**Quyết định**: 30-second fixed `sleep` trước Playwright + `retries: 2` kế thừa từ base config.

- `sleep 30`: GitHub Pages CDN thường propagate trong 10–30 giây sau khi `actions/deploy-pages@v4` hoàn thành
- `retries: 2`: Safety net cho CDN response chậm thoáng qua — 3 attempts tổng (1 + 2 retries)
- Time budget: 30s sleep + ~2 phút test × 3 attempts = ~4 phút max → well within FR-008 (5 phút)

Không dùng polling loop (complex shell, violates Principle II).

## Smoke-Test Job (deploy.yml addition)

```yaml
  smoke-test:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - name: Wait for GitHub Pages CDN propagation
        run: sleep 30
      - run: npx playwright test --config playwright.smoke.config.ts
        env:
          CI: true
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: smoke-report-${{ github.run_id }}
          path: playwright-report/
          retention-days: 7
```

**Lý do `smoke-report-*` (không phải `playwright-report-*`)**: Phân biệt rõ failure source —
developer nhìn artifact name biết ngay là pre-deploy test hay post-deploy smoke test.

## @ci Tests Reused (9 tests)

Smoke test chạy lại chính xác 9 tests đã tag `@ci` — không viết test mới:

| File | Test Title | FR (feat-002 spec) |
|------|-----------|-------------------|
| us1-login.spec.ts | @ci đăng nhập bằng thẻ Minh Nguyễn → /products, header hiển thị tên | FR-001 |
| us2-products.spec.ts | @ci danh sách sản phẩm: đúng 6 card, mỗi card có đủ name/price/image/nút | FR-002 |
| us2-products.spec.ts | @ci giá sản phẩm đúng định dạng VND (X.XXX ₫) | FR-002 |
| us2-products.spec.ts | @ci ảnh sản phẩm có alt text bằng tên sản phẩm | FR-002 |
| us3-add-to-cart.spec.ts | @ci thêm sản phẩm lần đầu → badge từ 0 lên 1 | FR-003 |
| us4-cart-management.spec.ts | @ci hiển thị đúng tên, giá đơn vị, số lượng, thành tiền, tổng | FR-004 |
| us5-checkout.spec.ts | @ci nút Thanh toán → chuyển đến trang checkout | FR-005 |
| us5-checkout.spec.ts | @ci checkout hợp lệ → trang xác nhận hiển thị tổng tiền khớp cart | FR-005 |
| us5-checkout.spec.ts | @ci sau đặt hàng thành công → badge giỏ hàng về 0 | FR-005 |

Phủ đúng FR-003: đăng nhập ✅, thêm vào giỏ ✅, checkout ✅.

## Complexity Tracking

> Không có vi phạm Constitution. Bảng này để trống theo quy định.
