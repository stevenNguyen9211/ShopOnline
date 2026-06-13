# Research: GitHub Pages Auto-Deploy

**Feature**: 003-github-pages-deploy
**Date**: 2026-06-13

---

## Decision 1: GitHub Pages Deployment Mechanism

**Decision**: Use `actions/upload-pages-artifact` + `actions/configure-pages` + `actions/deploy-pages` (GitHub's official Pages deployment API).

**Rationale**: GitHub deprecated deploying from a `gh-pages` branch pushed by CI in favour of the artifact-based approach (Actions → Pages API). The new approach:
- Does not pollute the repo with a `gh-pages` branch
- Integrates with GitHub's deployment environment system (shows deployment status on commit)
- Requires only `GITHUB_TOKEN` (automatically provided) with `pages: write` + `id-token: write` permissions — no Personal Access Token or secret needed
- Satisfies FR-003 (dist/ not committed) and FR-010 (status visible on commit)

**Alternatives considered**:
- `peaceiris/actions-gh-pages`: Third-party action, commits dist/ to `gh-pages` branch. Rejected: violates FR-003 (build artifact committed to repo) and Constitution VII.
- Manual `git push` to `gh-pages`: Same problem. Rejected.

---

## Decision 2: Vite Base Path Strategy

**Decision**: Pass `--base=/shop-sdd/` as a flag to `vite build` in the CI workflow command. Do NOT add `base` to `vite.config.ts`.

**Rationale**: The `--base` CLI flag overrides config at build time without modifying source files. This keeps `vite.config.ts` unchanged (base='/' implicitly), so local dev and E2E tests are unaffected. Only the CI deploy build uses the sub-path base.

Vite sets `import.meta.env.BASE_URL` to the resolved base value, which allows React Router's `basename` prop to pick it up automatically (see Decision 3).

Assumption: The GitHub repository name is `shop-sdd`. If the repo name differs, the `--base` value must be updated accordingly. This is documented in `quickstart.md`.

**Alternatives considered**:
- `base: process.env.VITE_PAGES ? '/shop-sdd/' : '/'` in `vite.config.ts`: Works but adds env-conditional logic to a config file that should stay simple. Rejected (Constitution II: YAGNI).
- Always set `base: '/shop-sdd/'` in vite.config.ts: Breaks local dev (assets served from wrong path). Rejected.

---

## Decision 3: React Router Base Path

**Decision**: Change `<BrowserRouter>` in `src/App.tsx` to `<BrowserRouter basename={import.meta.env.BASE_URL}>`.

**Rationale**: `import.meta.env.BASE_URL` is set by Vite from the `base` config. In dev (`base='/'`), `BASE_URL = '/'` and `basename="/"` is identical to no basename. In the GitHub Pages build (`--base=/shop-sdd/`), `BASE_URL = '/shop-sdd/'` and React Router routes correctly under the sub-path. Single-line change, zero runtime overhead.

**Alternatives considered**:
- Hard-code `basename="/shop-sdd/"` in App.tsx: Breaks local dev navigation. Rejected.
- Use `createBrowserRouter` with `basename`: Works but requires refactoring the existing component-based router. Rejected (unnecessary refactor, Constitution II).

---

## Decision 4: CI Test Scope — Happy Path Tagging

**Decision**: Add `@ci` prefix to happy path test titles in all 5 spec files. Run `npx playwright test --config playwright.ci.config.ts` on CI. Create `playwright.ci.config.ts` extending the base config with `grep: /@ci/`.

**Rationale**: Playwright's `grep` option filters tests by title. Prefixing happy path test names with `@ci` is idiomatic (Playwright docs show this pattern), requires no separate test file, and keeps all test logic in one place. Adding `@ci` to ~10 test titles across 5 files is a minimal change.

CI happy path tests chosen (one happy path per user story):
- US1: `'đăng nhập bằng thẻ Minh Nguyễn → /products, header hiển thị tên'` (1 test)
- US2: all 3 product display tests (product count, price format, image alt)
- US3: `'badge giỏ hàng tăng từ 0 lên 1 sau lần thêm đầu tiên'` (1 test)
- US4: `'hiển thị item, số lượng, giá và tổng tiền đúng'` (1 test from "Giỏ có hàng")
- US5: all 3 tests in `test.describe('US5 — Happy path')` (checkout flow end-to-end)

Total: ~9 tests on CI (vs 27 locally). Estimated CI runtime: ~30-60 seconds.

**Alternatives considered**:
- Separate `tests/ci-regression.spec.ts` file duplicating test logic: Violates DRY; test logic diverges over time. Rejected (Constitution II + VI).
- Run full 27-test suite on CI: Violates Constitution VII ("phạm vi CI regression: happy path only"). Rejected.
- Use separate Playwright projects configured per environment: Over-engineered for this scope. Rejected (Constitution II: YAGNI).

---

## Decision 5: CI Job Parallelism

**Decision**: `build` and `test` jobs run in parallel. `deploy` has `needs: [build, test]` (requires both to succeed).

**Rationale**: The `build` job (creates dist/ artifact) and `test` job (runs Playwright against dev server) are completely independent — neither needs the other's output. Running them in parallel reduces total pipeline time. `deploy` gates on both: SC-004 requires pipeline ≤ 10 minutes total; SC-002 requires deploy only after build AND test pass.

The Playwright webServer in `playwright.config.ts` is already configured with `reuseExistingServer: !process.env.CI`, so on CI it starts a fresh `npm run dev` instance — independent of the build job.

**Alternatives considered**:
- Sequential: build → test → deploy: Adds unnecessary latency. Rejected.
- Merge build and test into one job: Complicates artifact upload timing. Rejected.

---

## Decision 6: GitHub Actions Workflow Trigger

**Decision**: `on: push: branches: [main]` — trigger ONLY on push to `main`. No other triggers.

**Rationale**: Directly implements FR-001 (main-only trigger) and the clarification from `/speckit-clarify` (Option A: pipeline only on main). Assumption: no PR-based CI is in scope for this feature (Assumptions section of spec + Clarifications session 2026-06-13).

---

## Decision 7: Node.js Version

**Decision**: Node.js 20 (LTS as of 2026-06-13) via `actions/setup-node@v4`.

**Rationale**: Matches the LTS version that ensures compatibility with Vite 6, Playwright 1.60, and TypeScript 5.8. Using `cache: 'npm'` with setup-node to cache `node_modules` for faster CI runs.

---

## Decision 8: Playwright Browser Install on CI

**Decision**: `npx playwright install chromium --with-deps` in the test job.

**Rationale**: Only Chromium is needed on CI (matching the local `playwright.config.ts` which only has the `chromium` project enabled). `--with-deps` installs required system libraries on ubuntu-latest. This is faster than `--with-deps` for all browsers and satisfies FR-006 (headless, no display server needed — Chromium runs headless by default on CI).
