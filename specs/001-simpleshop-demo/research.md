# Research: SimpleShop — lựa chọn kỹ thuật

**Feature**: 001-simpleshop-demo | **Date**: 2026-06-13

Mọi NEEDS CLARIFICATION trong Technical Context đã được giải quyết tại đây.

## R1. Stack nền tảng: Vite + React + TypeScript vs Vanilla HTML/CSS/TS

**Decision**: Vite + React 19 + TypeScript (template `react-ts` của `create-vite`).

**Rationale**:

SimpleShop là ứng dụng *nhiều trạng thái phản ứng*: bộ đếm giỏ ở góc trên phải
cập nhật ngay khi thêm/tăng/giảm/xóa ở bất kỳ đâu (FR-006), thành tiền và tổng
tiền tính lại theo từng thao tác (FR-007), nút tăng/giảm/thêm vô hiệu theo
ngưỡng 1–5 (FR-008). So sánh hai phương án theo đúng tiêu chí người dùng đưa ra:

| Tiêu chí | Vite + React + TS | Vanilla HTML/CSS/TS |
|---|---|---|
| Không backend/DB | Đạt (SPA tĩnh) | Đạt |
| Chạy local 1 lệnh | `npm run dev` | Cần dev server riêng (vẫn thường là Vite) → không thật sự "ít công cụ hơn" |
| Dễ gắn data-testid | Thuộc tính JSX bình thường, đặt một chỗ trong component | Phải gắn thủ công ở mọi nơi tạo DOM bằng chuỗi/`createElement`, dễ sót |
| Code sạch, dễ đọc (Nguyên tắc I) | UI = hàm của state; mỗi component một file ngắn | Phải tự viết code đồng bộ DOM (cập nhật badge, re-render danh sách giỏ, bật/tắt nút) — chính phần code này dài, lặp và dễ lỗi nhất |
| Đơn giản (Nguyên tắc II) | Thêm 1 khái niệm (React) nhưng *bớt* toàn bộ tầng đồng bộ DOM thủ công | Ít dependency hơn nhưng *nhiều code tự viết hơn* cho cùng hành vi |

Điểm mấu chốt: "đơn giản" theo constitution là *ít code phải đọc-hiểu-bảo trì*,
không phải *ít dependency bằng mọi giá*. Với app có state lan tỏa nhiều trang,
vanilla TS buộc tự cài đặt mini-framework (render, sync, event delegation) —
người học sẽ đọc code hạ tầng tự chế thay vì logic nghiệp vụ. React làm phần đó
một cách chuẩn mực, và là kỹ năng phổ biến nhất thị trường nên phục vụ tốt mục
tiêu học tập.

**Alternatives considered**:
- *Vanilla HTML/CSS/TS (MPA nhiều file HTML + localStorage)*: loại vì lý do trên;
  ngoài ra MPA làm mất state khi chuyển trang, buộc đọc/ghi localStorage ở mọi
  trang → logic phân tán, khó đọc.
- *Vue/Svelte*: tương đương về độ phù hợp nhưng React có nhiều tài liệu và mẫu
  test automation hơn cho người học.
- *Next.js/Remix*: loại — kéo theo server/SSR, vi phạm Nguyên tắc IV và II.

## R2. Routing

**Decision**: `react-router-dom` (5 route: `/login`, `/products`, `/cart`, `/checkout`, `/confirmation`).

**Rationale**: Spec có 5 trang với route guard (FR-002 chặn khi chưa đăng nhập).
React Router là cách chuẩn, ít code nhất để có URL riêng từng trang — URL riêng
cũng là thứ automation test cần (assert chuyển trang). Tự viết router vi phạm
tinh thần R1.

**Alternatives considered**: state-based "page switching" không đổi URL (loại —
không assert được điều hướng, không deep-link để test từng trang); TanStack
Router (loại — mạnh nhưng dư so với 5 route tĩnh).

## R3. Quản lý state giỏ hàng & phiên đăng nhập

**Decision**: React Context + `useReducer` (CartContext, AuthContext), đồng bộ
xuống `localStorage`. Không dùng thư viện state ngoài.

**Rationale**: Hai mảnh state toàn cục (user hiện tại, giỏ hàng) với vài action
(login/logout, add/increase/decrease/remove/clear) — Context + reducer là đủ,
có sẵn trong React, và reducer thuần là nơi tập trung quy tắc nghiệp vụ (trần
5, sàn 1) rất dễ đọc. Redux/Zustand thêm dependency không cần thiết (Nguyên tắc II).

**Alternatives considered**: Zustand (gọn nhưng thêm dependency); Redux Toolkit
(quá cỡ); chỉ useState + prop drilling (badge ở Header cần state xuyên trang →
Context hợp lý hơn).

## R4. Lưu trữ bền (persistence)

**Decision**: `localStorage` với 2 khóa: `simpleshop.session` (user đang đăng
nhập), `simpleshop.cart` (mảng `{productId, quantity}`). Order KHÔNG lưu bền —
truyền qua state điều hướng, reload trang xác nhận thì chuyển về `/products`.

