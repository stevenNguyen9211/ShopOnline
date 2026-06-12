# Feature Specification: SimpleShop — Web bán hàng demo phục vụ học automation testing

**Feature Branch**: `001-simpleshop-demo`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "Xây một trang web bán hàng demo tên SimpleShop để học automation testing. Có một trang đăng nhập với danh sách user định sẵn (không cần mật khẩu thật, chọn user là vào). Sau khi đăng nhập, hiển thị danh sách sản phẩm dạng lưới, mỗi sản phẩm có tên, giá, ảnh và nút \"Thêm vào giỏ\". Người dùng thấy số lượng mặt hàng trong giỏ ở góc trên. Có trang giỏ hàng liệt kê các mặt hàng đã thêm, cho phép tăng giảm số lượng và xóa. Có nút Checkout dẫn tới trang nhập họ tên và mã bưu chính, rồi hiển thị trang xác nhận đặt hàng thành công với tổng tiền. Dữ liệu sản phẩm cố định, khoảng 6 sản phẩm. Không có thanh toán thật."

## Clarifications

### Session 2026-06-13

- Q: Toàn bộ văn bản giao diện của SimpleShop dùng ngôn ngữ nào? → A: Tiếng Việt
- Q: Giá sản phẩm hiển thị theo loại tiền tệ và định dạng nào? → A: VND, định dạng "1.000.000 ₫" (số nguyên, phân tách hàng nghìn bằng dấu chấm)
- Q: Thao tác đăng nhập cụ thể diễn ra thế nào? → A: Danh sách user hiển thị dạng thẻ; bấm vào thẻ user là đăng nhập ngay, không có bước xác nhận riêng
- Q: Số lượng mỗi mặt hàng trong giỏ có giới hạn tối đa không? → A: Tối đa 5; nút tăng (và nút "Thêm vào giỏ" với sản phẩm đã đạt mức 5) bị vô hiệu ở mức trần

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đăng nhập và xem danh sách sản phẩm (Priority: P1)

Người học mở SimpleShop, thấy trang đăng nhập với danh sách user định sẵn.
Họ chọn một user (không cần mật khẩu) và được đưa vào trang danh sách sản
phẩm, hiển thị dạng lưới gồm 6 sản phẩm — mỗi sản phẩm có tên, giá, ảnh và
nút "Thêm vào giỏ".

**Why this priority**: Đây là cổng vào của toàn bộ ứng dụng và là bài thực
hành automation đầu tiên (luồng đăng nhập). Không có nó thì không demo được
bất kỳ luồng nào khác.

**Independent Test**: Có thể test độc lập bằng cách mở ứng dụng, chọn một
user trong danh sách, xác nhận được chuyển đến trang sản phẩm và đếm đủ 6
sản phẩm với đầy đủ tên, giá, ảnh, nút thêm vào giỏ.

**Acceptance Scenarios**:

1. **Given** người dùng chưa đăng nhập đang ở trang đăng nhập, **When** bấm vào thẻ của một user trong danh sách định sẵn, **Then** được đăng nhập ngay và chuyển đến trang danh sách sản phẩm, thấy tên user đang đăng nhập hiển thị trên giao diện.
2. **Given** người dùng đã đăng nhập, **When** xem trang danh sách sản phẩm, **Then** thấy đúng 6 sản phẩm dạng lưới, mỗi sản phẩm hiển thị tên, giá, ảnh và nút "Thêm vào giỏ".
3. **Given** người dùng chưa đăng nhập, **When** truy cập trực tiếp trang sản phẩm, giỏ hàng hoặc checkout bằng đường dẫn, **Then** bị chuyển về trang đăng nhập.
4. **Given** người dùng đã đăng nhập, **When** bấm đăng xuất, **Then** quay về trang đăng nhập và không còn truy cập được các trang yêu cầu đăng nhập.

---

### User Story 2 - Thêm sản phẩm vào giỏ và thấy bộ đếm giỏ hàng (Priority: P2)

Người dùng đã đăng nhập bấm "Thêm vào giỏ" trên một hoặc nhiều sản phẩm.
Ở góc trên của mọi trang (sau đăng nhập) có biểu tượng giỏ hàng kèm bộ đếm
hiển thị tổng số đơn vị mặt hàng trong giỏ, cập nhật ngay khi thêm.

**Why this priority**: Là hành động mua sắm cốt lõi và là bài thực hành
kiểm tra trạng thái động (bộ đếm thay đổi theo hành động người dùng).

