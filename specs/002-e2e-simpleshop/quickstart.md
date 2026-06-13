# Quickstart: Chạy bộ kiểm thử E2E SimpleShop

**Date**: 2026-06-13 | **Plan**: [plan.md](plan.md)

Hướng dẫn cài đặt, chạy, và xem kết quả bộ test tự động. Tham khảo
[contracts/page-objects.md](contracts/page-objects.md) cho API của Page Objects
và [data-model.md](data-model.md) cho cấu trúc classes.

---

## Yêu cầu trước khi bắt đầu

- App SimpleShop (feature 001) đã được cài đặt (`npm install` đã chạy)
- Node.js ≥ 18

Kiểm tra app chạy được:
```bash
npm run dev
# Mở http://localhost:5173 và đăng nhập thử bằng thẻ "Minh"
# Ctrl+C để dừng sau khi kiểm tra
```

---

## Cài đặt Playwright

```bash
# Thêm @playwright/test vào devDependencies
npm install --save-dev @playwright/test

# Tải browser Chromium (chỉ Chromium vì spec Chrome/Chromium only)
npx playwright install chromium
```

---

## Chạy bộ test

```bash
# Chạy toàn bộ suite (Playwright tự khởi app Vite qua webServer config)
npm run test:e2e

# Hoặc trực tiếp
npx playwright test

# Chỉ chạy 1 user story
npx playwright test tests/us1-login.spec.ts

# Chạy ở chế độ headed (thấy browser)
npx playwright test --headed

# Chạy với Playwright UI mode (debug tương tác)
npx playwright test --ui
```

---

## Xem báo cáo HTML

```bash
# Sau khi chạy, mở báo cáo HTML
npx playwright show-report
```

Báo cáo nằm ở `playwright-report/`. Bao gồm: danh sách test pass/fail, ảnh
chụp màn hình lúc fail, video (nếu cấu hình), trace viewer.

---

## Cấu trúc bộ test

```
tests/
├── us1-login.spec.ts         # US1: Đăng nhập và bảo vệ route
├── us2-products.spec.ts      # US2: Danh sách sản phẩm
├── us3-add-to-cart.spec.ts   # US3: Thêm vào giỏ, badge counter
├── us4-cart-management.spec.ts  # US4: Tăng/giảm/xóa mặt hàng
└── us5-checkout.spec.ts      # US5: Checkout và xác nhận
```

---

## Kịch bản kiểm thử theo User Story

### US1 — Đăng nhập và bảo vệ trang *(FR-001, FR-002, FR-003)*

| Test | Kết quả mong đợi |
|------|-----------------|
| Bấm thẻ "Minh" trên trang login | Redirect đến `/products`, thấy header "Minh" |
| Truy cập `/cart` chưa đăng nhập | Redirect về `/login` |
| Đã đăng nhập, vào `/login` | Redirect về `/products` |
| Bấm "Đăng xuất" | Redirect về `/login`, header user name biến mất |

**Precondition**: Không cần đăng nhập trước. Test mở `/login` trực tiếp.

### US2 — Hiển thị danh sách sản phẩm *(FR-004)*

| Test | Kết quả mong đợi |
|------|-----------------|
| Đã đăng nhập, xem `/products` | Grid có đúng 6 product card |
| Kiểm tra tên sản phẩm | Tên hiển thị đúng (vd: "Bàn phím cơ") |
| Kiểm tra giá sản phẩm | Định dạng VND (vd: "1.200.000 ₫") |
| Kiểm tra ảnh sản phẩm | Ảnh có `alt` = tên sản phẩm, không broken |

**Precondition**: Đã đăng nhập (dùng fixture `loggedIn` hoặc `beforeEach`).

### US3 — Thêm sản phẩm vào giỏ *(FR-005, FR-006, FR-008, FR-009)*

| Test | Kết quả mong đợi |
|------|-----------------|
| Bấm "Thêm vào giỏ" lần đầu | Badge từ `0` → `1` |
| Bấm "Thêm vào giỏ" lần thứ 2 (cùng sản phẩm) | Badge từ `1` → `2` |
| Bấm 5 lần cùng sản phẩm | Nút "Thêm vào giỏ" bị disabled |
| Reload trang | Badge vẫn giữ đúng số lượng |

**Precondition**: Đã đăng nhập, ở trang `/products`.

### US4 — Quản lý giỏ hàng *(FR-007, FR-008, FR-010)*

| Test | Kết quả mong đợi |
|------|-----------------|
| Thêm hàng rồi vào `/cart` | Thấy tên/giá/số lượng đúng |
| Bấm "+" (tăng số lượng) | Quantity +1, tổng tiền cập nhật |
| Bấm "−" tới quantity 1 | Nút "−" bị disabled |
| Bấm "+" tới quantity 5 | Nút "+" bị disabled |
| Bấm "Xóa" | Dòng biến mất, tổng tiền cập nhật |
| Xóa hết → giỏ trống | Thấy `cart-empty-message`, nút "Thanh toán" disabled |

**Precondition**: Đã đăng nhập; `beforeEach` thêm ≥1 sản phẩm vào giỏ qua UI.

### US5 — Checkout và xác nhận đặt hàng *(FR-011, FR-012, FR-013)*

| Test | Kết quả mong đợi |
|------|-----------------|
| **Happy path**: Điền form hợp lệ, bấm "Đặt hàng" | Redirect `/confirmation`, tổng tiền khớp với `cart-total` |
| Sau checkout thành công | Badge giỏ hàng = 0 |
| Giỏ trống vào `/checkout` | Redirect về `/cart` |
| Submit với họ tên trống | Hiển thị `checkout-fullname-error` |
| Submit với mã bưu chính trống | Hiển thị `checkout-postalcode-error` |
| Submit với cả 2 trường trống | Hiển thị cả 2 lỗi |
| Trang `/confirmation` không có Order | Redirect về `/products` |

**Precondition**: Đã đăng nhập; `beforeEach` thêm ≥1 sản phẩm + điều hướng
đến `/checkout` qua `/cart`.

---

## Definition of Done

Bộ test đạt khi:
- [ ] Tất cả test trong 5 file pass trên Chromium
- [ ] Không test nào flaky (chạy 3 lần liên tiếp kết quả giống nhau — SC-004)
- [ ] Tổng thời gian chạy < 3 phút với `fullyParallel: true` (SC-003)
- [ ] HTML report sinh ra đầy đủ với tên test rõ ràng
- [ ] Mỗi test file có ít nhất 1 happy path và 1 error path (SC-002)

---

## Gỡ lỗi

**Test fail do app chưa chạy**: `webServer` config trong `playwright.config.ts`
tự khởi Vite — kiểm tra `npm run dev` có chạy được không trước.

**Test fail do locator không tìm thấy**: Kiểm tra `data-testid` trong app còn
khớp với ui-contract.md. Chạy `--headed` để thấy browser.

**Flaky test**: Thêm `await expect(locator).toBeVisible()` trước khi assert
thay vì dùng `.textContent()` ngay lập tức.

**Port 5173 đang bị chiếm**: Đổi `url` và `port` trong `webServer` config và
`baseURL` trong `playwright.config.ts`.
