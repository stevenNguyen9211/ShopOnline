# Feature Specification: Xác Thực Người Dùng Thật

**Feature Branch**: `006-real-auth`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "Thêm chức năng xác thực người dùng thật cho trang
đăng nhập. Hiện tại app có form login với trường username và password. Yêu cầu:
khi người dùng submit form, hệ thống kiểm tra username và password với dữ liệu
trong database. Nếu đúng thì cho vào trang chính, nếu sai thì hiển thị thông
báo lỗi rõ ràng. Không cho vào trang chính nếu chưa đăng nhập."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đăng Nhập Thành Công (Priority: P1)

Người dùng nhập đúng tên đăng nhập và mật khẩu, hệ thống xác minh thông tin
với cơ sở dữ liệu và cho phép vào trang sản phẩm.

**Why this priority**: Đây là luồng cốt lõi của toàn bộ tính năng — không có
đăng nhập thành công thì mọi tính năng khác của app không thể sử dụng được.

**Independent Test**: Có thể test độc lập bằng cách nhập đúng username/password
của một tài khoản có trong database và xác nhận được chuyển đến trang sản phẩm.

**Acceptance Scenarios**:

1. **Given** người dùng đang ở trang đăng nhập và chưa có phiên làm việc,
   **When** nhập đúng username và password rồi nhấn "Đăng nhập",
   **Then** hệ thống chuyển trang đến danh sách sản phẩm và hiển thị thông tin
   người dùng đã đăng nhập.

2. **Given** người dùng đã đăng nhập thành công,
   **When** tải lại trang (F5 hoặc đóng-mở tab),
   **Then** người dùng vẫn ở trạng thái đăng nhập, không bị đưa về trang login.

3. **Given** người dùng đã đăng nhập,
   **When** truy cập trực tiếp vào URL `/login`,
   **Then** hệ thống tự động chuyển hướng về trang sản phẩm.

---

### User Story 2 - Đăng Nhập Thất Bại với Thông Tin Sai (Priority: P1)

Người dùng nhập sai tên đăng nhập hoặc mật khẩu, hệ thống báo lỗi rõ ràng
và giữ nguyên trang đăng nhập để thử lại.

**Why this priority**: Cùng mức ưu tiên với US1 — phải xác định rõ phân biệt
thành công/thất bại để đảm bảo hệ thống xác thực hoạt động đúng.

**Independent Test**: Có thể test độc lập bằng cách nhập sai thông tin và xác
nhận thông báo lỗi xuất hiện, form vẫn còn trên màn hình.

**Acceptance Scenarios**:

1. **Given** người dùng đang ở trang đăng nhập,
   **When** nhập username đúng nhưng password sai rồi submit,
   **Then** hệ thống hiển thị thông báo lỗi "Tên đăng nhập hoặc mật khẩu không
   đúng" và người dùng ở lại trang đăng nhập.

2. **Given** người dùng đang ở trang đăng nhập,
   **When** nhập username không tồn tại trong database rồi submit,
   **Then** hệ thống hiển thị thông báo lỗi tương tự (không tiết lộ tài khoản
   có tồn tại hay không) và người dùng ở lại trang đăng nhập.

3. **Given** người dùng đang ở trang đăng nhập,
   **When** để trống một hoặc cả hai trường rồi submit,
   **Then** hệ thống hiển thị thông báo yêu cầu điền đầy đủ thông tin, không
   thực hiện truy vấn database.

---

### User Story 3 - Bảo Vệ Trang Khi Chưa Đăng Nhập (Priority: P2)

Người dùng chưa đăng nhập cố truy cập các trang yêu cầu xác thực (sản phẩm,
giỏ hàng, thanh toán, xác nhận), hệ thống chặn và chuyển về trang đăng nhập.

**Why this priority**: Bảo vệ trang là hệ quả bắt buộc từ US1 — nhưng tách
riêng vì có thể test và validate độc lập mà không cần đăng nhập.

**Independent Test**: Có thể test độc lập bằng cách không đăng nhập rồi truy
cập trực tiếp URL `/products`, `/cart`, `/checkout`, `/confirmation`.

