# Feature Specification: Login Form với Username & Password

**Feature Branch**: `005-login-form`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "Thay đổi màn hình đăng nhập SimpleShop từ dạng chọn user thành form nhập username và password. Danh sách user hợp lệ vẫn giữ nguyên (Minh Nguyễn, Lan Trần, Hùng Phạm), password là 123 thay vì click chọn. Hiển thị thông báo lỗi rõ ràng khi nhập sai. Giữ nguyên style và màu sắc hiện tại của app."

## Clarifications

### Session 2026-06-14

- Q: Khi đăng nhập thất bại, hiển thị một thông báo chung hay thông báo riêng cho từng trường hợp (username không tồn tại vs. sai password)? → A: Một thông báo chung duy nhất "Tên đăng nhập hoặc mật khẩu không đúng" — không phân biệt để tránh tiết lộ thông tin.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đăng nhập thành công bằng form (Priority: P1)

Người dùng truy cập trang đăng nhập, thấy hai trường nhập liệu (username và password)
thay vì danh sách chọn user. Người dùng nhập đúng username và password, nhấn nút đăng
nhập, và được chuyển thẳng vào trang sản phẩm.

**Why this priority**: Đây là luồng chính của toàn bộ ứng dụng — không đăng nhập được
thì không truy cập được bất kỳ tính năng nào khác.

**Independent Test**: Mở trang đăng nhập, nhập `minh` / `123`, nhấn nút đăng nhập.
Kết quả: ứng dụng chuyển sang trang sản phẩm và hiển thị tên "Minh Nguyễn" ở header.
Độc lập hoàn toàn — không cần US2 để verify.

**Acceptance Scenarios**:

1. **Given** người dùng ở trang đăng nhập, **When** nhập username `minh` và password `123` rồi nhấn nút đăng nhập, **Then** được chuyển tới trang sản phẩm và header hiển thị "Minh Nguyễn"
2. **Given** người dùng ở trang đăng nhập, **When** nhập username `lan` và password `123` rồi nhấn nút đăng nhập, **Then** được chuyển tới trang sản phẩm và header hiển thị "Lan Trần"
3. **Given** người dùng ở trang đăng nhập, **When** nhập username `hung` và password `123` rồi nhấn nút đăng nhập, **Then** được chuyển tới trang sản phẩm và header hiển thị "Hùng Phạm"

---

### User Story 2 - Thông báo lỗi khi đăng nhập sai (Priority: P2)

Khi người dùng nhập sai username hoặc password, ứng dụng hiển thị thông báo lỗi rõ
ràng ngay trên form (không chuyển trang), giúp người dùng biết cần thử lại. Người dùng
ở lại trang đăng nhập và có thể sửa thông tin rồi thử lại.

**Why this priority**: Phản hồi lỗi rõ ràng là yêu cầu UX cơ bản — người dùng phải
biết tại sao đăng nhập thất bại để sửa đúng chỗ.

**Independent Test**: Nhập `minh` / `sai-mat-khau`, nhấn đăng nhập. Kết quả: thông báo
lỗi xuất hiện ngay trên form, ứng dụng ở lại trang đăng nhập.

**Acceptance Scenarios**:

1. **Given** người dùng ở trang đăng nhập, **When** nhập đúng username nhưng sai password (`minh` / `sai`) rồi nhấn đăng nhập, **Then** thông báo "Tên đăng nhập hoặc mật khẩu không đúng" hiển thị trên form, ứng dụng ở lại trang đăng nhập
2. **Given** người dùng ở trang đăng nhập, **When** nhập username không tồn tại (`admin` / `123`) rồi nhấn đăng nhập, **Then** thông báo "Tên đăng nhập hoặc mật khẩu không đúng" hiển thị trên form, ứng dụng ở lại trang đăng nhập
3. **Given** người dùng ở trang đăng nhập, **When** để trống một hoặc cả hai trường rồi nhấn đăng nhập, **Then** thông báo lỗi validation hiển thị, ứng dụng ở lại trang đăng nhập
4. **Given** thông báo lỗi đang hiển thị, **When** người dùng nhập đúng thông tin và đăng nhập lại, **Then** thông báo lỗi biến mất và người dùng được chuyển tới trang sản phẩm

