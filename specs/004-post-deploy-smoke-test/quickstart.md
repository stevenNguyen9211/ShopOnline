# Quickstart: Post-Deploy Smoke Test

**Feature**: 004-post-deploy-smoke-test | **Date**: 2026-06-14

## Prerequisites

- Feature 003 (GitHub Pages auto-deploy) đang hoạt động — site đã accessible tại
  `https://stevennguyen9211.github.io/ShopOnline/`
- `playwright.smoke.config.ts` đã tạo ở repo root
- Job `smoke-test` đã được thêm vào `.github/workflows/deploy.yml` sau job `deploy`

---

## Kịch bản 1: Smoke test pass sau deploy thành công (SC-001, US1 Scenario 1)

**Mục tiêu**: Xác nhận smoke test tự động chạy và pass sau mỗi deploy.

**Steps**:
1. Push một commit nhỏ lên `main` (ví dụ: sửa comment trong `README.md` hoặc thêm blank line)
2. Vào tab **Actions** trên GitHub → chọn workflow run mới nhất "CI/Deploy"
3. Quan sát thứ tự: `build` và `test` chạy song song → `deploy` sau khi cả hai pass → `smoke-test` cuối cùng

**Expected outcomes**:
- Cả 4 jobs hiển thị ✅ (green) trên workflow run page
- Log của `smoke-test` job: `9 passed` (hoặc tương đương)
- Commit trên GitHub hiển thị ✅ với tất cả check statuses pass
- Không có artifact nào được tạo (upload chỉ xảy ra khi `if: failure()`)

---

## Kịch bản 2: Smoke test phát hiện lỗi trên live site (US1 Scenario 2, US2)

**Mục tiêu**: Xác nhận fail handling — ❌ trên commit, artifact upload trong 5 phút.

**Steps** (tạo smoke test failure có kiểm soát):
1. Trong `playwright.smoke.config.ts`, tạm thời đổi `baseURL` thành URL sai:
   ```typescript
   baseURL: 'https://stevenNguyen9211.github.io/WRONG-PATH/',
   ```
2. Push lên `main`
3. Chờ `build` ✅ → `test` ✅ → `deploy` ✅ → `smoke-test` bắt đầu chạy

**Expected outcomes**:
- `smoke-test` job: ❌ (fail — URL không load được)
- Commit trên GitHub: ❌ với check "smoke-test" failed
- Trong trang workflow run → section **Artifacts**: có entry `smoke-report-<run-id>`
- Download artifact → `index.html` → HTML report với các test failure và screenshot
- Artifact còn accessible sau 7 ngày (xác nhận `retention-days: 7` trong workflow)

**Cleanup**: Revert `baseURL` về `https://stevennguyen9211.github.io/ShopOnline/`, push lại.

---

## Kịch bản 3: Smoke test KHÔNG chạy khi deploy fail (FR-007, US1 Scenario 3)

**Mục tiêu**: Xác nhận `needs: deploy` đảm bảo smoke-test bị skip khi deploy fail.

**Steps**:
1. Trong `.github/workflows/deploy.yml`, tạm thời thêm vào đầu job `build`:
   ```yaml
   - name: Force fail (test only)
     run: exit 1
   ```
2. Push lên `main`

**Expected outcomes**:
- `build` ❌ → `test` ✅ (vẫn chạy song song, không bị ảnh hưởng)
- `deploy` ⏭ (skipped — vì `needs: [build, test]` không thỏa: build fail)
- `smoke-test` ⏭ (skipped — vì `needs: deploy` không thỏa: deploy skipped)
- Không có `smoke-report-*` artifact nào được tạo

**Cleanup**: Xóa bước `exit 1` khỏi deploy.yml, push lại.

---

## Kịch bản 4: Trạng thái smoke test hiển thị trên PR (US2 Scenario 3)

**Mục tiêu**: Xác nhận smoke test status xuất hiện trên GitHub PR checks.

**Context**: Smoke test chỉ trigger khi push lên `main`. Status của commit hiển thị trên
PR page nếu commit đó thuộc về một PR đang mở (commit merged vào main thông qua PR).

**Steps**:
1. Tạo PR từ một feature branch vào `main` (dù chỉ có một commit nhỏ)
2. Merge PR vào main → workflow trigger với commit mới
3. Sau khi workflow hoàn thành, quay lại PR page đã closed

**Expected outcomes**:
- PR page hiển thị check status của merge commit, bao gồm `smoke-test`: ✅ hoặc ❌
- Nếu bật branch protection với required status "smoke-test": PR sau đó sẽ không thể
  merge nếu smoke-test chưa pass (cần push commit sửa lỗi trước)

---

## Kịch bản 5: Smoke test hoàn thành trong 5 phút (FR-008, SC-004)

**Mục tiêu**: Xác nhận tổng thời gian smoke-test job ≤ 5 phút.

**Steps**:
1. Sau khi Kịch bản 1 hoàn thành, xem trang chi tiết job `smoke-test`
2. Xem timestamp từ lúc job bắt đầu đến khi kết thúc (hiển thị ở góc phải workflow)

**Expected outcomes**:
- Total job duration < 5 phút
- Breakdown điển hình:
  - Setup (checkout + node): ~20 giây
  - `npm ci`: ~20-30 giây
  - `playwright install chromium`: ~30 giây
  - `sleep 30`: 30 giây (CDN propagation wait)
  - 9 tests × ~10 giây/test: ~90 giây
  - **Tổng**: ~3-3.5 phút → well within 5-minute budget