**Acceptance Scenarios**:

1. **Given** người dùng chưa đăng nhập,
   **When** truy cập trực tiếp URL `/products`,
   **Then** hệ thống chuyển hướng về `/login` ngay lập tức.

2. **Given** người dùng chưa đăng nhập,
   **When** truy cập trực tiếp URL `/cart`, `/checkout`, hoặc `/confirmation`,
   **Then** hệ thống chuyển hướng về `/login` ngay lập tức với mỗi trang.

3. **Given** người dùng đang ở trang login chưa đăng nhập,
   **When** đăng nhập thành công,
   **Then** người dùng được chuyển đến trang sản phẩm.

---

### User Story 4 - Xử Lý Lỗi Kết Nối Database (Priority: P3)

Khi hệ thống không thể kết nối đến cơ sở dữ liệu để xác minh thông tin,
người dùng nhận được thông báo lỗi rõ ràng thay vì màn hình trắng hoặc lỗi
kỹ thuật khó hiểu.

**Why this priority**: P3 vì lỗi mạng ít xảy ra trong môi trường học tập, nhưng
cần xử lý để đảm bảo trải nghiệm người dùng không bị vỡ.

**Independent Test**: Có thể test bằng cách tắt mạng hoặc cấu hình sai địa chỉ
database rồi thử đăng nhập.

**Acceptance Scenarios**:

1. **Given** hệ thống không thể kết nối đến cơ sở dữ liệu,
   **When** người dùng submit form đăng nhập,
   **Then** hệ thống hiển thị thông báo lỗi chung "Không thể kết nối hệ thống,
   vui lòng thử lại" và người dùng ở lại trang đăng nhập.

---

### Edge Cases

- Người dùng nhập khoảng trắng thừa ở đầu/cuối username: hệ thống trim trước
  khi so sánh.
- Người dùng nhấn submit nhiều lần liên tiếp trong khi đang chờ kết quả: hệ
  thống chỉ xử lý một lần (nút submit bị vô hiệu hóa trong thời gian chờ).
- Người dùng nhập mật khẩu rỗng (chỉ khoảng trắng): coi là trường trống, hiển
  thị thông báo yêu cầu điền đầy đủ.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI xác minh giá trị người dùng nhập vào trường "Tên
  đăng nhập" với cột `username` và giá trị trường "Mật khẩu" với cột `password`
  trong bảng `public.users`, bằng cách so sánh trực tiếp plain text (theo Nguyên
  tắc VIII), KHÔNG dùng cơ chế mã hóa hay xác thực bên thứ ba.
- **FR-002**: Hệ thống PHẢI chỉ đọc dữ liệu từ cơ sở dữ liệu (SELECT) — KHÔNG
  ghi, sửa, hay xóa bất kỳ dữ liệu nào (theo Nguyên tắc IX).
- **FR-003**: Hệ thống PHẢI chuyển hướng người dùng đến trang sản phẩm ngay
  sau khi xác thực thành công.
- **FR-004**: Hệ thống PHẢI hiển thị thông báo lỗi rõ ràng khi thông tin đăng
  nhập không khớp với dữ liệu trong database.
- **FR-005**: Hệ thống PHẢI hiển thị thông báo lỗi khi cả hai trường bị để
  trống hoặc chỉ chứa khoảng trắng, và KHÔNG được thực hiện truy vấn database.
- **FR-006**: Hệ thống PHẢI duy trì phiên đăng nhập khi người dùng tải lại
  trang bằng cách lưu `userId` và `username` vào localStorage khi đăng nhập
  thành công; khi tải lại trang, đọc trực tiếp từ localStorage mà KHÔNG gọi lại
  cơ sở dữ liệu.
- **FR-007**: Hệ thống PHẢI chặn quyền truy cập vào các trang sản phẩm, giỏ
  hàng, thanh toán, và xác nhận nếu người dùng chưa đăng nhập.
- **FR-008**: Hệ thống PHẢI chuyển hướng người dùng chưa đăng nhập về trang
  đăng nhập khi cố truy cập trang được bảo vệ.
