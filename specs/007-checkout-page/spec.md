# Feature Specification: Trang Đặt Hàng (Checkout)

**Feature Branch**: `007-checkout-page`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "Trang đặt hàng (checkout) cho SimpleShop."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem Tóm Tắt Đơn Hàng (Priority: P1)

Người dùng sau khi xem giỏ hàng nhấn "Tiến hành đặt hàng" và thấy trang
checkout hiển thị đầy đủ tóm tắt các sản phẩm họ đã chọn cùng với chi phí.

**Why this priority**: Đây là bước đầu tiên của luồng checkout — không có thông
tin đơn hàng, người dùng không thể xác nhận mình đang mua gì trước khi điền
thông tin giao hàng.

**Independent Test**: Có thể test độc lập bằng cách điều hướng thẳng đến trang
checkout với giỏ hàng có sẵn và kiểm tra danh sách sản phẩm, tạm tính, phí
vận chuyển, và tổng tiền hiển thị đúng.

**Acceptance Scenarios**:

1. **Given** người dùng có ít nhất 1 sản phẩm trong giỏ hàng, **When** họ vào
   trang checkout, **Then** trang hiển thị danh sách sản phẩm gồm tên, số lượng,
   và đơn giá của từng sản phẩm.

2. **Given** người dùng có sản phẩm trong giỏ hàng, **When** họ xem trang
   checkout, **Then** tạm tính = tổng (đơn giá × số lượng) của tất cả sản phẩm
   được hiển thị đúng.

3. **Given** tổng giá trị đơn hàng đủ điều kiện miễn phí vận chuyển (≥ 500.000 đ),
   **When** người dùng xem trang checkout, **Then** phí vận chuyển hiển thị là
   "Miễn phí".

4. **Given** tổng giá trị đơn hàng dưới ngưỡng miễn phí vận chuyển,
   **When** người dùng xem trang checkout, **Then** phí vận chuyển cố định
   (30.000 đ) được hiển thị.

5. **Given** trang checkout đã tải, **When** người dùng nhìn vào tổng tiền,
   **Then** tổng tiền = tạm tính + phí vận chuyển.

---

### User Story 2 - Điền Thông Tin Nhận Hàng (Priority: P1)

Người dùng điền đầy đủ thông tin giao hàng vào form trên trang checkout.

**Why this priority**: Form thông tin nhận hàng là yêu cầu bắt buộc để đặt
hàng — không có thông tin này, đơn hàng không thể được xử lý.

**Independent Test**: Có thể test độc lập bằng cách kiểm tra từng trường input
xuất hiện trên trang, nhập dữ liệu hợp lệ vào từng trường, và xác nhận giá
trị được ghi nhận.

**Acceptance Scenarios**:

1. **Given** người dùng ở trang checkout, **When** họ nhìn vào form thông tin
   nhận hàng, **Then** form có đủ các trường: họ tên, email, số nhà và đường,
   phường/xã, quận/huyện, tỉnh/thành phố, số điện thoại, mã bưu chính.

2. **Given** người dùng ở trang checkout, **When** họ nhập thông tin hợp lệ
   vào tất cả các trường, **Then** tất cả giá trị được lưu và hiển thị trong
   các ô tương ứng.

3. **Given** người dùng ở trang checkout, **When** họ nhìn vào bất kỳ trường
   nào, **Then** trường đó có nhãn (label) mô tả rõ ràng yêu cầu nhập liệu.

---

### User Story 3 - Kiểm Tra Hợp Lệ Trước Khi Đặt Hàng (Priority: P1)

Người dùng nhấn "Đặt hàng" khi chưa điền đầy đủ thông tin và hệ thống chỉ rõ
các trường còn thiếu.

**Why this priority**: Validation là rào cản bảo vệ trước khi đơn hàng được
tạo — đây là luồng error path thiết yếu của checkout.

**Independent Test**: Có thể test độc lập bằng cách nhấn "Đặt hàng" với form
rỗng và kiểm tra từng trường thiếu hiển thị thông báo lỗi tương ứng.

**Acceptance Scenarios**:

1. **Given** người dùng bỏ trống một hoặc nhiều trường, **When** họ nhấn
   "Đặt hàng", **Then** hệ thống KHÔNG tạo đơn hàng và hiển thị thông báo lỗi
   tại mỗi trường bị bỏ trống.