**Independent Test**: Có thể test độc lập bằng cách đăng nhập, bấm "Thêm
vào giỏ" trên các sản phẩm khác nhau và xác nhận bộ đếm ở góc trên tăng
đúng số lần bấm.

**Acceptance Scenarios**:

1. **Given** giỏ hàng đang trống, **When** người dùng bấm "Thêm vào giỏ" trên một sản phẩm, **Then** bộ đếm giỏ hàng ở góc trên hiển thị 1.
2. **Given** giỏ hàng đang có 1 đơn vị, **When** người dùng bấm "Thêm vào giỏ" trên chính sản phẩm đó lần nữa, **Then** bộ đếm hiển thị 2 và giỏ vẫn chỉ có 1 dòng mặt hàng với số lượng 2.
3. **Given** giỏ hàng đang có mặt hàng, **When** người dùng tải lại trang trên cùng trình duyệt, **Then** bộ đếm và nội dung giỏ hàng giữ nguyên.
4. **Given** giỏ hàng đang trống, **When** người dùng nhìn khu vực góc trên, **Then** bộ đếm hiển thị 0 hoặc trạng thái trống rõ ràng.

---

### User Story 3 - Quản lý giỏ hàng (Priority: P3)

Người dùng mở trang giỏ hàng từ biểu tượng giỏ ở góc trên. Trang liệt kê
các mặt hàng đã thêm — mỗi dòng có tên, giá đơn vị, số lượng, thành tiền —
cùng tổng tiền của cả giỏ. Người dùng có thể tăng/giảm số lượng từng mặt
hàng và xóa mặt hàng khỏi giỏ.

**Why this priority**: Hoàn thiện vòng quản lý giỏ và cung cấp bài thực
hành thao tác danh sách động (tăng, giảm, xóa, tính tổng).

**Independent Test**: Có thể test độc lập bằng cách thêm sẵn vài mặt hàng,
mở trang giỏ, thực hiện tăng/giảm/xóa và xác nhận số lượng, thành tiền,
tổng tiền cập nhật đúng.

**Acceptance Scenarios**:

1. **Given** giỏ có mặt hàng, **When** người dùng mở trang giỏ hàng, **Then** thấy từng dòng mặt hàng với tên, giá đơn vị, số lượng, thành tiền, và tổng tiền cả giỏ.
2. **Given** một mặt hàng có số lượng 1, **When** người dùng bấm tăng, **Then** số lượng thành 2, thành tiền dòng đó và tổng tiền cập nhật ngay, bộ đếm góc trên cũng tăng tương ứng.
3. **Given** một mặt hàng có số lượng 2, **When** người dùng bấm giảm, **Then** số lượng thành 1 và các giá trị tiền cập nhật ngay.
4. **Given** một mặt hàng có số lượng 1, **When** người dùng nhìn nút giảm, **Then** nút giảm bị vô hiệu hóa (xóa mặt hàng phải dùng nút Xóa).
5. **Given** một mặt hàng có số lượng 5, **When** người dùng nhìn nút tăng, **Then** nút tăng bị vô hiệu hóa (số lượng tối đa mỗi mặt hàng là 5).
6. **Given** giỏ có 2 mặt hàng, **When** người dùng bấm Xóa trên một mặt hàng, **Then** dòng đó biến mất, tổng tiền và bộ đếm cập nhật ngay.
7. **Given** giỏ trống, **When** người dùng mở trang giỏ hàng, **Then** thấy thông báo giỏ trống và nút "Thanh toán" bị vô hiệu (disabled).

---

### User Story 4 - Checkout và xác nhận đặt hàng (Priority: P4)

Từ trang giỏ hàng có mặt hàng, người dùng bấm nút "Thanh toán", được đưa tới
trang nhập họ tên và mã bưu chính. Sau khi điền hợp lệ và xác nhận, hệ
thống hiển thị trang xác nhận đặt hàng thành công kèm tổng tiền của đơn
hàng. Không có thanh toán thật — đặt hàng chỉ là giả lập.

**Why this priority**: Khép kín hành trình mua hàng đầu-cuối và cung cấp
bài thực hành form validation + luồng nhiều bước, nhưng chỉ có ý nghĩa khi
các story trước đã hoạt động.

**Independent Test**: Có thể test độc lập bằng cách chuẩn bị giỏ có mặt
hàng, bấm Checkout, điền form và xác nhận trang thành công hiển thị đúng
tổng tiền.

**Acceptance Scenarios**:

1. **Given** giỏ có mặt hàng, **When** người dùng bấm nút "Thanh toán", **Then** được chuyển đến trang nhập thông tin gồm trường họ tên và mã bưu chính.
2. **Given** đang ở trang nhập thông tin, **When** người dùng để trống họ tên hoặc mã bưu chính và bấm xác nhận, **Then** thấy thông báo lỗi rõ ràng cho từng trường thiếu và không được chuyển trang.
3. **Given** đang ở trang nhập thông tin với giỏ có tổng tiền X, **When** người dùng điền đủ họ tên và mã bưu chính rồi xác nhận, **Then** thấy trang xác nhận đặt hàng thành công hiển thị thông điệp thành công và tổng tiền đúng bằng X.
4. **Given** vừa đặt hàng thành công, **When** người dùng quay lại trang sản phẩm, **Then** giỏ hàng đã được làm trống (bộ đếm về 0).

---

### Edge Cases

- Truy cập trực tiếp trang sản phẩm/giỏ/checkout khi chưa đăng nhập → chuyển về trang đăng nhập (US1, kịch bản 3).
- Truy cập trang checkout khi giỏ trống → chuyển về trang giỏ hàng (hoặc trang sản phẩm), không cho đặt đơn rỗng.
- Giảm số lượng khi đang ở mức 1 → nút giảm vô hiệu; xóa chỉ qua nút Xóa để hành vi dễ đoán cho test.
- Tăng số lượng khi đang ở mức 5 (trần) → nút tăng vô hiệu; nút "Thêm vào giỏ" của sản phẩm đã đạt trần cũng vô hiệu.
- Tải lại trang giữa chừng → trạng thái đăng nhập và giỏ hàng được giữ nguyên trong cùng trình duyệt.
- Form checkout chỉ nhập khoảng trắng → coi như trống, hiển thị lỗi.
- Ảnh sản phẩm không tải được → vẫn hiển thị khung sản phẩm với tên/giá/nút đầy đủ (ảnh có văn bản thay thế).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI hiển thị trang đăng nhập với danh sách user định sẵn (3 user) dạng thẻ; bấm vào thẻ user là đăng nhập ngay, không cần mật khẩu hay bước xác nhận riêng.
- **FR-002**: Hệ thống PHẢI chặn truy cập các trang sản phẩm, giỏ hàng, checkout, xác nhận khi chưa đăng nhập và chuyển hướng về trang đăng nhập.
- **FR-003**: Hệ thống PHẢI hiển thị tên user đang đăng nhập và cho phép đăng xuất từ mọi trang sau đăng nhập.
- **FR-004**: Hệ thống PHẢI hiển thị đúng 6 sản phẩm cố định dạng lưới; mỗi sản phẩm có tên, giá, ảnh (kèm văn bản thay thế) và nút "Thêm vào giỏ".
- **FR-005**: Người dùng PHẢI thêm được sản phẩm vào giỏ từ trang danh sách; thêm lặp lại cùng sản phẩm làm tăng số lượng của dòng mặt hàng đó (không tạo dòng trùng).
- **FR-006**: Hệ thống PHẢI hiển thị bộ đếm giỏ hàng ở góc trên của mọi trang sau đăng nhập, bằng tổng số đơn vị mặt hàng trong giỏ, và cập nhật ngay sau mỗi thao tác thêm/tăng/giảm/xóa.
- **FR-007**: Trang giỏ hàng PHẢI liệt kê từng mặt hàng với tên, giá đơn vị, số lượng, thành tiền, và hiển thị tổng tiền cả giỏ.
- **FR-008**: Người dùng PHẢI tăng/giảm được số lượng từng mặt hàng trong giỏ; số lượng nằm trong khoảng 1–5: nút giảm vô hiệu ở mức 1, nút tăng vô hiệu ở mức 5, và việc xóa mặt hàng thực hiện qua nút Xóa riêng. Nút "Thêm vào giỏ" ở trang danh sách cũng không vượt được mức 5 (vô hiệu khi sản phẩm đã đạt trần).
- **FR-009**: Giỏ hàng và trạng thái đăng nhập PHẢI được giữ nguyên khi tải lại trang trên cùng trình duyệt.
- **FR-010**: Từ trang giỏ hàng có mặt hàng, người dùng PHẢI đi được tới trang checkout qua nút "Thanh toán" (testid `cart-checkout`); nút này bị vô hiệu (disabled, vẫn hiển thị) khi giỏ trống.
- **FR-011**: Trang checkout PHẢI có hai trường bắt buộc là họ tên và mã bưu chính; bỏ trống (hoặc chỉ khoảng trắng) trường nào thì hiển thị lỗi cho trường đó và không cho đặt hàng.
- **FR-012**: Sau khi xác nhận checkout hợp lệ, hệ thống PHẢI hiển thị trang xác nhận đặt hàng thành công kèm tổng tiền của đơn hàng, và làm trống giỏ hàng. Không có giao dịch thanh toán thật.
- **FR-013**: Giá tiền PHẢI hiển thị bằng VND theo định dạng "1.000.000 ₫" (số nguyên, phân tách hàng nghìn bằng dấu chấm, hậu tố ₫) nhất quán trên mọi trang (danh sách, giỏ, checkout, xác nhận).
- **FR-014**: Toàn bộ văn bản giao diện (nhãn nút, tiêu đề, thông báo lỗi, thông điệp thành công) PHẢI là tiếng Việt, thống nhất trên mọi trang.
- **FR-015**: Mọi phần tử tương tác và vùng dữ liệu quan trọng (nút đăng nhập từng user, nút thêm giỏ từng sản phẩm, bộ đếm giỏ, nút tăng/giảm/xóa từng dòng, trường form, thông báo lỗi, tổng tiền, thông điệp thành công) PHẢI có định danh ổn định để test tự động nhắm tới một cách tin cậy.

