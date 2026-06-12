# Tasks: SimpleShop — Web bán hàng demo phục vụ học automation testing

**Input**: Design documents from `/specs/001-simpleshop-demo/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/ui-contract.md, research.md, quickstart.md

**Tests**: KHÔNG có task viết test — theo research.md R7 và Complexity Tracking
trong plan.md, viết test E2E là bài tập của người học. App chỉ phải bảo đảm
mọi `data-testid`/route khớp contracts/ui-contract.md (kiểm ở T024).

**Organization**: Task nhóm theo user story để mỗi story hoàn thành và kiểm
chứng được độc lập (checkpoint cuối mỗi phase).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Chạy song song được (khác file, không phụ thuộc task chưa xong)
- **[Story]**: US1–US4 theo spec.md

## Path Conventions

Single project tại repo root theo plan.md: `src/`, `public/`, không có `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Khởi tạo dự án Vite + React + TypeScript sạch sẽ, sẵn toolchain

- [ ] T001 Scaffold dự án Vite template `react-ts` tại repo root (`npm create vite@latest . -- --template react-ts`), cài `react-router-dom`, xác nhận `npm run dev` chạy được (package.json, vite.config.ts)
- [ ] T002 Dọn code demo của template: xóa `src/App.css`, `src/assets/react.svg`, nội dung counter trong `src/App.tsx`; đặt `<html lang="vi">` và `<title>SimpleShop</title>` trong `index.html` (theo ui-contract.md mục Toàn cục)
- [ ] T003 [P] Thêm Prettier: file `.prettierrc`, script `format` và kiểm tra script `lint` trong `package.json` (Nguyên tắc I constitution)
- [ ] T004 [P] Tạo design tokens và style nền: `src/styles/tokens.css` (màu, khoảng cách, cỡ chữ — Nguyên tắc V) và `src/styles/global.css`, import trong `src/main.tsx`

**Checkpoint**: `npm run dev` mở trang trống không lỗi, `npm run lint` sạch

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dữ liệu, tiện ích, state và khung route mà MỌI user story cần

- [ ] T005 [P] Tạo fixture user: `src/data/users.ts` export `type User` + mảng 3 user (minh/lan/hung) đúng data-model.md
- [ ] T006 [P] Tạo fixture sản phẩm: `src/data/products.ts` export `type Product` + mảng 6 sản phẩm (id, name, price VND, image `/images/{id}.svg`) đúng data-model.md
- [ ] T007 [P] Tạo `src/lib/format.ts`: hàm `formatPrice()` dùng `Intl.NumberFormat("vi-VN", {style:"currency", currency:"VND"})` (R6, FR-013)
- [ ] T008 [P] Tạo `src/lib/storage.ts`: đọc/ghi/xóa JSON localStorage an toàn (parse hỏng → trả mặc định, không crash) cho 2 khóa `simpleshop.session`, `simpleshop.cart`
- [ ] T009 Tạo `src/context/AuthContext.tsx`: state user hiện tại, `login(userId)`/`logout()`, khởi tạo từ và đồng bộ xuống `simpleshop.session` qua storage.ts (FR-009; đăng xuất KHÔNG xóa giỏ — assumption trong spec)
- [ ] T010 Tạo `src/context/CartContext.tsx`: `useReducer` với action add/increase/decrease/remove/clear, chặn quantity trong khoảng 1–5 ngay trong reducer (FR-005, FR-008), giá trị suy diễn `count` (Σ quantity) và `total`, khởi tạo từ và đồng bộ xuống `simpleshop.cart` (FR-009)
- [ ] T011 Tạo 5 page stub trong `src/pages/` (LoginPage.tsx, ProductsPage.tsx, CartPage.tsx, CheckoutPage.tsx, ConfirmationPage.tsx) — mỗi file render container rỗng mang testid trang (`login-page`, `products-page`, ...) theo ui-contract.md
- [ ] T012 Khai báo router trong `src/App.tsx` + mount providers trong `src/main.tsx`: 5 route theo ui-contract.md, component `RequireAuth` chặn 4 trang sau đăng nhập về `/login` (FR-002), đã đăng nhập vào `/login` → `/products`, URL lạ → redirect theo trạng thái đăng nhập

**Checkpoint**: Điều hướng tay giữa các URL hoạt động đúng guard — user story bắt đầu được

