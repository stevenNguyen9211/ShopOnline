# Feature Specification: Bộ kiểm thử tự động E2E cho SimpleShop

**Feature Branch**: `002-e2e-simpleshop`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "Xây bộ kiểm thử tự động end-to-end cho app SimpleShop
(đã đặc tả ở specs/001-simpleshop-demo/spec.md). Cần phủ các luồng: đăng nhập
với user hợp lệ, hiển thị đúng danh sách sản phẩm, thêm sản phẩm vào giỏ
và kiểm tra số lượng cập nhật, tăng giảm và xóa mặt hàng trong giỏ,
hoàn tất checkout và kiểm tra trang xác nhận hiển thị đúng tổng tiền.
Bao gồm cả trường hợp lỗi: checkout khi giỏ trống, bỏ trống trường bắt buộc
ở form. Mỗi test phải truy ngược được tới yêu cầu tương ứng trong spec app."

**Phụ thuộc**: specs/001-simpleshop-demo/spec.md (app cần chạy được trước
khi chạy bộ test này). Mọi tham chiếu FR-### trong tài liệu này trỏ đến
Functional Requirements của spec ứng dụng đó.

## Clarifications

### Session 2026-06-13

- Q: Phạm vi trình duyệt mục tiêu của bộ test là gì? → A: Chỉ Chrome/Chromium
- Q: Cách thiết lập tiền điều kiện (precondition) cho test cần giỏ hàng có sẵn? → A: Toàn bộ qua UI (đăng nhập + thêm giỏ bằng click), không can thiệp trực tiếp localStorage

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Kiểm chứng đăng nhập và bảo vệ trang (Priority: P1)

Người học viết test kiểm tra rằng: chọn một user định sẵn trên trang đăng
nhập sẽ đưa vào app ngay lập tức với tên user hiển thị đúng; và mọi trang
yêu cầu đăng nhập sẽ chặn truy cập trực tiếp khi chưa đăng nhập.

**Ứng với app FR**: FR-001, FR-002, FR-003

**Why this priority**: Đây là điều kiện tiên quyết của toàn bộ bộ test — mọi
story khác đều bắt đầu từ trạng thái "đã đăng nhập". Đây cũng là bài automation
đầu tiên và đơn giản nhất để người học khởi đầu.

**Independent Test**: Chạy được độc lập bằng cách mở ứng dụng từ trạng thái
mới (không có session), thực hiện đăng nhập, xác nhận chuyển trang và tên
user đúng. Không cần dữ liệu giỏ hàng.

**Acceptance Scenarios**:

1. **Given** trình duyệt ở trạng thái sạch (không có session), **When** mở trang đăng nhập, **Then** thấy đúng 3 thẻ user (Minh Nguyễn, Lan Trần, Hùng Phạm) có thể bấm được. *(FR-001)*
2. **Given** trang đăng nhập đang hiển thị, **When** bấm vào thẻ "Minh Nguyễn", **Then** được chuyển đến trang sản phẩm ngay và khu vực header hiển thị "Minh Nguyễn". *(FR-001, FR-003)*
3. **Given** không có session đăng nhập, **When** truy cập thẳng đường dẫn trang sản phẩm, **Then** bị chuyển hướng về trang đăng nhập. *(FR-002)*
4. **Given** không có session đăng nhập, **When** truy cập thẳng đường dẫn trang giỏ hàng, **Then** bị chuyển hướng về trang đăng nhập. *(FR-002)*
5. **Given** không có session đăng nhập, **When** truy cập thẳng đường dẫn trang checkout, **Then** bị chuyển hướng về trang đăng nhập. *(FR-002)*
6. **Given** người dùng đã đăng nhập, **When** bấm nút đăng xuất, **Then** bị chuyển về trang đăng nhập và không thể truy cập trang sản phẩm khi không đăng nhập lại. *(FR-003)*

---

