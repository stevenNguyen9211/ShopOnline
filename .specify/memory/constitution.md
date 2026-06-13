<!--
Sync Impact Report
==================
- Version change: 1.0.0 → 1.1.0
- Modified principles: n/a
- Added sections:
  - VI. Kiểm Thử Tự Động Có Kỷ Luật (Page Object Model, test độc lập,
    locator ưu tiên data-testid, map FR, happy+error path)
- Removed sections: n/a
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — "Constitution Check" không cần
    cập nhật; principle VI là hướng dẫn cho người học viết test, không thay
    đổi cấu trúc plan
  - ✅ .specify/templates/spec-template.md — Acceptance Scenarios đã yêu cầu
    mapping sang user story; FR mapping trong test là mở rộng tự nhiên
  - ✅ .specify/templates/tasks-template.md — test tasks đã optional và có
    cấu trúc phù hợp; không cần thay đổi template
- Follow-up TODOs: không có
-->

# Shop SDD Constitution

Hiến chương cho dự án web bán hàng demo phục vụ mục đích học tập (Spec-Driven
Development). Mọi quyết định kỹ thuật trong dự án phải tuân thủ các nguyên tắc
dưới đây.

## Core Principles

### I. Code Sạch & Dễ Đọc

Code được viết để người học đọc hiểu, không phải để phô diễn kỹ thuật.

- Tên biến, hàm, component PHẢI mô tả đúng vai trò; KHÔNG dùng viết tắt khó hiểu.
- Mỗi hàm/component PHẢI làm một việc; nếu cần giải thích bằng comment dài thì
  PHẢI tách nhỏ thay vì comment.
- Comment chỉ dùng để giải thích "tại sao", KHÔNG giải thích "code làm gì".
- Toàn bộ code PHẢI qua linter và formatter thống nhất của dự án trước khi merge.

**Lý do**: Đây là dự án học tập — giá trị lớn nhất của codebase là khả năng đọc
hiểu được của nó. Code khó đọc làm mất mục đích tồn tại của dự án.

### II. Đơn Giản Hơn Đầy Đủ (YAGNI)

Khi phải lựa chọn giữa giải pháp đơn giản và giải pháp đầy đủ tính năng, PHẢI
chọn giải pháp đơn giản.

- KHÔNG thêm tính năng, abstraction, hay cấu hình "để dành cho tương lai".
- KHÔNG thêm thư viện mới nếu nhu cầu có thể giải quyết bằng công cụ sẵn có;
  mỗi dependency mới PHẢI được ghi lý do trong plan.
- Một luồng nghiệp vụ chỉ cần đủ để minh hoạ khái niệm (ví dụ: giỏ hàng, thanh
  toán giả lập) — KHÔNG cần xử lý mọi trường hợp biên của thương mại điện tử thật.
- Vi phạm độ phức tạp PHẢI được ghi và biện minh trong mục Complexity Tracking
  của plan.md.

**Lý do**: Phạm vi demo có giới hạn; sự đơn giản giúp người học nắm trọn bức
tranh và giảm chi phí bảo trì.

### III. UI Phải Test Tự Động Được (BẮT BUỘC)

Mọi thành phần UI mà người dùng tương tác được PHẢI có định danh ổn định phục
vụ test tự động.

- Mọi phần tử tương tác (nút, input, link, item danh sách...) và vùng hiển thị
  dữ liệu quan trọng PHẢI có thuộc tính `data-testid` ổn định.
- Giá trị `data-testid` PHẢI theo quy ước kebab-case có ngữ cảnh, ví dụ:
  `product-card-add-to-cart`, `cart-item-quantity`, `checkout-submit`.
- `data-testid` là hợp đồng công khai: đổi tên hoặc xoá nó là breaking change,
  PHẢI cập nhật test tương ứng trong cùng một thay đổi.
- Test KHÔNG được selector theo class CSS hay cấu trúc DOM; chỉ dùng
  `data-testid` hoặc accessible role/label.
- Tiêu chí chấp nhận (acceptance scenarios) trong spec PHẢI kiểm chứng được
  bằng test tự động dựa trên các định danh này.

**Lý do**: Mục tiêu học tập bao gồm thực hành test tự động; selector ổn định
giúp test không vỡ khi refactor giao diện.

### IV. Không Backend & Database Thật

Dự án PHẢI chạy hoàn toàn phía client, không phụ thuộc hạ tầng bên ngoài.

- KHÔNG có server backend, API thật, hay database thật ở mọi giai đoạn.
- Dữ liệu (sản phẩm, giỏ hàng, đơn hàng...) PHẢI đến từ dữ liệu giả lập: file
  JSON/fixture tĩnh, mock service trong code, hoặc localStorage/sessionStorage.
- Lớp truy cập dữ liệu PHẢI được tách thành module riêng (service/repository
  giả lập) để minh hoạ kiến trúc, nhưng phía sau chỉ là dữ liệu trong bộ nhớ
  hoặc trình duyệt.
- Ứng dụng PHẢI khởi chạy được bằng một lệnh duy nhất, không cần biến môi
  trường bí mật hay đăng ký dịch vụ ngoài.

**Lý do**: Loại bỏ chi phí vận hành và rào cản cài đặt, để người học tập trung
vào frontend và quy trình spec-driven.

### V. Trải Nghiệm Người Dùng Nhất Quán

Giao diện PHẢI nhất quán trên toàn bộ ứng dụng.

- Các giá trị thiết kế (màu, khoảng cách, cỡ chữ) PHẢI lấy từ một nguồn chung
  (design tokens / theme / biến CSS), KHÔNG hard-code rải rác.
