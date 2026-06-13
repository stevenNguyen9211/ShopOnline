# Tasks: GitHub Pages Auto-Deploy

**Input**: Design documents from `specs/003-github-pages-deploy/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | quickstart.md ✅

**Organization**: Tasks grouped by user story. US1 is independently deployable (MVP).
No test tasks — this feature configures CI for the existing Playwright suite.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no blocking dependencies)
- **[Story]**: Traceability to user story in spec.md
- File paths are absolute-safe — all relative to repo root

---

## Phase 1: Setup

**Purpose**: Create CI-specific config files that both US1 and US2 depend on.

- [x] T001 Create `playwright.ci.config.ts` at repo root — extend base config with `grep: /@ci/`:
  ```typescript
  import { defineConfig } from '@playwright/test'
  import baseConfig from './playwright.config'
  export default defineConfig({ ...baseConfig, grep: /@ci/ })
  ```

**Checkpoint**: `playwright.ci.config.ts` exists and is valid TypeScript. Running
`npx playwright test --config playwright.ci.config.ts` locally should skip all tests
(no @ci tags yet) and exit with 0.

---

## Phase 2: Foundational

**Purpose**: Fix React Router base path so the deployed app works at the GitHub Pages sub-path.
This MUST be done before any deploy can be verified end-to-end.

**⚠️ CRITICAL**: Without this, all routes 404 on GitHub Pages after the initial load.

- [x] T002 Update `src/App.tsx` line 22 — change `<BrowserRouter>` to
  `<BrowserRouter basename={import.meta.env.BASE_URL}>`. No other changes.
  Verify locally: `npm run dev` still works at `http://localhost:5173/login`.

**Checkpoint**: `npm run dev` + navigate to all 5 routes — no regressions.
`npm run build` completes without TypeScript errors.

---

## Phase 3: User Story 1 — Tự động deploy khi push lên main (Priority: P1) 🎯 MVP

**Goal**: Push lên branch `main` → GitHub Actions chạy → ứng dụng accessible tại
GitHub Pages URL.

**Independent Test**: Push một commit nhỏ lên main, mở tab Actions trên GitHub,
xác nhận workflow "CI/Deploy" chạy và hoàn thành thành công. Vào URL
`https://<username>.github.io/shop-sdd/` → ứng dụng SimpleShop load được,
trang login hiển thị 3 user cards.

- [x] T003 [US1] Create `.github/workflows/deploy.yml` with full build + deploy pipeline:

  **Trigger & permissions**:
  ```yaml
  name: CI/Deploy
  on:
    push:
      branches: [main]
  permissions:
    contents: read
    pages: write
    id-token: write
  concurrency:
    group: pages
    cancel-in-progress: false
  ```

  **Job `build`** (runs parallel with future `test` job):
  ```yaml
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'
        - run: npm ci
        - run: npm run build -- --base=/shop-sdd/
        - uses: actions/upload-pages-artifact@v3
          with:
            path: dist/
  ```

  **Job `deploy`** (needs: build — update to needs: [build, test] in Phase 4):
  ```yaml
    deploy:
      needs: build
      runs-on: ubuntu-latest
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      steps:
        - uses: actions/configure-pages@v5
        - id: deployment
          uses: actions/deploy-pages@v4
  ```

  Create `.github/workflows/` directory if it does not exist.

**Checkpoint**: Commit và push `.github/workflows/deploy.yml` + `src/App.tsx` change lên main.
Vào tab Actions: workflow "CI/Deploy" chạy, `build` và `deploy` jobs pass.
URL GitHub Pages accessible và app chạy đúng (xem Kịch bản 1 trong quickstart.md).

---

## Phase 4: User Story 2 — Cổng chất lượng: chỉ deploy khi test pass (Priority: P2)

**Goal**: CI regression test chạy song song với build; deploy bị chặn nếu test fail.

**Independent Test**: Thêm lỗi TypeScript có chủ đích vào `src/App.tsx`, push lên main,
xác nhận job `build` fail và job `deploy` không chạy. Xem Kịch bản 2 trong quickstart.md.

### Add @ci Tags to Happy Path Tests