### User Story 2 - Kiểm chứng hiển thị danh sách sản phẩm (Priority: P2)

Người học viết test xác nhận rằng trang sản phẩm sau đăng nhập hiển thị
đúng 6 sản phẩm cố định với đầy đủ thông tin và định dạng giá đúng chuẩn VND.

**Ứng với app FR**: FR-004, FR-013

**Why this priority**: Xác nhận nội dung trang sản phẩm là điều kiện để bắt
đầu các test thêm giỏ hàng. Đây cũng là bài luyện assert nội dung danh sách.

**Independent Test**: Chạy được độc lập sau khi đăng nhập; đếm số card sản
phẩm và kiểm tra thông tin từng card mà không cần thêm giỏ.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** xem trang sản phẩm, **Then** thấy đúng 6 card sản phẩm, mỗi card có tên sản phẩm, giá định dạng VND, ảnh, và nút "Thêm vào giỏ". *(FR-004, FR-013)*
2. **Given** đang xem trang sản phẩm, **When** đọc giá của một sản phẩm, **Then** giá có định dạng "X.XXX.XXX ₫" (số nguyên, phân tách hàng nghìn bằng dấu chấm, hậu tố ₫). *(FR-013)*
3. **Given** đang xem trang sản phẩm, **When** kiểm tra ảnh của từng sản phẩm, **Then** mỗi ảnh có văn bản thay thế (alt) bằng tên sản phẩm. *(FR-004)*

---

### User Story 3 - Kiểm chứng thêm vào giỏ và bộ đếm (Priority: P3)

Người học viết test xác nhận rằng bấm "Thêm vào giỏ" cộng dồn số lượng đúng,
bộ đếm trên header cập nhật ngay, giỏ hàng tồn tại sau khi tải lại trang, và
nút bị vô hiệu khi mặt hàng đạt số lượng tối đa.

**Ứng với app FR**: FR-005, FR-006, FR-008, FR-009

**Why this priority**: Kiểm tra trạng thái động quan trọng nhất của app; là
nền tảng để các test giỏ hàng và checkout chạy đúng.

**Independent Test**: Đăng nhập, bấm "Thêm vào giỏ" trên một sản phẩm nhiều
lần, đọc số trên badge; tải lại trang, đọc lại badge.

**Acceptance Scenarios**:

1. **Given** giỏ hàng đang trống sau khi đăng nhập, **When** bấm "Thêm vào giỏ" trên sản phẩm "Bàn phím cơ", **Then** bộ đếm giỏ hàng trên header chuyển từ 0 thành 1. *(FR-005, FR-006)*
2. **Given** "Bàn phím cơ" đang có 1 trong giỏ, **When** bấm "Thêm vào giỏ" trên cùng sản phẩm đó lần nữa, **Then** bộ đếm tăng lên 2 (không tạo dòng mới). *(FR-005, FR-006)*
3. **Given** giỏ hàng có 2 đơn vị "Bàn phím cơ", **When** tải lại trang, **Then** bộ đếm giỏ hàng vẫn hiển thị 2. *(FR-009)*
4. **Given** "Bàn phím cơ" đã đạt số lượng 5 trong giỏ, **When** xem nút "Thêm vào giỏ" của sản phẩm đó, **Then** nút đó ở trạng thái vô hiệu (disabled). *(FR-008)*

---

### User Story 4 - Kiểm chứng quản lý giỏ hàng (Priority: P4)

Người học viết test xác nhận rằng trang giỏ hàng hiển thị đúng danh sách mặt
hàng với giá, số lượng, thành tiền; các nút tăng/giảm/xóa hoạt động đúng và
cập nhật tổng tiền tức thì; giỏ trống hiển thị đúng trạng thái.

**Ứng với app FR**: FR-007, FR-008, FR-010, FR-013

**Why this priority**: Bài luyện thao tác danh sách động và kiểm tra tính
nhất quán số học (thành tiền = đơn giá × số lượng, tổng = Σ thành tiền).