2. **Given** người dùng bỏ trống tất cả các trường, **When** họ nhấn "Đặt hàng",
   **Then** tất cả các trường đều hiển thị thông báo lỗi chỉ rõ trường đó là
   bắt buộc.

3. **Given** người dùng bỏ trống chỉ một trường cụ thể, **When** họ nhấn
   "Đặt hàng", **Then** chỉ trường đó hiển thị lỗi, các trường đã điền không
   bị ảnh hưởng.

4. **Given** thông báo lỗi đang hiển thị, **When** người dùng điền thông tin
   hợp lệ vào trường đó, **Then** thông báo lỗi biến mất.

---

### User Story 4 - Đặt Hàng Thành Công và Xác Nhận (Priority: P1)

Người dùng điền đầy đủ thông tin hợp lệ, nhấn "Đặt hàng", và thấy trang xác
nhận thành công với mã đơn hàng và tổng tiền.

**Why this priority**: Đây là bước cuối của luồng checkout — xác nhận người
dùng rằng đơn hàng đã được ghi nhận thành công.

**Independent Test**: Có thể test độc lập bằng cách điền đầy đủ form hợp lệ,
nhấn "Đặt hàng", và xác nhận trang xác nhận xuất hiện với mã đơn hàng và tổng
tiền đúng.

**Acceptance Scenarios**:

1. **Given** người dùng đã điền đầy đủ và hợp lệ tất cả các trường,
   **When** họ nhấn "Đặt hàng", **Then** nút chuyển sang trạng thái "Đang xử lý..."
   và bị vô hiệu hoá, sau đó hệ thống tạo đơn hàng giả lập và điều hướng đến
   trang xác nhận thành công.

2. **Given** trang xác nhận thành công, **When** người dùng xem trang,
   **Then** trang hiển thị mã đơn hàng duy nhất và tổng tiền của đơn hàng.

3. **Given** trang xác nhận thành công, **When** người dùng xem trang,
   **Then** giỏ hàng được xóa (trống) sau khi đặt hàng thành công.

---

### Edge Cases

- Điều gì xảy ra khi người dùng vào trang checkout với giỏ hàng rỗng?
  → Tự động chuyển hướng về trang giỏ hàng (route hiện có).
- Định dạng email không hợp lệ (thiếu @) có bị từ chối không?
  → Trường email PHẢI validate đúng định dạng email cơ bản.
- Số điện thoại chứa ký tự không phải số có bị từ chối không?
  → Trường số điện thoại PHẢI chỉ chấp nhận chữ số.
- Người dùng nhấn Back từ trang xác nhận thì xảy ra gì?
  → Giỏ hàng đã xóa, người dùng thấy trang giỏ hàng trống — không thể đặt
  lại đơn hàng cũ.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Trang checkout PHẢI hiển thị danh sách sản phẩm từ giỏ hàng
  gồm tên sản phẩm, số lượng, và đơn giá cho mỗi sản phẩm.
- **FR-002**: Trang checkout PHẢI tính và hiển thị tạm tính bằng tổng
  (đơn giá × số lượng) của tất cả sản phẩm trong giỏ hàng.
- **FR-003**: Trang checkout PHẢI hiển thị phí vận chuyển: miễn phí nếu
  tổng giá trị đơn hàng ≥ 500.000 đ, ngược lại hiển thị phí cố định 30.000 đ.
- **FR-004**: Trang checkout PHẢI hiển thị tổng tiền = tạm tính + phí
  vận chuyển.
- **FR-005**: Form thông tin nhận hàng PHẢI có đủ 8 trường bắt buộc: họ tên,
  email, số nhà và đường, phường/xã, quận/huyện, tỉnh/thành phố, số điện thoại,
  mã bưu chính.
- **FR-006**: Hệ thống PHẢI ngăn đặt hàng nếu bất kỳ trường bắt buộc nào
  bị bỏ trống và PHẢI hiển thị thông báo lỗi tại mỗi trường còn thiếu.
- **FR-007**: Trường email PHẢI được kiểm tra đúng định dạng email (có ký tự
  `@` và phần tên miền).