Các tasks [P] dưới đây không phụ thuộc nhau — có thể thực hiện song song.

- [x] T004 [P] [US2] Add `@ci` prefix to 1 test title in `tests/us1-login.spec.ts`:
  - Line 14: `'đăng nhập bằng thẻ Minh Nguyễn → /products, header hiển thị tên'`
    → `'@ci đăng nhập bằng thẻ Minh Nguyễn → /products, header hiển thị tên'`

- [x] T005 [P] [US2] Add `@ci` prefix to 3 test titles in `tests/us2-products.spec.ts`:
  - Line 10: `'danh sách sản phẩm: đúng 6 card, mỗi card có đủ name/price/image/nút'`
    → `'@ci danh sách sản phẩm: đúng 6 card, mỗi card có đủ name/price/image/nút'`
  - Line 21: `'giá sản phẩm đúng định dạng VND (X.XXX ₫)'`
    → `'@ci giá sản phẩm đúng định dạng VND (X.XXX ₫)'`
  - Line 28: `'ảnh sản phẩm có alt text bằng tên sản phẩm'`
    → `'@ci ảnh sản phẩm có alt text bằng tên sản phẩm'`

- [x] T006 [P] [US2] Add `@ci` prefix to 1 test title in `tests/us3-add-to-cart.spec.ts`:
  - Line 11: `'thêm sản phẩm lần đầu → badge từ 0 lên 1'`
    → `'@ci thêm sản phẩm lần đầu → badge từ 0 lên 1'`

- [x] T007 [P] [US2] Add `@ci` prefix to 1 test title in `tests/us4-cart-management.spec.ts`:
  - Line 15 (in describe "US4 — Giỏ có hàng"): `'hiển thị đúng tên, giá đơn vị, số lượng, thành tiền, tổng'`
    → `'@ci hiển thị đúng tên, giá đơn vị, số lượng, thành tiền, tổng'`

- [x] T008 [P] [US2] Add `@ci` prefix to 3 test titles in `tests/us5-checkout.spec.ts`
  (all within `test.describe('US5 — Happy path')`):
  - Line 17: `'nút Thanh toán → chuyển đến trang checkout'`
    → `'@ci nút Thanh toán → chuyển đến trang checkout'`
  - Line 24: `'checkout hợp lệ → trang xác nhận hiển thị tổng tiền khớp cart'`
    → `'@ci checkout hợp lệ → trang xác nhận hiển thị tổng tiền khớp cart'`
  - Line 39: `'sau đặt hàng thành công → badge giỏ hàng về 0'`
    → `'@ci sau đặt hàng thành công → badge giỏ hàng về 0'`

### Add `test` Job to Workflow

- [x] T009 [US2] Add `test` job to `.github/workflows/deploy.yml` — insert BEFORE the `deploy`
  job; also update `deploy` job's `needs: build` → `needs: [build, test]`:

  ```yaml
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'
        - run: npm ci
        - run: npx playwright install chromium --with-deps
        - run: npx playwright test --config playwright.ci.config.ts
          env:
            CI: true
  ```

  Verify `deploy` job now reads `needs: [build, test]`.

**Checkpoint**: Sau khi push, tab Actions hiển thị 3 jobs: `build` và `test` chạy song song,
`deploy` chờ cả 2 pass. Xác nhận `test` job log cho thấy 9 tests pass (grep @ci).

---

## Phase 5: User Story 3 — Lưu artifact để debug khi test fail (Priority: P3)

**Goal**: Khi CI test fail, developer download được Playwright HTML report + screenshot
trực tiếp từ GitHub Actions.

**Independent Test**: Sửa tạm thời một @ci test để fail, push lên main, xác nhận
artifact `playwright-report-<run-id>` xuất hiện trong trang workflow fail và download
được. Xem Kịch bản 3 trong quickstart.md.

- [x] T010 [US3] Add `upload-artifact` step at end of `test` job in
  `.github/workflows/deploy.yml` — insert AFTER the `playwright test` step:

  ```yaml
        - uses: actions/upload-artifact@v4
          if: failure()
          with:
            name: playwright-report-${{ github.run_id }}
            path: playwright-report/
            retention-days: 7
  ```

