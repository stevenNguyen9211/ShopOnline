# Research: Post-Deploy Smoke Test

**Feature**: 004-post-deploy-smoke-test | **Date**: 2026-06-14

## Decision 1: Workflow Chaining Mechanism

**Decision**: Thêm job `smoke-test` vào `.github/workflows/deploy.yml` hiện có, với `needs: deploy`

**Rationale**: Cùng một workflow file → một nơi duy nhất để đọc toàn bộ pipeline. `needs: deploy`
tự động đảm bảo FR-007 (smoke-test không chạy nếu deploy fail/skip) mà không cần logic kiểm tra
thêm. Không có cross-workflow permission complexity.

**Alternatives considered**:
- Separate workflow triggered bởi `workflow_run` event: Cần check `github.event.workflow_run.conclusion == 'success'` tường minh, permission model khác, khó debug hơn. Rejected: vi phạm Principle II (YAGNI) và tăng độ phức tạp không cần thiết.

---

## Decision 2: Playwright Smoke Config Strategy

**Decision**: Tạo `playwright.smoke.config.ts` mới extend base config, override `baseURL` và set `webServer: undefined`

**Rationale**: Pattern nhất quán với `playwright.ci.config.ts`. Config file riêng biệt rõ ràng
tín hiệu "đây là môi trường khác." Override tường minh trong file, không qua env var, giúp audit
dễ hơn. `webServer: undefined` bắt buộc vì base config start `npm run dev` — nếu không override,
Playwright sẽ cố start dev server trước khi test live URL.

**Alternatives considered**:
- Env var `PLAYWRIGHT_BASE_URL`: Flexible nhưng không cần thiết cho static URL. Thêm implicit config. Rejected: YAGNI.
- Override trong `playwright.ci.config.ts`: Không thể — CI config target localhost (pre-deploy gate), smoke target live URL (post-deploy verification). Hai mục đích khác nhau, cần hai config.

---

## Decision 3: CDN Propagation Handling

**Decision**: 30-second `sleep` step trước Playwright + `retries: 2` kế thừa từ base config

**Rationale**: GitHub Pages CDN thường propagate trong 10–30 giây sau khi `deploy-pages` action
hoàn thành. Fixed 30s sleep xử lý phần lớn trường hợp. `retries: 2` (kế thừa từ base config
khi `CI=true`) cung cấp 3 attempts tổng cho residual CDN flakiness. Time budget: ~4 phút max
(30s + ~90s tests × 3) — well within 5-minute limit (FR-008).

**Alternatives considered**:
- Polling loop (curl -f until HTTP 200): Chính xác hơn nhưng complex shell scripting. Rejected: vi phạm Principle II.
- Chỉ sleep không retry: Kém hiệu quả — kéo dài mọi run kể cả khi CDN đã sẵn sàng sớm. Rejected.
- Chỉ retry không sleep: CDN có thể trả 404 nhiều lần liên tiếp nếu chưa propagate; Playwright retry interval ngắn (seconds). Kết hợp cả hai robust hơn.

---

## Decision 4: GitHub Pages Base URL

**Decision**: Hardcode `https://stevennguyen9211.github.io/ShopOnline/` trong `playwright.smoke.config.ts`

**Rationale**: Repo name (`ShopOnline`) và GitHub username (`stevennguyen9211`) cố định
cho dự án này. URL không thay đổi giữa các runs. Hardcode đơn giản và explicit.

**Alternatives considered**:
- `process.env.SMOKE_BASE_URL` với workflow env var: Flexible hơn nhưng thêm indirection không cần thiết. YAGNI.
- Derive từ `GITHUB_REPOSITORY` (e.g., `stevennguyen9211/ShopOnline`): Complex parsing, thêm fragility, zero benefit cho static URL.

---

## Decision 5: Smoke Artifact Naming

**Decision**: `name: smoke-report-${{ github.run_id }}` (phân biệt với `playwright-report-*` của pre-deploy test)

**Rationale**: Developer nhìn artifact name biết ngay failure từ stage nào: `playwright-report-*`
= pre-deploy CI test fail; `smoke-report-*` = post-deploy smoke test fail. Không cần mở log.

**Alternatives considered**:
- Cùng tên `playwright-report-*`: Ambiguous — không biết failure xảy ra ở stage nào. Rejected.

---

## Decision 6: Node Version

**Decision**: Node 20 LTS — nhất quán với các job `build`, `test`, `deploy` trong deploy.yml

**Rationale**: Không có lý do dùng version khác. Nhất quán giảm cognitive overhead.