- **FR-008**: Trường số điện thoại PHẢI chỉ chấp nhận chữ số.
- **FR-009**: Khi người dùng nhấn "Đặt hàng" với thông tin hợp lệ, hệ thống
  PHẢI tạo một mã đơn hàng duy nhất theo định dạng `ORD-YYYYMMDD-XXXX`
  (timestamp ngày + 4 ký tự ngẫu nhiên in hoa, ví dụ: `ORD-20260629-A3F2`)
  và chuyển người dùng đến trang xác nhận.
- **FR-010**: Trang xác nhận PHẢI hiển thị mã đơn hàng và tổng tiền đã thanh
  toán.
- **FR-011**: Sau khi đặt hàng thành công, giỏ hàng PHẢI được xóa.
- **FR-012**: Mọi trường nhập liệu, thông báo lỗi, vùng tóm tắt, và nút bấm
  PHẢI có thuộc tính `data-testid` theo quy ước kebab-case. Danh sách canonical
  (đây là hợp đồng công khai — đổi tên hoặc xoá là breaking change):

  | Phần tử | `data-testid` |
  |---------|--------------|
  | Input họ tên | `checkout-full-name` |
  | Input email | `checkout-email` |
  | Input số nhà và đường | `checkout-street-address` |
  | Input phường/xã | `checkout-ward` |
  | Input quận/huyện | `checkout-district` |
  | Input tỉnh/thành phố | `checkout-city` |
  | Input số điện thoại | `checkout-phone` |
  | Input mã bưu chính | `checkout-postal-code` |
  | Thông báo lỗi họ tên | `checkout-full-name-error` |
  | Thông báo lỗi email | `checkout-email-error` |
  | Thông báo lỗi số nhà/đường | `checkout-street-address-error` |
  | Thông báo lỗi phường/xã | `checkout-ward-error` |
  | Thông báo lỗi quận/huyện | `checkout-district-error` |
  | Thông báo lỗi tỉnh/thành phố | `checkout-city-error` |
  | Thông báo lỗi số điện thoại | `checkout-phone-error` |
  | Thông báo lỗi mã bưu chính | `checkout-postal-code-error` |
  | Vùng tóm tắt đơn hàng | `checkout-order-summary` |
  | Tạm tính | `checkout-subtotal` |
  | Phí vận chuyển | `checkout-shipping-fee` |
  | Tổng tiền | `checkout-total` |
  | Nút "Đặt hàng" / "Đang xử lý..." | `checkout-submit` |
  | Trang xác nhận thành công | `checkout-success` |
  | Mã đơn hàng trên trang xác nhận | `checkout-success-order-id` |
  | Tổng tiền trên trang xác nhận | `checkout-success-total` |
- **FR-014**: Khi người dùng nhấn "Đặt hàng" với thông tin hợp lệ, nút PHẢI
  hiển thị text "Đang xử lý..." và bị vô hiệu hoá cho đến khi điều hướng đến
  trang xác nhận hoàn tất — ngăn người dùng nhấn hai lần.
- **FR-013**: Nếu giỏ hàng trống khi người dùng vào trang checkout, hệ thống
  PHẢI tự động chuyển hướng về trang giỏ hàng (route hiện có, không hiển thị
  thông báo trung gian trên trang checkout).

### Key Entities

- **Order (Đơn hàng)**: Đại diện cho một đơn đặt hàng hoàn chỉnh; bao gồm
  mã đơn hàng duy nhất, danh sách sản phẩm, thông tin người nhận, tổng tiền,
  và phí vận chuyển. Được tạo ra khi người dùng xác nhận đặt hàng thành công.
- **DeliveryInfo (Thông tin nhận hàng)**: Bộ thông tin người nhận gồm họ tên,
  email, địa chỉ đầy đủ (số nhà/đường, phường/xã, quận/huyện, tỉnh/thành phố),
  số điện thoại, mã bưu chính.
- **OrderSummary (Tóm tắt đơn hàng)**: Kết quả tính toán từ giỏ hàng gồm
  tạm tính, phí vận chuyển, và tổng tiền.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể hoàn thành luồng checkout (từ trang giỏ hàng
  đến trang xác nhận) trong dưới 3 phút khi điền thông tin lần đầu.
- **SC-002**: 100% trường bắt buộc bị bỏ trống đều hiển thị thông báo lỗi
  ngay khi nhấn "Đặt hàng" — không có trường nào bị bỏ qua mà không báo lỗi.