**Rationale**: FR-009 yêu cầu giữ giỏ + phiên khi reload; constitution chỉ cho
phép storage trình duyệt. Assumptions đã chốt không có lịch sử đơn hàng nên
không lưu Order.

**Alternatives considered**: sessionStorage (mất khi đóng tab — kém hơn cho
thực hành test nhiều phiên); IndexedDB (quá cỡ cho 2 khóa JSON).

## R5. Dữ liệu sản phẩm & user

**Decision**: Fixture TypeScript tĩnh trong `src/data/products.ts` và
`src/data/users.ts` (typed, import trực tiếp). Ảnh sản phẩm là file SVG cục bộ
trong `public/images/` (vẽ khối màu + tên — không cần ảnh thật).

**Rationale**: File `.ts` cho type-check và autocomplete ngay, không cần fetch
(tránh trạng thái loading không cần thiết). SVG cục bộ giữ SC-005 (offline
100%, không phụ thuộc dịch vụ ảnh ngoài) và nhẹ repo.

**Alternatives considered**: JSON + fetch từ `public/` (thêm async/loading vô
ích); URL ảnh ngoài như picsum (loại — vi phạm offline SC-005).

## R6. Định dạng tiền tệ

**Decision**: Hàm `formatPrice()` duy nhất trong `src/lib/format.ts`, dùng
`Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })`, kết quả
dạng "1.000.000 ₫" theo FR-013. Mọi nơi hiển thị giá PHẢI qua hàm này.

**Rationale**: Built-in của trình duyệt, đúng định dạng đã chốt ở clarify, một
nguồn duy nhất bảo đảm nhất quán (Nguyên tắc V) và test assert được chuỗi ổn định.

**Alternatives considered**: tự nối chuỗi (dễ lệch định dạng giữa các trang);
thư viện format (dư thừa).

## R7. Test tự động: KHÔNG nằm trong phạm vi app

**Decision**: App KHÔNG kèm bộ test viết sẵn. Khả năng test được bảo đảm bằng
hợp đồng `contracts/ui-contract.md` (data-testid + routes). Việc viết test
E2E là **bài tập của người học**; công cụ khuyến nghị: Playwright (có
`getByTestId` first-class, auto-wait, chạy offline) — người học tự khởi tạo
khi sẵn sàng (`npm init playwright@latest`).

**Rationale**: Mục đích của SimpleShop là *học* automation testing — repo kèm
sẵn lời giải sẽ triệt tiêu bài tập (giống các trang thực hành như SauceDemo:
chỉ cung cấp app + selector ổn định, không cung cấp test). Yêu cầu gốc của
constitution là UI *dễ test tự động* (định danh ổn định), không phải app
*kèm test*. Bỏ bộ test cũng bỏ được dependency `@playwright/test` khỏi dự án
(Nguyên tắc II). Dòng "acceptance scenario phải có test tự động đi kèm" trong
quy trình của constitution được thỏa mãn bởi chính bài thực hành của người học
theo từng user story.

**Alternatives considered**: kèm bộ test đầy đủ (loại — làm hộ bài tập, thêm
dependency); kèm 1 test mẫu làm ví dụ (loại — vẫn thêm toolchain vào repo;
ví dụ selector đã có đủ trong ui-contract.md).

## R8. Quy ước data-testid

**Decision**: kebab-case có ngữ cảnh theo constitution, hai dạng:
- Phần tử tĩnh: `{khu-vực}-{phần-tử}` — ví dụ `header-cart-count`, `checkout-submit`.
- Phần tử lặp theo dữ liệu: container mang id động `{khối}-{entityId}`
  (ví dụ `product-card-tai-nghe`), phần tử con bên trong mang testid tĩnh
  (`add-to-cart`, `cart-item-increase`) — test scope theo container:
  `getByTestId('product-card-tai-nghe').getByTestId('add-to-cart')`.

Danh mục testid đầy đủ là hợp đồng công khai, định nghĩa tại
`contracts/ui-contract.md` (xem Phase 1).

**Rationale**: Pattern container-động/con-tĩnh tránh bùng nổ chuỗi ghép, dạy
người học kỹ thuật scoping selector — đúng trọng tâm dự án.

## R9. Chất lượng code

**Decision**: ESLint (flat config của template Vite) + Prettier mặc định;
script `npm run lint` và `npm run format`. CSS thuần với design tokens là CSS
custom properties trong `src/styles/tokens.css`.

**Rationale**: Nguyên tắc I yêu cầu linter/formatter thống nhất; Nguyên tắc V
yêu cầu token chung cho màu/khoảng cách/cỡ chữ. CSS thuần đủ cho 5 trang, không
cần Tailwind/UI kit (Nguyên tắc II).

**Alternatives considered**: Tailwind (thêm khái niệm, che mất CSS cơ bản với
người học); CSS Modules (hợp lệ nhưng CSS thuần + BEM nhẹ đủ ở quy mô này).