**Independent Test**: Đăng nhập, thêm sẵn mặt hàng vào giỏ trong bước setup,
mở trang giỏ và thực hiện các thao tác kiểm tra.

**Acceptance Scenarios**:

1. **Given** giỏ có 2 đơn vị "Bàn phím cơ" (1.200.000 ₫/cái), **When** mở trang giỏ hàng, **Then** dòng "Bàn phím cơ" hiển thị giá đơn vị "1.200.000 ₫", số lượng 2, thành tiền "2.400.000 ₫", và tổng giỏ bằng "2.400.000 ₫". *(FR-007, FR-013)*
2. **Given** đang xem giỏ hàng với "Bàn phím cơ" số lượng 2, **When** bấm tăng, **Then** số lượng thành 3, thành tiền thành "3.600.000 ₫", tổng giỏ cập nhật đúng, bộ đếm header cũng tăng. *(FR-007, FR-008)*
3. **Given** đang xem giỏ hàng với "Bàn phím cơ" số lượng 2, **When** bấm giảm, **Then** số lượng thành 1, các giá trị tiền cập nhật đúng. *(FR-008)*
4. **Given** "Bàn phím cơ" có số lượng 1 trong giỏ, **When** xem nút giảm của dòng đó, **Then** nút giảm ở trạng thái vô hiệu. *(FR-008)*
5. **Given** "Bàn phím cơ" có số lượng 5 trong giỏ, **When** xem nút tăng của dòng đó, **Then** nút tăng ở trạng thái vô hiệu. *(FR-008)*
6. **Given** giỏ có 2 mặt hàng khác nhau, **When** bấm "Xóa" trên một mặt hàng, **Then** dòng đó biến mất, tổng giỏ và bộ đếm header cập nhật ngay. *(FR-007, FR-008)*
7. **Given** giỏ hàng đang trống, **When** mở trang giỏ hàng, **Then** thấy thông báo giỏ trống và nút "Thanh toán" ở trạng thái vô hiệu (disabled, vẫn hiển thị). *(FR-010)*

---

### User Story 5 - Kiểm chứng checkout và xác nhận đặt hàng (Priority: P5)

Người học viết test kiểm tra luồng checkout đầu-cuối: happy path điền đủ thông
tin → trang xác nhận hiển thị tổng tiền khớp → giỏ trống sau đặt hàng; và
các error path: form trống, chỉ khoảng trắng, checkout khi giỏ trống.

**Ứng với app FR**: FR-010, FR-011, FR-012, FR-013

**Why this priority**: Khép kín hành trình mua hàng và bao phủ form validation
— hai chủ đề automation nâng cao quan trọng cho người học.

**Independent Test**: Đăng nhập, thêm ít nhất 1 sản phẩm vào giỏ (setup), vào
trang checkout và thực hiện kịch bản.

**Acceptance Scenarios**:

**Happy path**:

1. **Given** giỏ có mặt hàng với tổng tiền X, **When** bấm "Thanh toán" ở trang giỏ, **Then** được chuyển đến trang nhập thông tin (họ tên + mã bưu chính). *(FR-010)*
2. **Given** đang ở trang nhập thông tin với tổng tiền X, **When** điền đủ họ tên và mã bưu chính rồi bấm xác nhận, **Then** được chuyển đến trang xác nhận thành công hiển thị thông điệp thành công và tổng tiền đúng bằng X. *(FR-012, FR-013)*
3. **Given** vừa đặt hàng thành công, **When** quay về trang sản phẩm, **Then** bộ đếm giỏ hàng về 0. *(FR-012)*

**Error paths**:

4. **Given** đang ở trang checkout với 2 trường để trống, **When** bấm xác nhận, **Then** thấy thông báo lỗi rõ ràng cho cả trường họ tên lẫn mã bưu chính, và vẫn ở trang checkout. *(FR-011)*
5. **Given** đang ở trang checkout với họ tên đã điền nhưng mã bưu chính để trống, **When** bấm xác nhận, **Then** chỉ thấy lỗi cho trường mã bưu chính. *(FR-011)*
6. **Given** đang ở trang checkout với cả 2 trường chỉ chứa khoảng trắng, **When** bấm xác nhận, **Then** cả 2 trường đều bị coi là trống và hiển thị lỗi. *(FR-011)*
7. **Given** giỏ hàng đang trống, **When** truy cập thẳng đường dẫn trang checkout, **Then** bị chuyển hướng về trang giỏ hàng (không thể đặt đơn rỗng). *(FR-010)*

---

### Edge Cases

- Bộ đếm giỏ hàng khi giỏ trống phải hiển thị rõ ràng (0 hoặc ẩn), không hiển thị giá trị không xác định.
- Mỗi test case tự dọn dẹp trạng thái sau khi chạy xong để không ảnh hưởng test tiếp theo.
- Tải lại trang ở giữa luồng checkout (khi form chưa submit) không gây mất dữ liệu giỏ hàng.
- Tổng tiền trên trang xác nhận phải khớp chính xác với tổng đã hiển thị ở bước giỏ hàng ngay trước đó.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Bộ test PHẢI bao phủ toàn bộ kịch bản chấp nhận (Acceptance Scenarios) của 4 User Story trong spec ứng dụng (specs/001-simpleshop-demo/spec.md) — đăng nhập, sản phẩm, giỏ hàng, checkout — với ít nhất một test case tự động cho mỗi kịch bản.
- **FR-002**: Bộ test PHẢI bao gồm test lỗi (error path) cho: (a) truy cập trang bảo vệ khi chưa đăng nhập, (b) checkout khi giỏ trống, (c) submit form checkout với trường bắt buộc để trống hoặc chỉ khoảng trắng, (d) thao tác tăng/thêm giỏ khi đã đạt số lượng tối đa 5.
- **FR-003**: Mỗi test case PHẢI ghi rõ ít nhất một mã FR từ spec ứng dụng (ví dụ `FR-005`) trong nhãn hoặc mô tả của test, để người đọc biết test này xác minh yêu cầu nào.
- **FR-004**: Mỗi test case PHẢI chạy được độc lập mà không phụ thuộc vào kết quả hay trạng thái để lại bởi test khác; toàn bộ bộ test PHẢI có thể chạy theo bất kỳ thứ tự nào và cho kết quả không đổi. Mọi tiền điều kiện (đăng nhập, giỏ có hàng...) PHẢI được thiết lập bằng thao tác UI trong bước setup của chính test đó.
- **FR-005**: Bộ test PHẢI tổ chức theo mô hình Page Object: mỗi trang ứng dụng có một Page Object riêng chứa toàn bộ locator và thao tác cấp trang; file test chỉ chứa logic kịch bản.
- **FR-006**: Locator trong Page Object PHẢI ưu tiên định danh ổn định từ hợp đồng giao diện (contracts/ui-contract.md); không được dùng class CSS, id sinh tự động hay đường dẫn DOM cấu trúc.
- **FR-007**: Bộ test PHẢI kiểm tra tính chính xác của định dạng giá VND ("X.XXX.XXX ₫") tại ít nhất: trang danh sách sản phẩm, trang giỏ hàng (đơn giá + thành tiền + tổng), trang xác nhận (tổng đơn hàng). *(app FR-013)*
- **FR-008**: Bộ test PHẢI xác nhận tổng tiền hiển thị trên trang xác nhận đặt hàng bằng đúng tổng đã hiển thị trên trang giỏ hàng trước khi bấm Checkout. *(app FR-012, SC-004)*
- **FR-009**: Bộ test PHẢI xác nhận giỏ hàng được giữ nguyên sau khi tải lại trang (trên cùng trình duyệt), và bị làm trống sau khi đặt hàng thành công. *(app FR-009, FR-012)*