- Cùng một hành vi PHẢI có cùng một biểu hiện: trạng thái loading, thông báo
  lỗi, trạng thái rỗng, định dạng giá tiền... dùng chung component/format.
- Văn bản giao diện PHẢI thống nhất một ngôn ngữ và một giọng văn.
- Mọi luồng chính PHẢI dùng được bằng bàn phím và có nhãn truy cập
  (accessible label) cơ bản.

**Lý do**: Sự nhất quán dạy thói quen làm UI tốt và đồng thời làm test tự động
ổn định, dễ đoán hơn.

### VI. Kiểm Thử Tự Động Có Kỷ Luật

Bộ test tự động PHẢI được cấu trúc để học được, duy trì được, và chạy được độc
lập — không phải chỉ để "có test".

- **Page Object Model**: Mỗi trang/khu vực UI PHẢI có Page Object riêng chứa
  toàn bộ locator và thao tác cấp thấp; file test chỉ chứa logic kịch bản —
  KHÔNG được viết locator inline trong test.
- **Độc lập & song song**: Mỗi test case PHẢI tự thiết lập trạng thái đầu vào
  và tự dọn dẹp; KHÔNG được giả định thứ tự chạy hay kế thừa trạng thái từ
  test trước — toàn bộ suite PHẢI có thể chạy song song hoặc theo bất kỳ thứ
  tự nào mà kết quả không thay đổi.
- **Locator ưu tiên `data-testid`**: Theo Nguyên tắc III, locator trong Page
  Object PHẢI dùng `data-testid` hoặc accessible role/label; KHÔNG dùng class
  CSS, id sinh tự động, hay XPath theo cấu trúc DOM.
- **Truy xuất Functional Requirement**: Mỗi test case PHẢI ghi rõ ít nhất một
  mã FR (ví dụ `# FR-005`) trong comment hoặc tên test để người đọc biết test
  này xác minh yêu cầu nào trong spec.
- **Happy path & error path**: Mỗi luồng nghiệp vụ chính PHẢI có ít nhất một
  test happy path (đầu vào hợp lệ, kết quả mong đợi) và ít nhất một test error
  path (đầu vào lỗi hoặc trạng thái biên, thông báo lỗi đúng).

**Lý do**: Test viết sai cấu trúc sẽ vỡ khi refactor và không dạy được thói
quen tốt. Kỷ luật POM + độc lập + truy xuất FR biến bộ test thành tài liệu
sống của spec — đây chính là mục tiêu học tập của dự án.

## Ràng Buộc Kỹ Thuật

- Stack PHẢI là web frontend thuần (SPA hoặc static site); lựa chọn framework
  cụ thể do plan quyết định nhưng không được vi phạm Nguyên tắc IV.
- Trạng thái cần lưu giữa các phiên (ví dụ giỏ hàng) chỉ được dùng
  localStorage/sessionStorage của trình duyệt.
- Thanh toán, đăng nhập, gửi email... nếu có chỉ được giả lập (mock) và PHẢI
  ghi rõ là giả lập trong UI hoặc tài liệu.
- Bộ test PHẢI chạy được offline bằng một lệnh duy nhất.

## Quy Trình Phát Triển & Cổng Chất Lượng

- Mọi feature PHẢI đi theo trình tự Spec Kit: spec → plan → tasks → implement.
- Mục "Constitution Check" trong plan.md là cổng bắt buộc: plan vi phạm nguyên
  tắc mà không có biện minh trong Complexity Tracking thì KHÔNG được triển khai.
- Mỗi user story PHẢI test được độc lập; khi hoàn thành story, các acceptance
  scenario tương ứng PHẢI có test tự động đi kèm (theo Nguyên tắc III & VI).
- Review (tự review hoặc review chéo) PHẢI đối chiếu thay đổi với 6 nguyên tắc
  trước khi đánh dấu task hoàn thành.

## Governance

Constitution này chi phối các quyết định kỹ thuật như sau:

- **Thứ tự ưu tiên khi xung đột**: Constitution > plan.md > sở thích cá nhân.
  Khi hai giải pháp đều hợp lệ, chọn giải pháp đơn giản hơn (Nguyên tắc II);
  khi giải pháp đơn giản làm UI không test được, Nguyên tắc III thắng.
- **Tại thời điểm planning**: mọi plan.md PHẢI vượt qua Constitution Check;
  mỗi vi phạm PHẢI có dòng tương ứng trong Complexity Tracking, nêu lý do và
  vì sao phương án đơn giản hơn bị loại.
- **Tại thời điểm review**: PR/thay đổi vi phạm nguyên tắc mà không có biện
  minh đã được duyệt trong plan PHẢI bị từ chối hoặc sửa lại.
- **Sửa đổi (amendment)**: thay đổi constitution PHẢI được thực hiện qua lệnh
  `/speckit-constitution`, ghi rõ lý do trong Sync Impact Report, và đồng bộ
  các template phụ thuộc trong cùng một thay đổi.
- **Versioning**: theo semantic versioning — MAJOR khi xoá/định nghĩa lại
  nguyên tắc không tương thích ngược; MINOR khi thêm nguyên tắc hoặc mở rộng
  đáng kể; PATCH khi chỉnh câu chữ, làm rõ nghĩa.
- **Kiểm tra tuân thủ**: mỗi lần chạy `/speckit-analyze` PHẢI đối chiếu
  spec/plan/tasks với constitution; sai lệch được báo cáo là việc phải xử lý
  trước khi implement.

**Version**: 1.1.0 | **Ratified**: 2026-06-13 | **Last Amended**: 2026-06-13