- **SC-003**: Trang xác nhận luôn hiển thị mã đơn hàng và tổng tiền khớp với
  số liệu đã hiển thị trong tóm tắt đơn hàng trước khi đặt.
- **SC-004**: Tất cả 14 functional requirements đều có thể được kiểm chứng
  bằng test tự động sử dụng `data-testid`.
- **SC-005**: Sau khi đặt hàng thành công, giỏ hàng trống trong 100% trường
  hợp — người dùng không thể tạo đơn trùng bằng cách refresh trang xác nhận.

## Assumptions

- Người dùng đã thêm sản phẩm vào giỏ hàng trước khi vào trang checkout
  (luồng giỏ hàng đã tồn tại trong ứng dụng).
- Ngưỡng miễn phí vận chuyển là 500.000 đ và phí vận chuyển cố định là 30.000 đ
  — các con số này được xác nhận và không thay đổi.
- Đơn hàng được xử lý hoàn toàn phía client (giả lập) — không có API thật hay
  payment gateway theo Nguyên tắc IV của constitution.
- Mã đơn hàng được tạo phía client theo định dạng `ORD-YYYYMMDD-XXXX` (timestamp
  ngày + 4 ký tự ngẫu nhiên in hoa), đảm bảo duy nhất trong phạm vi một phiên làm việc.
- Thông tin đặt hàng không được lưu lâu dài — chỉ tồn tại trong session và
  hiển thị trên trang xác nhận.
- Ứng dụng đang dùng React (hoặc framework tương đương theo plan của feature
  trước) và có hệ thống routing cho phép điều hướng giữa các trang.
- Giỏ hàng hiện được lưu trong localStorage theo Ràng Buộc Kỹ Thuật.
- Ứng dụng chưa có form checkout; đây là feature mới hoàn toàn.

## Clarifications

### Session 2026-06-29

- Q: Định dạng mã đơn hàng được tạo tự động như thế nào? → A: `ORD-YYYYMMDD-XXXX` (timestamp ngày + 4 ký tự ngẫu nhiên in hoa, ví dụ `ORD-20260629-A3F2`)
- Q: Ngưỡng phí vận chuyển có được xác nhận trong spec không? → A: Có — miễn phí nếu ≥ 500.000 đ, phí cố định 30.000 đ nếu thấp hơn; không thay đổi khi planning
- Q: Khi giỏ hàng trống, trang checkout xử lý thế nào? → A: Tự động redirect về trang giỏ hàng (route hiện có), không hiển thị thông báo trên checkout
- Q: Nút "Đặt hàng" có trạng thái loading khi đang xử lý không? → A: Có — hiển thị text "Đang xử lý..." và bị vô hiệu hoá cho đến khi navigation hoàn tất
- Q: Danh sách `data-testid` có được xác định đầy đủ trong spec không? → A: Có — 24 định danh canonical được liệt kê trong FR-012 và là hợp đồng công khai

### Session 2026-06-29 (UI Redesign)

- Q: 4 trường địa chỉ riêng (số nhà/đường, phường/xã, quận/huyện, tỉnh/thành phố) có được gộp thành 1 textarea không? → A: Không — giữ nguyên 4 trường input riêng trong form; KHÔNG dùng textarea "Địa chỉ nhà" như trong mockup.
- Q: Text gộp địa chỉ từ 4 trường được hiển thị ở đâu? → A: Hiển thị trong order summary card (cột trái), cập nhật real-time theo 4 input fields — giúp người dùng xem lại địa chỉ giao hàng trước khi đặt.
- Q: Text gộp địa chỉ trong summary có cần `data-testid` không? → A: Không — đây là display phụ, không phải phần tử tương tác hay dữ liệu cần test tự động; FR-012 giữ nguyên không đổi.

### Session 2026-06-29 (Form Polish)

- Q: Label-to-input spacing quá lớn — cần giảm gap giữa label và input field. → A: Giảm `gap` trong CSS class `.field` xuống nhỏ hơn `var(--space-2)`.
- Q: Placeholder màu quá đậm — cần mờ hơn. → A: Thêm CSS `::placeholder` với màu muted hơn màu text thông thường.
- Q: Placeholder cho Phường/Xã, Quận/Huyện, Tỉnh/Thành phố nên là gì? → A: Để trống — không có placeholder cho 3 trường địa chỉ phụ này.