### Key Entities

- **TestCase**: Một kịch bản kiểm thử độc lập; có tiêu đề mô tả kịch bản, danh sách mã FR được xác minh, bước Given/When/Then, và kết quả mong đợi.
- **PageObject**: Module tập trung locator và thao tác cho một trang cụ thể của app (Login, Products, Cart, Checkout, Confirmation); được tái sử dụng qua nhiều test case.
- **TestFixture**: Dữ liệu hoặc trạng thái đầu vào được thiết lập trước mỗi test (ví dụ: user đã đăng nhập, giỏ có sẵn mặt hàng); phải độc lập và tái tạo được.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% Acceptance Scenarios của 4 User Story trong specs/001-simpleshop-demo/spec.md được phủ bởi ít nhất 1 test case tự động trong bộ test này.
- **SC-002**: Mỗi trong 5 luồng nghiệp vụ chính (đăng nhập, xem sản phẩm, thêm giỏ, quản lý giỏ, checkout) có ít nhất 1 happy path test và 1 error path test.
- **SC-003**: Toàn bộ bộ test chạy xong trong dưới 3 phút trên máy phát triển thông thường.
- **SC-004**: Bộ test cho kết quả nhất quán khi chạy lại nhiều lần liên tiếp (không có test flaky do phụ thuộc thứ tự hay trạng thái chia sẻ).
- **SC-005**: 100% locator trong Page Object dùng định danh ổn định theo hợp đồng giao diện; 0 selector theo class CSS hay XPath cấu trúc DOM.

## Manual Test Coverage

Các hạng mục dưới đây được xác định qua audit (2026-06-13) là **không nằm trong
bộ test tự động**. Người kiểm thử cần xác minh thủ công trước khi release.

| Hạng mục | App FR | Lý do không tự động hoá |
|----------|--------|------------------------|
| Văn bản giao diện là tiếng Việt (nhãn nút, thông báo lỗi, thông điệp thành công) | FR-014 | Kiểm tra toàn diện đòi hỏi snapshot toàn UI; spot-check thủ công đủ cho phiên bản học tập này |
| Trạng thái đăng nhập giữ nguyên sau khi tải lại trang (session reload) | FR-009 | Giỏ hàng sau reload đã có test tự động; phần login-session không được phủ trong phiên bản này — kiểm tra thủ công |
| Định dạng VND trên trường `checkout-total` của trang checkout | FR-013 | Trang sản phẩm, giỏ hàng, xác nhận đều có test format; trang checkout bị bỏ sót trong phiên bản này — xác minh thủ công |

## Assumptions

- App SimpleShop (specs/001-simpleshop-demo) đã được cài đặt và đang chạy trên môi trường local trước khi chạy bộ test.
- Bộ test chạy trên Chrome/Chromium (không phải môi trường giả lập) để xác nhận hành vi localStorage và điều hướng thực tế. Hỗ trợ đa trình duyệt nằm ngoài phạm vi phiên bản này.
- Mỗi test case bắt đầu từ trạng thái trình duyệt sạch (session và giỏ hàng trống); toàn bộ thiết lập tiền điều kiện (đăng nhập, thêm mặt hàng vào giỏ...) thực hiện hoàn toàn qua thao tác UI — không can thiệp trực tiếp localStorage hay bất kỳ storage nào. Cách này giúp setup đồng thời xác minh thêm các FR liên quan (FR-001, FR-005) mà không cần test riêng.
- Dữ liệu sản phẩm cố định (6 sản phẩm) không thay đổi trong quá trình test; tên và giá sản phẩm như trong data-model.md.
- Bộ test không tạo hay dọn dẹp dữ liệu phía server vì app không có backend.
- Công cụ và ngôn ngữ viết test cụ thể do kế hoạch kỹ thuật (plan) quyết định; spec này trung lập về công nghệ.