**Checkpoint**: Trigger a deliberate test failure → workflow fail → artifact section shows
`playwright-report-<id>` → download → open `index.html` → HTML report hiển thị test fail
với screenshot (nếu có). Artifact accessible ít nhất 7 ngày.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T011 [P] Create `public/404.html` — SPA fallback cho GitHub Pages để direct URL
  navigation (ví dụ: reload tại `/shop-sdd/products`) không trả về 404.
  Dùng pattern chuẩn: redirect về `index.html` với path encode vào query string.

  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>SimpleShop</title>
    <script>
      // GitHub Pages SPA fallback: redirect to index.html preserving path
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 2).join('/') +
        '/?p=' + l.pathname.slice(1).split('/').slice(1).join('/').replace(/&/g, '~and~') +
        (l.search ? '&q=' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
  </html>
  ```

  Add corresponding decode script in `index.html` `<head>` (before Vite scripts):
  ```html
  <script>
    // Decode SPA path from 404.html redirect
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) {
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location));
  </script>
  ```

- [x] T012 Run all 5 validation scenarios from `specs/003-github-pages-deploy/quickstart.md`
  and confirm each scenario passes (SC-001 through SC-005).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: No dependency on Phase 1 — can overlap, but complete before first push
- **US1 (Phase 3)**: Depends on Foundational (T002) — BrowserRouter basename must be set before deploy
- **US2 (Phase 4)**: Depends on Phase 1 (T001 playwright.ci.config.ts); @ci tag tasks depend on
  spec files existing (they do); T009 workflow update depends on T003 workflow existing
- **US3 (Phase 5)**: Depends on T009 (test job must exist before adding upload step)
- **Polish (Phase 6)**: Depends on all user story phases complete

### User Story Independence

- **US1**: Can be verified independently after T002 + T003 complete (push to main, check deploy)
- **US2**: Can be verified independently after T004-T009 complete (push with broken code, check gate)
- **US3**: Can be verified independently after T010 complete (force test failure, check artifact)

### Parallel Opportunities

Within Phase 4 (US2), tasks T004–T008 can all run in parallel (different files).
T009 must run after T003 (workflow file must exist to be updated).

---

## Parallel Example: User Story 2

```bash
# All @ci tagging tasks run in parallel (different test files):
Task T004: Add @ci in tests/us1-login.spec.ts
Task T005: Add @ci in tests/us2-products.spec.ts
Task T006: Add @ci in tests/us3-add-to-cart.spec.ts
Task T007: Add @ci in tests/us4-cart-management.spec.ts
Task T008: Add @ci in tests/us5-checkout.spec.ts

# Then sequentially:
Task T009: Add test job to .github/workflows/deploy.yml
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001 (playwright.ci.config.ts)
2. Complete Phase 2: T002 (BrowserRouter basename)
3. Complete Phase 3: T003 (deploy.yml — build + deploy jobs)
4. **STOP and VALIDATE**: Push to main, verify site accessible at GitHub Pages URL
5. All 3 scenarios from Kịch bản 1 in quickstart.md pass

At this point: site auto-deploys, but WITHOUT test gate and artifact.

### Incremental Delivery

1. MVP (US1) → site auto-deploys on push to main
2. Add US2 → test gate protects main from broken code
3. Add US3 → test artifacts available for debugging
4. Polish → direct URL navigation works, quickstart fully validated

---

## Notes

- **Repo name**: Nếu repo không tên `shop-sdd`, thay `--base=/shop-sdd/` trong T003 bằng
  `--base=/<actual-repo-name>/`. `import.meta.env.BASE_URL` tự cập nhật không cần sửa thêm.
- **GitHub Pages enable**: Phải bật thủ công trong Settings → Pages → Source → GitHub Actions
  trước khi T003 push đầu tiên có thể deploy thành công.
- **@ci count**: 9 tests tổng (1+3+1+1+3). Chạy `npx playwright test --config playwright.ci.config.ts`
  local sau T001+T004-T008 để xác nhận đúng 9 tests được chọn.