### Key Entities

- **User**: Người dùng demo định sẵn; có định danh và tên hiển thị. Không có mật khẩu, không có dữ liệu cá nhân thật.
- **Product**: Sản phẩm trong danh mục cố định (6 sản phẩm); có định danh, tên, giá, ảnh.
- **CartItem**: Một dòng mặt hàng trong giỏ; gắn với một Product và số lượng (≥ 1); thành tiền = giá × số lượng.
- **Order**: Đơn hàng giả lập tạo lúc checkout; gồm họ tên, mã bưu chính và tổng tiền tại thời điểm đặt. Chỉ cần tồn tại đủ để hiển thị trang xác nhận.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng mới hoàn thành trọn hành trình (đăng nhập → thêm 2 sản phẩm → chỉnh số lượng → checkout → thấy xác nhận) trong dưới 2 phút mà không cần hướng dẫn.
- **SC-002**: 100% các kịch bản chấp nhận trong spec này tự động hóa được bằng định danh ổn định, không cần selector theo cấu trúc giao diện.
- **SC-003**: Mọi thao tác (đăng nhập, thêm giỏ, tăng/giảm/xóa, đặt hàng) phản hồi tức thì với người dùng (cảm nhận dưới 1 giây).
- **SC-004**: Tổng tiền hiển thị ở giỏ hàng và trang xác nhận chính xác 100% so với tổng (giá × số lượng) của các mặt hàng trong mọi kịch bản test.
- **SC-005**: Ứng dụng dùng được hoàn toàn ngoại tuyến sau khi mở: 0 phụ thuộc vào dịch vụ bên ngoài trong mọi luồng.

## Assumptions

- Danh sách user định sẵn gồm 3 user là đủ cho mục đích học automation (ví dụ một user "chuẩn" và có thể thêm biến thể sau); mô tả gốc không nêu số lượng cụ thể.
- Bộ đếm giỏ hàng hiển thị tổng số đơn vị (tổng quantity), không phải số dòng mặt hàng — theo quy ước phổ biến của trang thương mại điện tử.
- Có chức năng đăng xuất để người học lặp lại luồng đăng nhập nhiều lần khi thực hành automation, dù mô tả gốc không nêu.
- Giảm số lượng dừng ở mức 1 (không tự xóa khi về 0) để hành vi dễ đoán; xóa là hành động tường minh qua nút Xóa.
- Đơn hàng không cần lưu lịch sử sau khi rời trang xác nhận; không có trang "đơn hàng của tôi".
- Trạng thái giỏ/đăng nhập chỉ cần giữ trong cùng trình duyệt (theo nguyên tắc không backend của constitution); không đồng bộ giữa các thiết bị.
- Giỏ hàng gắn với trình duyệt, không gắn với user: đăng xuất (hoặc đổi user) KHÔNG xóa giỏ — đơn giản hóa có chủ đích; giỏ chỉ bị xóa khi đặt hàng thành công hoặc người dùng tự xóa từng mặt hàng.
- Tìm kiếm, lọc, phân trang, mã giảm giá, tồn kho nằm ngoài phạm vi phiên bản này.
