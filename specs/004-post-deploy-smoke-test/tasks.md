# Tasks: Post-Deploy Smoke Test

**Input**: Design documents from `specs/004-post-deploy-smoke-test/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | quickstart.md ✅

**Organization**: Tasks grouped by user story. US1 is independently testable (MVP).
No new test files — this feature reuses existing @ci tagged tests from feature 002/003.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no blocking dependencies)
- **[Story]**: Traceability to user story in spec.md
- File paths are relative to repo root

---

## Phase 1: Setup

**Purpose**: Create the Playwright smoke config — prerequisite for both US1 and US2.

- [x] T001 Create `playwright.smoke.config.ts` at repo root — extend base config, override `baseURL`
  to live GitHub Pages URL, set `webServer: undefined` to disable dev server startup:
  ```typescript
  import { defineConfig } from '@playwright/test'
  import baseConfig from './playwright.config'

  export default defineConfig({
    ...baseConfig,
    grep: /@ci/,
    webServer: undefined,
    use: {
      ...baseConfig.use,
      baseURL: 'https://stevennguyen9211.github.io/ShopOnline/',
    },
  })
  ```
  Note: `retries` does NOT need to be overridden — base config already sets
  `retries: process.env.CI ? 2 : 0`, so `retries: 2` is inherited when `CI: true`.

**Checkpoint**: File exists and is valid TypeScript. Running
`npx playwright test --config playwright.smoke.config.ts` locally should attempt to
connect to the live URL (will error if no internet or site not deployed — that's expected locally).

---

## Phase 2: User Story 1 — Smoke test tự động xác nhận site đã deploy (Priority: P1) 🎯 MVP

**Goal**: Sau mỗi deploy thành công → smoke-test job tự động chạy → 9 @ci tests pass
trên live GitHub Pages URL → commit hiển thị ✅.

**Independent Test**: Push một commit nhỏ lên `main`, chờ workflow hoàn thành, xác nhận:
(1) job `smoke-test` xuất hiện trong workflow run và chạy sau `deploy`, (2) tất cả 9 tests
pass, (3) commit hiển thị ✅ trên GitHub. Xem Kịch bản 1 trong quickstart.md.

- [x] T002 [US1] Add `smoke-test` job to `.github/workflows/deploy.yml` — insert AFTER the
  `deploy` job. Job phải có `needs: deploy` và bao gồm: checkout, node setup, npm ci,
  playwright install, 30s sleep (CDN propagation wait), và playwright test step:

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
  ```

  Verify `needs: deploy` (không phải `needs: [build, test]`). Workflow concurrency group
  `pages` và `cancel-in-progress: false` đã được set ở workflow level — smoke-test kế thừa.

**Checkpoint**: Push commit lên main. Tab Actions: 4 jobs xuất hiện (`build`, `test`, `deploy`,
`smoke-test`). `smoke-test` chỉ bắt đầu sau khi `deploy` pass. Log `smoke-test` hiển thị
`9 passed`. Commit trên GitHub hiển thị ✅.

---

## Phase 3: User Story 2 — Kết quả fail hiển thị rõ ràng, có thể debug ngay (Priority: P2)

**Goal**: Khi smoke test fail → artifact `smoke-report-<run-id>` được upload → developer có
thể download HTML report + screenshot để debug.

**Independent Test**: Tạm thời đổi `baseURL` trong `playwright.smoke.config.ts` thành URL sai,
push lên main, xác nhận: (1) `smoke-test` job fail, (2) commit hiển thị ❌, (3) artifact
`smoke-report-<run-id>` xuất hiện trong workflow run page trong vòng 5 phút sau khi job kết thúc,
(4) artifact download được và chứa HTML report. Xem Kịch bản 2 trong quickstart.md.

- [x] T003 [US2] Add `upload-artifact` step at end of `smoke-test` job in
  `.github/workflows/deploy.yml` — insert AFTER the `playwright test` step:

  ```yaml
        - uses: actions/upload-artifact@v4
          if: failure()
          with:
            name: smoke-report-${{ github.run_id }}
            path: playwright-report/
            retention-days: 7
  ```

  Verify: `name` dùng `smoke-report-*` (không phải `playwright-report-*`) để phân biệt
  với artifact của pre-deploy `test` job. `if: failure()` đảm bảo artifact chỉ upload khi fail.

**Checkpoint**: Sau T003, force smoke test failure (xem Kịch bản 2 trong quickstart.md).
Xác nhận artifact `smoke-report-<run-id>` xuất hiện trong workflow run page. Download và
verify HTML report hiển thị test failures với screenshot.

---

## Phase 4: Polish & Validation

- [x] T004 Run all 5 validation scenarios từ `specs/004-post-deploy-smoke-test/quickstart.md`
  và confirm mỗi scenario cho kết quả đúng như Expected outcomes:
  - Kịch bản 1: Smoke pass → ✅ trên commit (SC-001)
  - Kịch bản 2: Smoke fail → ❌ trên commit + artifact (SC-002, SC-003)
  - Kịch bản 3: Deploy fail → smoke-test không chạy (FR-007)
  - Kịch bản 4: Trạng thái hiển thị trên PR (US2 Scenario 3)
  - Kịch bản 5: Smoke hoàn thành ≤ 5 phút (SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 — không dependencies, bắt đầu ngay
- **US1 (Phase 2)**: T002 — depends on T001 (deploy.yml tham chiếu `playwright.smoke.config.ts`
  phải tồn tại trước khi push lên CI)
- **US2 (Phase 3)**: T003 — depends on T002 (cần `smoke-test` job tồn tại để thêm upload step)
- **Polish (Phase 4)**: T004 — depends on T002 + T003 (cần full smoke-test job để validate)

### Sequential Execution

Tất cả 4 tasks phải chạy tuần tự theo thứ tự T001 → T002 → T003 → T004. Không có
parallel opportunity vì T002 và T003 đều sửa cùng một file (deploy.yml), và T001 phải
tồn tại trước khi T002 push lên CI.

### User Story Independence

- **US1**: Có thể verify độc lập sau T002 (trước khi T003 — smoke test chạy và báo status,
  nhưng chưa có artifact khi fail)
- **US2**: Verify độc lập sau T003 (force failure để xác nhận artifact upload)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001: Tạo `playwright.smoke.config.ts`
2. T002: Thêm `smoke-test` job (không có artifact step) vào `deploy.yml`
3. **STOP và VALIDATE**: Push lên main, xác nhận Kịch bản 1 pass (smoke test runs + ✅ status)

Tại thời điểm này: smoke test tự động chạy sau deploy, báo ✅/❌ trên commit.

### Incremental Delivery

1. MVP (US1) → smoke test auto-run sau deploy
2. Add US2 (T003) → artifact upload khi fail → developer có đủ info để debug

---

## Notes

- **GitHub username**: `nguyenkhoi89` trong `playwright.smoke.config.ts` được infer từ system path.
  Nếu sai, thay đúng username trước khi push lên CI.
- **webServer: undefined**: Bắt buộc — nếu bỏ qua, Playwright sẽ cố start `npm run dev` trước
  khi test live URL (sẽ fail ngay từ đầu).
- **smoke-report vs playwright-report**: Dùng tên khác nhau để dev phân biệt ngay từ artifact
  name: pre-deploy gate failure vs post-deploy smoke failure.
- **Tổng số tasks**: 4 tasks (1 setup + 1 US1 + 1 US2 + 1 polish)
- **Không có test tasks mới**: Feature reuse hoàn toàn 9 @ci tests từ feature 002/003.
