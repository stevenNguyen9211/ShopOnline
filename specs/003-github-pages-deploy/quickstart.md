# Quickstart Validation Guide: GitHub Pages Auto-Deploy

**Feature**: 003-github-pages-deploy
**Date**: 2026-06-13

Hướng dẫn này mô tả cách xác nhận feature hoạt động đúng sau khi implement.
Không bao gồm implementation code — chỉ là kịch bản kiểm tra.

---

## Yêu cầu trước khi bắt đầu

1. Repository đã được push lên GitHub (có remote `origin`).
2. GitHub Pages đã được enable trong repository:
   - Vào **Settings → Pages → Source**: chọn **GitHub Actions** (không phải branch).
   - Lưu thay đổi.
3. Tất cả implementation tasks trong `tasks.md` đã hoàn thành.

---

## Kịch bản 1 — Deploy thành công khi push lên main (US1)

**Mục tiêu**: Xác nhận push lên `main` → pipeline chạy → site cập nhật.

**Bước thực hiện**:

```bash
# Tạo một thay đổi nhỏ và có thể quan sát được
echo "<!-- deploy-test-$(date +%s) -->" >> index.html
git add index.html
git commit -m "test: verify auto-deploy pipeline"
git push origin main
```

**Kiểm tra**:
1. Vào tab **Actions** trên GitHub → thấy workflow mới với tên "CI/Deploy" đang chạy.
2. Xác nhận 2 jobs chạy song song: `build` và `test`.
3. Sau khi cả 2 pass → job `deploy` khởi động và hoàn thành.
4. Vào URL GitHub Pages (ví dụ `https://<username>.github.io/shop-sdd/`):
   - Ứng dụng SimpleShop load được.
   - Trang `/login` hiển thị 3 user cards.
   - Đăng nhập → chuyển đến `/products` → 6 sản phẩm hiển thị.
5. Tổng thời gian từ push đến site cập nhật: **≤ 5 phút** (SC-001).

---

## Kịch bản 2 — Pipeline fail khi build lỗi (US2)

**Mục tiêu**: Xác nhận code có lỗi TypeScript → pipeline dừng ở build → deploy KHÔNG chạy.

**Bước thực hiện**:

```bash
# Thêm lỗi TypeScript có chủ đích
echo "const x: string = 42" >> src/App.tsx
git add src/App.tsx
git commit -m "test: intentional build error"
git push origin main
```

**Kiểm tra**:
1. Tab Actions: job `build` fail (màu đỏ).
2. Job `deploy` **không xuất hiện** hoặc bị skip — không có deploy nào xảy ra.
3. URL GitHub Pages vẫn phục vụ phiên bản cũ (phiên bản từ Kịch bản 1).
4. Commit trên GitHub hiển thị dấu ❌ (fail status) — không phải ✅ hay ⏳ (SC-002, FR-010).

**Cleanup** (sau khi xác nhận xong):

```bash
git revert HEAD
git push origin main
```

---

## Kịch bản 3 — Artifact được lưu khi test fail (US3)

**Mục tiêu**: Xác nhận khi CI test fail → artifact (Playwright HTML report) có thể download từ GitHub.

**Bước thực hiện**:

```bash
# Thêm test luôn fail vào us1 spec (chỉ để test artifact, sẽ revert ngay)
# Hoặc tạm thời xoá data-testid của một phần tử trong src/ để test fail
```

Cách đơn giản hơn: sửa tạm thời `us1-login.spec.ts` để một @ci test fail:

```typescript
// Trong us1-login.spec.ts, đổi tạm:
await expect(page).toHaveURL(/\/products-WRONG/)  // intentional fail
```

```bash
git add tests/us1-login.spec.ts
git commit -m "test: intentional test failure for artifact validation"
git push origin main
```

**Kiểm tra**:
1. Tab Actions: job `test` fail.
2. Job `deploy` không chạy (needs: [build, test]).
3. Vào trang workflow fail → cuộn xuống **Artifacts** → thấy `playwright-report-<run-id>`.
4. Download artifact → giải nén → mở `index.html` → Playwright HTML report hiển thị test fail với screenshot.
5. Artifact còn accessible sau ít nhất **7 ngày** (SC-003, FR-009).

**Cleanup**:

```bash
git revert HEAD
git push origin main
```

---

## Kịch bản 4 — Push lên non-main không trigger pipeline (FR-001, FR-008)

**Mục tiêu**: Xác nhận push lên branch khác không kích hoạt workflow.

**Bước thực hiện**:

```bash
git checkout -b feature/test-branch
echo "<!-- non-main test -->" >> README.md
git add README.md
git commit -m "test: push to non-main"
git push origin feature/test-branch
```

**Kiểm tra**:
1. Tab Actions: **không có workflow mới** được trigger.
2. URL GitHub Pages không thay đổi.

---

## Kịch bản 5 — Kiểm tra sub-path routing (Edge Case)

**Mục tiêu**: Xác nhận tất cả routes hoạt động đúng ở sub-path `/shop-sdd/`.

Sau khi deploy thành công (Kịch bản 1), kiểm tra từng route:

| URL | Kết quả mong đợi |
|-----|-----------------|
| `https://<user>.github.io/shop-sdd/` | Redirect đến `/shop-sdd/login` |
| `https://<user>.github.io/shop-sdd/login` | Trang login với 3 user cards |
| `https://<user>.github.io/shop-sdd/products` | Redirect về login (chưa đăng nhập) |
| Sau đăng nhập → `/shop-sdd/products` | 6 sản phẩm hiển thị |
| `/shop-sdd/cart` | Trang giỏ hàng |
| `/shop-sdd/checkout` (giỏ có hàng) | Form checkout |

**Lưu ý**: Nếu GitHub Pages trả về 404 khi reload tại `/shop-sdd/products`, cần thêm
file `public/404.html` redirect về `index.html` (SPA fallback cho GitHub Pages).
Xem thêm trong tasks.md.

---

## Thay thế repo name

Nếu repository không tên là `shop-sdd`, thay `/shop-sdd/` bằng tên repo thực tế trong:
1. `--base=/<repo-name>/` trong `.github/workflows/deploy.yml`
2. Không cần thay đổi trong code (vì dùng `import.meta.env.BASE_URL`)
