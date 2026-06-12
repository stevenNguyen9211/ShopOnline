# Quickstart: SimpleShop — chạy & kiểm chứng

**Feature**: 001-simpleshop-demo | **Date**: 2026-06-13

## Yêu cầu môi trường

- Node.js 20+ và npm (kiểm tra: `node -v`)
- Không cần biến môi trường, không cần tài khoản dịch vụ ngoài (SC-005)

## Chạy ứng dụng

```bash
npm install        # lần đầu
npm run dev        # mở http://localhost:5173
```

Build tĩnh (tùy chọn): `npm run build && npm run preview`.

## Test tự động (bài tập của người học)

Repo KHÔNG kèm bộ test (xem research.md R7) — viết test E2E cho các kịch bản
dưới đây chính là bài thực hành automation. Công cụ khuyến nghị: Playwright
(`npm init playwright@latest`, tự cài riêng khi sẵn sàng). Selector tuân theo
[contracts/ui-contract.md](contracts/ui-contract.md) — chỉ dùng
`getByTestId` hoặc accessible role/label.

## Kịch bản kiểm chứng end-to-end (kiểm thủ công, sau đó tự động hóa làm bài tập)

### US1 — Đăng nhập & xem sản phẩm

1. Mở app → thấy `/login` với 3 thẻ user (Minh Nguyễn, Lan Trần, Hùng Phạm).
2. Bấm `login-user-minh` → chuyển `/products`, `header-user-name` = "Minh Nguyễn".
3. `products-grid` có đúng 6 `product-card-*`, mỗi card đủ tên/giá/ảnh/nút.
4. Mở tab ẩn danh, vào thẳng `/cart` → bị đẩy về `/login`.
5. Bấm `header-logout` → về `/login`.

### US2 — Thêm vào giỏ & bộ đếm

1. Đăng nhập, `header-cart-count` = 0.
2. Bấm "Thêm vào giỏ" trên Bàn phím cơ → badge = 1; bấm lần nữa → badge = 2.
3. Reload trang → badge vẫn = 2 (localStorage, FR-009).

### US3 — Quản lý giỏ hàng

1. Vào `/cart` → thấy dòng `cart-item-ban-phim-co` quantity 2, subtotal
   "2.400.000 ₫", `cart-total` khớp.
2. Bấm tăng đến 5 → nút `cart-item-increase` disabled; bấm giảm về 1 → nút
   `cart-item-decrease` disabled.
3. Bấm `cart-item-remove` → dòng biến mất, giỏ trống → hiện
   `cart-empty-message`, nút Checkout không khả dụng, badge = 0.

### US4 — Checkout & xác nhận

1. Thêm 2 sản phẩm khác nhau, vào `/cart`, bấm `cart-checkout` → `/checkout`.
2. Bấm "Đặt hàng" khi để trống 2 trường → hiện cả 2 thông báo lỗi, vẫn ở
   `/checkout`.
3. Điền họ tên + mã bưu chính → `/confirmation` hiện `confirmation-message`
   và `confirmation-total` đúng bằng tổng trước đó.
4. Quay về `/products` → badge = 0 (giỏ đã được làm trống).

## Định nghĩa "chạy được" (Definition of Done cho plan này)

- `npm run dev` khởi động không lỗi, đủ 5 route theo ui-contract.md.
- Toàn bộ kịch bản US1–US4 ở trên đạt khi kiểm thủ công.
- Mọi phần tử trong ui-contract.md hiện diện đúng `data-testid` đã khai báo
  (điều kiện để người học tự động hóa được — SC-002).
- `npm run lint` không lỗi.
- Rút cáp mạng vẫn dùng được toàn bộ luồng (SC-005).
