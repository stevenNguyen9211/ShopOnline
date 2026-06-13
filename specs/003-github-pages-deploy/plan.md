# Implementation Plan: GitHub Pages Auto-Deploy

**Branch**: `003-github-pages-deploy` | **Date**: 2026-06-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-github-pages-deploy/spec.md`

## Summary

Tự động build và deploy ứng dụng SimpleShop lên GitHub Pages mỗi khi push lên
branch `main`, có cổng chất lượng bắt buộc (build + CI regression test phải pass
trước khi deploy). Stack: GitHub Actions (3-job workflow), Vite CLI `--base` flag
cho sub-path, React Router `basename` từ `import.meta.env.BASE_URL`, Playwright
với `@ci` tag pattern để chọn happy path tests (~9 tests).

## Technical Context

**Language/Version**: TypeScript 5.8.3 (existing project)

**Primary Dependencies**:
- GitHub Actions — CI/CD platform (không thêm npm package)
- `actions/checkout@v4` — standard checkout
- `actions/setup-node@v4` — Node 20 LTS, `cache: 'npm'`
- `actions/upload-pages-artifact@v3` — upload dist/ làm GitHub Pages artifact
- `actions/configure-pages@v5` — cấu hình GitHub Pages environment
- `actions/deploy-pages@v4` — deploy artifact lên GitHub Pages
- `actions/upload-artifact@v4` — lưu Playwright report khi test fail
- Vite 6.3.5 (existing) — build với `--base=/shop-sdd/`
- `@playwright/test 1.60.0` (existing) — CI regression với `grep: /@ci/`

**Storage**: N/A — static site, không có persistent storage

**Testing**: `@playwright/test 1.60.0` — subset ~9 happy path tests tagged `@ci`
(vs 27 tests full suite locally)

**Target Platform**: GitHub Actions ubuntu-latest (CI), GitHub Pages (hosting)

**Project Type**: CI/CD workflow + build configuration cho existing SPA

**Performance Goals**:
- Build job + Test job (parallel): < 5 phút mỗi job
- Tổng pipeline (build+test+deploy): < 10 phút (SC-004)
- Site accessible sau push: < 5 phút (SC-001)

**Constraints**:
- Headless Chromium, không cần display server (ubuntu-latest)
- GITHUB_TOKEN tự động (không cần secret thêm)
- dist/ chỉ tồn tại trong CI, không commit vào repo
- Sub-path GitHub Pages: `https://<user>.github.io/shop-sdd/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Sạch | ✅ PASS | Workflow YAML và config files có tên mô tả |
| II. YAGNI | ✅ PASS | `--base` flag (không sửa vite.config.ts), `@ci` tag (không tạo file test riêng), 3-job workflow đủ gọn |
| III. UI Test Tự Động | ✅ PASS | CI regression dùng bộ Playwright hiện có |
| IV. Không Backend | ✅ PASS | GitHub Pages = static hosting, hoàn toàn client-side |
| V. UX Nhất Quán | N/A | Feature này là infra/CI, không có UI mới |
| VI. Kiểm Thử Có Kỷ Luật | ✅ PASS | Happy path only trên CI, full suite local; artifact lưu khi fail |
| VII. CI/CD Có Kiểm Soát | ✅ PASS | Feature này CHÍNH LÀ việc thực thi Constitution VII: fail fast (`needs:`), build tự động (dist/ không commit), deploy tự động (Pages API), test artifacts (upload-artifact on failure), regression happy path only (@ci subset), môi trường độc lập (headless ubuntu-latest) |

**Gate result: PASS** — không có vi phạm, không cần Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-github-pages-deploy/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code Changes

```text
# NEW FILES
.github/
└── workflows/
    └── deploy.yml              # GitHub Actions workflow (3 jobs: build, test, deploy)

playwright.ci.config.ts         # CI-specific Playwright config (grep: /@ci/)

# MODIFIED FILES
src/App.tsx                     # Line 22: add basename={import.meta.env.BASE_URL}

tests/us1-login.spec.ts         # Add @ci to 1 happy path test title
tests/us2-products.spec.ts      # Add @ci to 3 happy path test titles
tests/us3-add-to-cart.spec.ts   # Add @ci to 1 happy path test title
tests/us4-cart-management.spec.ts  # Add @ci to 1 happy path test title
tests/us5-checkout.spec.ts      # Add @ci to 3 happy path test titles (all in "US5 — Happy path")
```

### Workflow Architecture

```text
push to main
    │
    ├─► [JOB: build] ────────────────────────────────────────────────────┐
    │     npm ci                                                          │
    │     npm run build -- --base=/shop-sdd/          (tsc -b + vite)    │
    │     upload-pages-artifact (dist/)               → pages artifact    │
    │                                                                     │ needs: [build, test]
    ├─► [JOB: test] ─────────────────────────────────────────────────────┤
    │     npm ci                                                          │
    │     npx playwright install chromium --with-deps                     │
    │     npx playwright test --config playwright.ci.config.ts           │
    │       (starts npm run dev internally, grep: @ci → ~9 tests)        │
    │     on fail: upload-artifact playwright-report/                     │
    │                                                                     │
    └──────────────────────────────────────────────────────────────────► [JOB: deploy]
                                                                            configure-pages
                                                                            deploy-pages
                                                                            → https://<user>.github.io/shop-sdd/
```

### CI Config Detail

```typescript
// playwright.ci.config.ts
import { defineConfig } from '@playwright/test'
import baseConfig from './playwright.config'

export default defineConfig({
  ...baseConfig,
  grep: /@ci/,
})
```

### @ci Tagged Tests (Happy Path Subset)

| File | Test Title (with @ci prefix) | FR (feat-002 spec) |
|------|-----------------------------|--------------------|
| us1 | `@ci đăng nhập bằng thẻ Minh Nguyễn → /products, header hiển thị tên` | FR-001 |
| us2 | `@ci danh sách sản phẩm: đúng 6 card, mỗi card có đủ name/price/image/nút` | FR-002 |
| us2 | `@ci giá sản phẩm đúng định dạng VND (X.XXX ₫)` | FR-003 |
| us2 | `@ci ảnh sản phẩm có alt text bằng tên sản phẩm` | FR-002 |
| us3 | `@ci thêm sản phẩm lần đầu → badge từ 0 lên 1` | FR-004 |
| us4 | `@ci hiển thị đúng tên, giá đơn vị, số lượng, thành tiền, tổng` | FR-005 |
| us5 | `@ci nút Thanh toán → chuyển đến trang checkout` | FR-010 |
| us5 | `@ci checkout hợp lệ → trang xác nhận hiển thị tổng tiền khớp cart` | FR-012 |
| us5 | `@ci sau đặt hàng thành công → badge giỏ hàng về 0` | FR-013 |

**Total CI tests: 9** (vs 27 locally). Estimated runtime: 45-90 giây trên CI.

## Complexity Tracking

> Không có vi phạm constitution cần biện minh cho feature này.
