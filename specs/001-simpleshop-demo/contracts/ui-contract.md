# UI Contract: SimpleShop — Routes & data-testid Registry

**Feature**: 001-simpleshop-demo | **Date**: 2026-06-13

Đây là hợp đồng công khai giữa UI và bộ test tự động (Nguyên tắc III của
constitution). **Đổi tên/xóa một testid hoặc route là breaking change** — phải
cập nhật file này và toàn bộ test liên quan trong cùng một thay đổi.

Quy ước (theo research.md R8):
- Phần tử tĩnh: `{khu-vực}-{phần-tử}`, kebab-case.
- Phần tử lặp theo dữ liệu: container mang testid động chứa entity id
  (`product-card-{productId}`), phần tử con mang testid tĩnh, test scope theo
  container.

## Toàn cục

- `<html lang="vi">`, `<title>SimpleShop</title>` (FR-014, accessibility).
- Mọi phần tử bấm được là `<button>`/`<a>` thật (dùng được bằng bàn phím —
  constitution V); trạng thái vô hiệu dùng thuộc tính `disabled`.
- Hai input ở checkout PHẢI có `<label>` hiển thị gắn với input ("Họ tên",
  "Mã bưu chính"); ảnh sản phẩm PHẢI có `alt` = tên sản phẩm.
- Không tải font/icon/ảnh từ ngoài — toàn bộ tài nguyên cục bộ (SC-005).

## Routes

| Route | Trang | Bảo vệ |
|-------|-------|--------|
| `/login` | Đăng nhập | Công khai; đã đăng nhập mà vào → redirect `/products` |
| `/products` | Danh sách sản phẩm | Yêu cầu đăng nhập (FR-002) |
| `/cart` | Giỏ hàng | Yêu cầu đăng nhập |
| `/checkout` | Nhập thông tin đặt hàng | Yêu cầu đăng nhập; giỏ trống → redirect `/cart` |
| `/confirmation` | Xác nhận đặt hàng | Yêu cầu đăng nhập; không có Order trong bộ nhớ → redirect `/products` |

URL không khớp → redirect `/products` (đã đăng nhập) hoặc `/login`.

## Header (mọi trang sau đăng nhập)

| data-testid | Phần tử | Nội dung/assert chính |
|-------------|---------|----------------------|
| `header-user-name` | text | displayName của user đang đăng nhập |
| `header-logout` | button "Đăng xuất" | bấm → về `/login` |
| `header-cart-link` | link/icon giỏ | bấm → `/cart` |
| `header-cart-count` | badge | `cartCount` (tổng quantity); `0` khi giỏ trống |

## Trang Đăng nhập (`/login`)

| data-testid | Phần tử | Ghi chú |
|-------------|---------|---------|
| `login-page` | container trang | assert đã ở trang login |
| `login-user-{userId}` | thẻ user (button) | `login-user-minh`, `login-user-lan`, `login-user-hung`; bấm → đăng nhập ngay |

## Trang Sản phẩm (`/products`)

| data-testid | Phần tử | Ghi chú |
|-------------|---------|---------|
| `products-page` | container trang | |
| `products-grid` | lưới sản phẩm | chứa đúng 6 product card |
| `product-card-{productId}` | container 1 sản phẩm | ví dụ `product-card-ban-phim-co` |

Bên trong mỗi `product-card-{productId}` (testid tĩnh, scope theo container):

| data-testid | Phần tử | Ghi chú |
|-------------|---------|---------|
| `product-name` | text | tên sản phẩm |
| `product-price` | text | định dạng `formatPrice` ("1.200.000 ₫") |
| `product-image` | img | có thuộc tính `alt` = tên sản phẩm |
| `add-to-cart` | button "Thêm vào giỏ" | disabled khi mặt hàng đã đạt quantity 5 |

## Trang Giỏ hàng (`/cart`)

| data-testid | Phần tử | Ghi chú |
|-------------|---------|---------|
| `cart-page` | container trang | |
| `cart-empty-message` | text | chỉ hiển thị khi giỏ trống |
| `cart-item-{productId}` | container 1 dòng mặt hàng | |
| `cart-total` | text | tổng tiền cả giỏ, định dạng `formatPrice` |
| `cart-checkout` | button "Thanh toán" | luôn hiển thị; `disabled` khi giỏ trống |

Bên trong mỗi `cart-item-{productId}`:

| data-testid | Phần tử | Ghi chú |
|-------------|---------|---------|
| `cart-item-name` | text | |
| `cart-item-unit-price` | text | giá đơn vị, `formatPrice` |
| `cart-item-quantity` | text | số lượng hiện tại |
| `cart-item-increase` | button "+" | disabled khi quantity = 5 |
| `cart-item-decrease` | button "−" | disabled khi quantity = 1 |
| `cart-item-subtotal` | text | thành tiền, `formatPrice` |
| `cart-item-remove` | button "Xóa" | xóa cả dòng |

## Trang Checkout (`/checkout`)

| data-testid | Phần tử | Ghi chú |
|-------------|---------|---------|
| `checkout-page` | container trang | |
| `checkout-fullname` | input họ tên | |
| `checkout-fullname-error` | text lỗi | chỉ hiển thị khi trống/toàn khoảng trắng |
| `checkout-postalcode` | input mã bưu chính | |
| `checkout-postalcode-error` | text lỗi | chỉ hiển thị khi trống/toàn khoảng trắng |
| `checkout-total` | text | tổng tiền sắp đặt, `formatPrice` |
| `checkout-submit` | button "Đặt hàng" | submit hợp lệ → `/confirmation` |

## Trang Xác nhận (`/confirmation`)

| data-testid | Phần tử | Ghi chú |
|-------------|---------|---------|
| `confirmation-page` | container trang | |
| `confirmation-message` | text | thông điệp đặt hàng thành công (tiếng Việt) |
| `confirmation-total` | text | tổng tiền của Order, `formatPrice`, bằng đúng `cart-total` trước khi đặt |
| `confirmation-back-to-products` | link/button | quay về `/products` |

## Quy tắc cho test

- Chỉ selector bằng `getByTestId` hoặc accessible role/label — cấm selector
  theo class CSS/cấu trúc DOM (constitution III).
- Trạng thái "vô hiệu" assert qua thuộc tính `disabled` của button.
- Mọi chuỗi tiền tệ assert đúng định dạng `formatPrice` (FR-013).
