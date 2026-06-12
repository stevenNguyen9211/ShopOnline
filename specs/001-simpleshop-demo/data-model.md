# Data Model: SimpleShop

**Feature**: 001-simpleshop-demo | **Date**: 2026-06-13

Toàn bộ dữ liệu nằm phía client: fixture tĩnh (User, Product) + state trong
trình duyệt (Cart, Order). Không có backend/database (Nguyên tắc IV).

## Entities

### User (fixture tĩnh — `src/data/users.ts`)

| Trường | Kiểu | Ràng buộc |
|--------|------|-----------|
| `id` | string | duy nhất, kebab-case, dùng trong testid (`login-user-{id}`) |
| `displayName` | string | tên hiển thị tiếng Việt trên thẻ đăng nhập và header |

**Dữ liệu cố định (3 user)**:

| id | displayName |
|----|-------------|
| `minh` | Minh Nguyễn |
| `lan` | Lan Trần |
| `hung` | Hùng Phạm |

### Product (fixture tĩnh — `src/data/products.ts`)

| Trường | Kiểu | Ràng buộc |
|--------|------|-----------|
| `id` | string | duy nhất, kebab-case, dùng trong testid (`product-card-{id}`, `cart-item-{id}`) |
| `name` | string | tên tiếng Việt |
| `price` | number | VND, số nguyên dương; hiển thị qua `formatPrice()` duy nhất |
| `image` | string | đường dẫn cục bộ `/images/{id}.svg` |

**Dữ liệu cố định (6 sản phẩm)**:

| id | name | price (VND) |
|----|------|-------------|
| `ban-phim-co` | Bàn phím cơ | 1.200.000 |
| `chuot-khong-day` | Chuột không dây | 450.000 |
| `tai-nghe-bluetooth` | Tai nghe Bluetooth | 890.000 |
| `balo-laptop` | Balo laptop | 650.000 |
| `binh-giu-nhiet` | Bình giữ nhiệt | 320.000 |
| `den-ban-led` | Đèn bàn LED | 280.000 |

> Giá là số "đẹp" đa dạng để tổng tiền trong test dễ tính nhẩm nhưng không trùng nhau.

### CartItem (state + localStorage)

| Trường | Kiểu | Ràng buộc |
|--------|------|-----------|
| `productId` | string | FK → Product.id; mỗi productId tối đa 1 dòng (FR-005) |
| `quantity` | number | số nguyên, **1 ≤ quantity ≤ 5** (FR-008) |

Giá trị suy diễn (không lưu): `subtotal = product.price × quantity`;
`cartTotal = Σ subtotal`; `cartCount = Σ quantity` (hiển thị ở badge, FR-006).

### Order (chỉ trong bộ nhớ — không lưu bền)

| Trường | Kiểu | Ràng buộc |
|--------|------|-----------|
| `fullName` | string | bắt buộc, trim ≠ rỗng (FR-011) |
| `postalCode` | string | bắt buộc, trim ≠ rỗng (FR-011); không validate định dạng (quyết định ở clarify) |
| `total` | number | tổng VND tại thời điểm đặt, hiển thị ở trang xác nhận (FR-012) |

## Lưu trữ localStorage

| Khóa | Giá trị | Ghi chú |
|------|---------|---------|
| `simpleshop.session` | `{"userId": string}` | xóa khi đăng xuất |
| `simpleshop.cart` | `CartItem[]` | xóa khi đặt hàng thành công (FR-012) |

Quy tắc đọc: dữ liệu hỏng/không parse được → coi như rỗng (về login/giỏ trống),
không crash.

## Vòng đời & chuyển trạng thái

### Phiên đăng nhập

```
Chưa đăng nhập ──bấm thẻ user──▶ Đã đăng nhập (session ghi localStorage)
Đã đăng nhập ──bấm Đăng xuất──▶ Chưa đăng nhập (xóa session, GIỮ giỏ hàng)
Chưa đăng nhập + vào URL bảo vệ ──▶ redirect /login (FR-002)
```

> Đăng xuất giữ nguyên giỏ hàng (giỏ gắn với trình duyệt, không gắn với user —
> đơn giản hóa có chủ đích, ghi trong Assumptions của spec).

### Dòng mặt hàng trong giỏ

```
(không có) ──Thêm vào giỏ──▶ quantity = 1
quantity n ──tăng / Thêm vào giỏ──▶ n+1   (chặn tại 5: nút vô hiệu)
quantity n ──giảm──▶ n−1                   (chặn tại 1: nút giảm vô hiệu)
quantity n ──Xóa──▶ (không có)
toàn giỏ ──đặt hàng thành công──▶ rỗng (FR-012)
```

### Order

```
Giỏ có hàng ──Checkout──▶ form ──submit hợp lệ──▶ Order tạo trong bộ nhớ
  ──▶ /confirmation hiển thị total ──reload/rời trang──▶ Order biến mất
Vào /confirmation không có Order ──▶ redirect /products
Vào /checkout khi giỏ trống ──▶ redirect /cart
```