---

## Phase 3: User Story 1 — Đăng nhập và xem danh sách sản phẩm (P1) 🎯 MVP

**Goal**: Chọn user định sẵn vào app, thấy lưới 6 sản phẩm đầy đủ tên/giá/ảnh/nút; đăng xuất được

**Independent Test**: Mở app → bấm thẻ user → đếm đủ 6 card ở `/products`, thấy tên user trên header; tab ẩn danh vào thẳng `/cart` bị đẩy về `/login`; bấm Đăng xuất quay về `/login` (quickstart.md US1)

- [ ] T013 [P] [US1] Tạo 6 ảnh SVG cục bộ `public/images/{product-id}.svg` (khối màu + tên sản phẩm, mỗi file đặt tên theo id trong data-model.md — R5, SC-005)
- [ ] T014 [US1] Hoàn thiện `src/pages/LoginPage.tsx`: 3 thẻ user là `<button data-testid="login-user-{id}">` hiển thị displayName, bấm → `login()` + chuyển `/products` (FR-001, đăng nhập 1 chạm theo clarify)
- [ ] T015 [US1] Tạo `src/components/Header.tsx` và gắn vào layout các trang sau đăng nhập: `header-user-name`, nút `header-logout` (logout → `/login`, FR-003), link `header-cart-link` → `/cart`, badge `header-cart-count` đọc `count` từ CartContext (hiện `0` khi trống)
- [ ] T016 [US1] Hoàn thiện `src/pages/ProductsPage.tsx` + tạo `src/components/ProductCard.tsx`: lưới `products-grid` render 6 card từ fixture; mỗi card mang `product-card-{id}` chứa `product-name`, `product-price` (qua formatPrice), `product-image` (alt = tên), nút `add-to-cart` "Thêm vào giỏ" (FR-004; hành vi bấm nút làm ở US2)

**Checkpoint**: Toàn bộ kịch bản US1 trong quickstart.md đạt khi kiểm tay — đây là MVP

---

## Phase 4: User Story 2 — Thêm vào giỏ và bộ đếm giỏ hàng (P2)

**Goal**: Bấm "Thêm vào giỏ" cộng dồn số lượng (trần 5), badge cập nhật ngay và sống sót qua reload

**Independent Test**: Đăng nhập → bấm thêm 2 lần cùng sản phẩm → badge = 2; reload → badge vẫn 2; bấm đủ 5 lần → nút của sản phẩm đó disabled (quickstart.md US2)

- [ ] T017 [US2] Nối hành vi vào `src/components/ProductCard.tsx`: bấm `add-to-cart` dispatch action add của CartContext (cộng dồn, không tạo dòng trùng — FR-005); nút `disabled` khi mặt hàng đã đạt quantity 5 (FR-008)
- [ ] T018 [US2] Xác nhận chuỗi phản ứng badge trong `src/components/Header.tsx` + `src/context/CartContext.tsx`: badge cập nhật ngay sau add (FR-006), khôi phục đúng từ `simpleshop.cart` sau reload (FR-009), hiển thị `0` khi trống — chỉnh sửa nếu lệch

**Checkpoint**: Kịch bản US2 trong quickstart.md đạt; US1 vẫn hoạt động

---

## Phase 5: User Story 3 — Quản lý giỏ hàng (P3)

**Goal**: Trang giỏ liệt kê mặt hàng, chỉnh số lượng trong 1–5, xóa dòng, tổng tiền đúng, trạng thái rỗng rõ ràng

**Independent Test**: Thêm sẵn hàng → mở `/cart` → kiểm tên/giá/số lượng/thành tiền/tổng; tăng đến 5 và giảm về 1 thấy nút disabled đúng lúc; Xóa hết → thấy `cart-empty-message`, nút "Thanh toán" disabled (quickstart.md US3)

- [ ] T019 [US3] Hoàn thiện hiển thị `src/pages/CartPage.tsx`: render dòng `cart-item-{id}` (cart-item-name, cart-item-unit-price, cart-item-quantity, cart-item-subtotal — tiền qua formatPrice), `cart-total`, trạng thái rỗng `cart-empty-message` + nút `cart-checkout` ("Thanh toán") disabled khi trống (FR-007, FR-010)
- [ ] T020 [US3] Thêm điều khiển vào `src/pages/CartPage.tsx`: nút `cart-item-increase` (disabled tại 5), `cart-item-decrease` (disabled tại 1), `cart-item-remove` xóa dòng; mọi giá trị tiền + badge cập nhật ngay (FR-008, FR-006)