- **FR-009**: Hệ thống PHẢI vô hiệu hóa nút submit và đổi text nút thành "Đang
  xác thực..." trong khi đang chờ kết quả từ cơ sở dữ liệu; khi có kết quả
  (thành công hoặc thất bại), nút trở lại text "Đăng nhập" và được kích hoạt.
- **FR-010**: Hệ thống PHẢI hiển thị thông báo lỗi khi không thể kết nối đến
  cơ sở dữ liệu, KHÔNG hiển thị lỗi kỹ thuật hay màn hình trắng.

### Key Entities

- **User**: tài khoản người dùng được đọc từ cơ sở dữ liệu; các cột trong bảng
  `public.users`: `id` (integer PK, không dùng làm login), `username` (varchar
  unique, giá trị người dùng gõ vào trường "Tên đăng nhập" và hiển thị trên
  giao diện), `password` (mật khẩu plain text).
- **Session**: trạng thái đăng nhập lưu trong localStorage; chứa `userId` và
  `username` từ kết quả truy vấn DB; được đọc trực tiếp khi tải lại trang
  mà không cần gọi lại cơ sở dữ liệu.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể đăng nhập thành công và vào trang sản phẩm
  trong vòng 3 giây kể từ khi nhấn submit (điều kiện mạng bình thường).
- **SC-002**: 100% các trang được bảo vệ (/products, /cart, /checkout,
  /confirmation) đều chuyển hướng về trang đăng nhập khi người dùng chưa xác
  thực.
- **SC-003**: Thông báo lỗi xuất hiện trong vòng 3 giây khi thông tin đăng
  nhập không chính xác.
- **SC-004**: Phiên đăng nhập được duy trì sau khi tải lại trang — người dùng
  không bị đưa về trang đăng nhập một cách bất ngờ.
- **SC-005**: Nút submit bị vô hiệu hóa và hiển thị "Đang xác thực..." ngay
  khi người dùng nhấn; trở lại text "Đăng nhập" và được kích hoạt sau khi có
  kết quả (thành công hoặc thất bại).

## Assumptions

- Cơ sở dữ liệu là Supabase với bảng `public.users` đã tồn tại và có dữ liệu
  sẵn — schema cố định, không cần migration (theo Nguyên tắc IX).
- Mật khẩu được lưu dạng plain text trong database và so sánh trực tiếp — đây
  là quyết định có chủ đích cho mục đích học tập (theo Nguyên tắc VIII).
- UI form đăng nhập (username input, password input, submit button, error
  message) đã có sẵn từ feature 005-login-form với đầy đủ `data-testid`;
  feature này chỉ thay đổi lớp xác thực phía sau form, KHÔNG thay đổi UI.
- Route protection (RequireAuth) đã được triển khai trong App.tsx cho tất cả
  các trang cần bảo vệ; feature này cần đảm bảo cơ chế này hoạt động đúng với
  nguồn dữ liệu thật.
- Phiên đăng nhập lưu trong localStorage với `userId` (integer) và `username`;
  khi tải lại trang, dữ liệu được khôi phục từ localStorage mà không gọi lại DB.
- Cột `username` trong `public.users` được dùng làm cả login credential lẫn
  tên hiển thị trên giao diện (header); cột `id` là integer PK không liên quan
  đến luồng đăng nhập.
- Khi xảy ra lỗi kết nối, thông báo lỗi dùng ngôn ngữ tiếng Việt thân thiện,
  không hiển thị stack trace hay thông tin kỹ thuật.

## Clarifications

### Session 2026-06-14

- Q: Các column trong `public.users` là gì? → A: `id` (integer PK), `username` (login credential + display name), `password` — không có display_name (đã xác minh qua Supabase MCP trong planning phase)
- Q: Khi refresh, khôi phục session bằng re-query DB hay localStorage cache? → A: Đọc từ localStorage (lưu `userId` + `display_name` khi login), không re-query DB
- Q: Feedback thị giác khi đang chờ DB ngoài disable button? → A: Đổi text nút thành "Đang xác thực...", phục hồi "Đăng nhập" khi có kết quả