---

### Edge Cases

- Người dùng nhập username đúng nhưng thừa/thiếu khoảng trắng (ví dụ ` minh `) → được coi là sai username (không tự trim)
- Người dùng nhập đúng username nhưng password có chữ hoa (`123` ≠ `123` viết sai) → không áp dụng ở đây vì password là số; tuy nhiên nếu nhập `  123  ` thì coi là sai
- Form có thể submit bằng phím Enter (không chỉ click nút)
- Trường password PHẢI ẩn ký tự (hiện dấu chấm/sao), không hiển thị plain text

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Trang đăng nhập PHẢI hiển thị form với hai trường nhập liệu: username và password
- **FR-002**: Trường password PHẢI ẩn ký tự khi người dùng gõ (kiểu nhập mật khẩu)
- **FR-003**: Hệ thống PHẢI chấp nhận đăng nhập thành công khi username và password khớp với một trong ba tài khoản hợp lệ: `minh`/`123`, `lan`/`123`, `hung`/`123`
- **FR-004**: Sau khi đăng nhập thành công, hệ thống PHẢI chuyển người dùng tới trang sản phẩm và hiển thị tên đầy đủ của người dùng ở header (`Minh Nguyễn`, `Lan Trần`, hoặc `Hùng Phạm`)
- **FR-005**: Khi người dùng nhập sai username hoặc password, hệ thống PHẢI hiển thị một thông báo lỗi chung duy nhất "Tên đăng nhập hoặc mật khẩu không đúng" trực tiếp trên trang đăng nhập và KHÔNG chuyển trang (không phân biệt lỗi username hay password để tránh tiết lộ thông tin)
- **FR-006**: Khi một hoặc cả hai trường để trống, hệ thống PHẢI hiển thị thông báo lỗi và ngăn việc gửi form
- **FR-007**: Form PHẢI có thể submit bằng phím Enter (không chỉ click nút)
- **FR-008**: Giao diện trang đăng nhập PHẢI dùng cùng màu sắc, font chữ, và phong cách (style) với phần còn lại của ứng dụng
- **FR-009**: Nút "Chọn user" và danh sách user click-to-select cũ PHẢI bị xóa hoàn toàn khỏi giao diện

### Key Entities

- **Tài khoản người dùng**: Bộ thông tin gồm username (định danh đăng nhập), tên hiển thị đầy đủ, và password. Dữ liệu giả lập, cố định.

| Username | Tên hiển thị | Password |
|----------|-------------|----------|
| minh     | Minh Nguyễn | 123      |
| lan      | Lan Trần    | 123      |
| hung     | Hùng Phạm   | 123      |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể hoàn thành đăng nhập thành công trong vòng 30 giây kể từ khi trang tải xong
- **SC-002**: 100% tài khoản hợp lệ (3/3) đăng nhập được qua form username/password
- **SC-003**: Mọi trường hợp nhập sai (username không tồn tại, password sai, để trống) đều hiển thị thông báo lỗi — không có trường hợp nào thất bại âm thầm
- **SC-004**: Giao diện trang đăng nhập mới không có sự khác biệt về màu sắc hay phong cách so với phần còn lại của ứng dụng (header, trang sản phẩm, trang giỏ hàng)

## Assumptions

- Username để đăng nhập là tên viết thường, không dấu: `minh`, `lan`, `hung` (lấy từ phần tử định danh hiện tại của ứng dụng)
- Password của cả ba tài khoản đều là `123` (giống nhau)
- Không có yêu cầu "ghi nhớ đăng nhập" (remember me) — phiên đăng nhập tồn tại trong bộ nhớ trình duyệt như hiện tại
- Không có yêu cầu quên mật khẩu hay đăng ký tài khoản mới
- Không có giới hạn số lần nhập sai (không có lockout)
- Dữ liệu tài khoản tiếp tục là dữ liệu giả lập trong code, không kết nối backend
- Toàn bộ phần còn lại của ứng dụng (giỏ hàng, checkout, trang sản phẩm) không thay đổi