**Checkpoint**: Kịch bản US3 đạt; US1–US2 vẫn hoạt động

---

## Phase 6: User Story 4 — Checkout và xác nhận đặt hàng (P4)

**Goal**: Từ giỏ có hàng đi checkout, validate form, thấy trang xác nhận với tổng tiền đúng, giỏ được làm trống

**Independent Test**: Giỏ có hàng → Checkout → submit trống thấy 2 lỗi; điền hợp lệ → `/confirmation` hiện tổng đúng; quay lại products badge = 0 (quickstart.md US4)

- [ ] T021 [US4] Hoàn thiện `src/pages/CheckoutPage.tsx`: 2 input có `<label>` hiển thị ("Họ tên", "Mã bưu chính") với testid `checkout-fullname`/`checkout-postalcode`, hiển thị `checkout-total`; submit `checkout-submit` validate trim-rỗng từng trường → lỗi `checkout-*-error` tiếng Việt (FR-011); giỏ trống vào `/checkout` → redirect `/cart`; submit hợp lệ → tạo Order trong bộ nhớ (router state), gọi clear cart (FR-012), điều hướng `/confirmation`
- [ ] T022 [US4] Hoàn thiện `src/pages/ConfirmationPage.tsx`: đọc Order từ router state — không có → redirect `/products` (data-model vòng đời Order); hiển thị `confirmation-message` tiếng Việt, `confirmation-total` qua formatPrice, link `confirmation-back-to-products` (FR-012)

**Checkpoint**: Trọn hành trình đăng nhập → đặt hàng chạy đầu-cuối — toàn bộ spec hoàn thành

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T023 [P] Viết `README.md` tại repo root: giới thiệu 1 đoạn, lệnh chạy (`npm install`, `npm run dev`), trỏ tới specs/001-simpleshop-demo/quickstart.md và contracts/ui-contract.md cho người học automation
- [ ] T024 Rà soát toàn bộ `src/` đối chiếu contracts/ui-contract.md: mọi route, data-testid, trạng thái disabled, label, alt đúng 100% hợp đồng (SC-002), và toàn bộ văn bản UI là tiếng Việt (FR-014)
- [ ] T025 Chạy Definition of Done trong quickstart.md: kiểm tay 4 kịch bản US1–US4, thử tắt mạng dùng toàn luồng (SC-005), `npm run lint` + `npm run format` sạch, hành trình trọn vẹn < 2 phút (SC-001)

---

## Dependencies & Execution Order

```text
Phase 1 (Setup) ──▶ Phase 2 (Foundational) ──▶ US1 (P1) ──▶ US2 (P2) ──▶ US3 (P3) ──▶ US4 (P4) ──▶ Phase 7
```

- **Phase 2 chặn mọi user story** (fixture, context, router là nền chung).
- **US2 phụ thuộc US1** (cần ProductCard T016 để nối hành vi T017).
- **US3 phụ thuộc US2** (cần giỏ có dữ liệu thật để hiển thị/chỉnh).
- **US4 phụ thuộc US3** (nút Checkout nằm ở CartPage T019).
- Trong từng phase, task không đánh [P] làm theo thứ tự ID.

## Parallel Opportunities

- Phase 1: T003 ∥ T004 (sau T001–T002).
- Phase 2: T005 ∥ T006 ∥ T007 ∥ T008 (4 file độc lập), rồi T009 ∥ T010, rồi T011 → T012.
- US1: T013 (ảnh SVG) ∥ T014 (LoginPage) — khác file hoàn toàn.
- Phase 7: T023 ∥ T024.

## Implementation Strategy

**MVP trước (Phase 1 + 2 + US1)**: dừng tại checkpoint US1 đã có app đăng nhập
+ xem 6 sản phẩm chạy được — đủ để demo và để người học viết bài test automation
đầu tiên (luồng login). Sau đó giao từng story một: mỗi checkpoint là một
increment hoàn chỉnh, kiểm chứng độc lập theo kịch bản tương ứng trong
quickstart.md, và là một bài tập automation mới cho người học.
