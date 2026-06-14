<!--
Sync Impact Report
==================
- Version change: 1.5.0 → 1.6.0
- Modified principles: none
- Added sections:
  - "Push & Pull Request sau Implement" — quy trình bắt buộc mới (v1.4.0)
  - Ràng Buộc Kỹ Thuật: 2 bullet mới — GitHub Secrets trước push và
    cấm module-level SDK init phụ thuộc env vars (v1.5.0)
- Removed sections: n/a
- Modified sections:
  - Ràng Buộc Kỹ Thuật: thêm quy tắc secrets và lazy initialization (v1.5.0)
  - Quy Trình Phát Triển: thêm quy tắc cross-cutting test setup (v1.6.0)
- Templates requiring updates:
  - ✅ plan-template.md — không có tham chiếu cứng cần thay đổi
  - ✅ spec-template.md — không có tham chiếu cứng cần thay đổi
  - ✅ tasks-template.md — không có tham chiếu cứng cần thay đổi
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
- **Ngoại lệ duy nhất (Nguyên tắc VIII & IX)**: dữ liệu user có thể được đọc
  từ Supabase (bảng `public.users`) phục vụ luồng đăng nhập học tập — CHỈ
  SELECT, không có backend logic, không ghi dữ liệu, không dùng Supabase Auth.

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

### VII. CI/CD & Deployment Có Kiểm Soát

CI/CD pipeline PHẢI là nguồn chân lý duy nhất cho build và deployment; KHÔNG
có thao tác thủ công nào được phép trong quy trình phát hành.

- **Fail fast**: Workflow GitHub Actions PHẢI dùng `needs:` để job sau chỉ chạy
  khi job trước thành công — KHÔNG cho phép job chạy sau một job đã fail.
- **Build tự động**: Artifact build (`dist/`) PHẢI được tạo hoàn toàn bởi CI;
  KHÔNG commit `dist/` lên repo; thư mục này PHẢI nằm trong `.gitignore`.
- **Deployment tự động**: GitHub Pages PHẢI deploy từ artifact do CI sinh ra
  (branch `main` hoặc thư mục `dist/` từ workflow) — KHÔNG thực hiện deploy
  thủ công ở bất kỳ bước nào.
- **Test artifacts**: Workflow chạy test PHẢI cấu hình `upload-artifact` để lưu
  Playwright HTML report và screenshot khi có test fail; artifact PHẢI accessible
  sau khi workflow kết thúc để debug không cần GUI.
- **Phạm vi CI regression**: Test chạy trên CI CHỈ cần phủ happy path của các
  luồng chính; test error path và edge case là optional trên CI (toàn bộ suite
  chạy trên local trước khi merge).
- **Môi trường độc lập**: Bộ test CI PHẢI chạy được headless (no-display
  environment), không phụ thuộc cấu hình local, port cố định, hay credential
  hard-code; mọi biến môi trường PHẢI được khai báo tường minh trong workflow.

**Lý do**: Automation ngăn lỗi do thao tác thủ công và đảm bảo mọi người trong
nhóm deploy theo cùng một quy trình. Fail fast tiết kiệm thời gian CI. Artifact
lưu lại bằng chứng khi test fail là thiết yếu cho debug trong môi trường không
có GUI — đây là kỹ năng CI/CD thực tế cần học.

### VIII. Plain Text Password là Quyết Định Có Chủ Đích

Password được lưu và so sánh plain text là lựa chọn có chủ đích phục vụ mục
đích học tập — KHÔNG phải lỗi cần sửa.

- KHÔNG được tự ý thêm hashing (bcrypt, argon2...), encryption, hoặc Supabase
  Auth vào bất kỳ bước nào, trừ khi người dùng yêu cầu rõ ràng.
- Lớp so sánh password PHẢI thực hiện trực tiếp bằng string equality, không
  qua bất kỳ thư viện mã hóa nào.
- Nếu có task "security hardening" hay "best practices" trong bất kỳ phase nào,
  nguyên tắc này được ưu tiên — KHÔNG xem plain text là vi phạm cần khắc phục.

**Lý do**: Mục tiêu học tập ở giai đoạn này là hiểu luồng xác thực
username/password từ đầu đến cuối. Thêm hashing làm phức tạp code, che khuất
luồng chính cần học, và vi phạm Nguyên tắc II (Đơn Giản Hơn Đầy Đủ).

### IX. Schema Database Cố Định — Chỉ Đọc

Schema của bảng `public.users` trong Supabase là cố định và KHÔNG được thay đổi
dưới bất kỳ hình thức nào.

- KHÔNG tạo migration, KHÔNG ALTER TABLE, KHÔNG thêm/xóa/đổi tên cột.
- Tương tác với database CHỈ được phép qua câu lệnh SELECT — chỉ đọc dữ liệu.
- KHÔNG INSERT, UPDATE, hay DELETE bất kỳ row nào trong bảng `public.users`.
- Nếu một task yêu cầu thay đổi schema hoặc ghi dữ liệu, PHẢI báo cáo vi phạm
  nguyên tắc này và dừng lại trước khi thực thi.

**Lý do**: Bảng `public.users` là tập dữ liệu học tập cố định. Mục tiêu là đọc
dữ liệu để minh hoạ luồng đăng nhập — không quản lý vòng đời user. Giới hạn
SELECT ngăn các thay đổi ngoài ý muốn làm hỏng dữ liệu demo dùng chung.

## Ràng Buộc Kỹ Thuật

- Stack PHẢI là web frontend thuần (SPA hoặc static site); lựa chọn framework
  cụ thể do plan quyết định nhưng không được vi phạm Nguyên tắc IV.
- Trạng thái cần lưu giữa các phiên (ví dụ giỏ hàng) chỉ được dùng
  localStorage/sessionStorage của trình duyệt.
- Thanh toán, gửi email... nếu có chỉ được giả lập (mock) và PHẢI ghi rõ là
  giả lập trong UI hoặc tài liệu.
- **Ngoại lệ đăng nhập**: luồng login được kết nối Supabase read-only theo
  Nguyên tắc VIII & IX — xác thực qua SELECT username/password plain text, không
  dùng Supabase Auth, không backend logic, không ghi dữ liệu.
- Bộ test PHẢI chạy được offline bằng một lệnh duy nhất (local); trên CI PHẢI
  chạy headless không phụ thuộc môi trường local (Nguyên tắc VII).
- Thư mục `dist/` (build artifact) PHẢI nằm trong `.gitignore`; CI là nguồn
  duy nhất được phép tạo và deploy artifact (Nguyên tắc VII).
- **GitHub Secrets trước khi push**: Mọi biến môi trường `VITE_*` được thêm
  bởi một feature PHẢI được khai báo trong GitHub Secrets trước khi push lên
  remote. Push khi secrets chưa set là vi phạm — CI build với env vars rỗng
  khiến app crash và deploy bị block (bài học từ incident 006-real-auth).
- **Cấm module-level SDK initialization**: SDK/client bên ngoài (Supabase,
  API clients...) KHÔNG được khởi tạo ở top-level của module khi phụ thuộc
  env vars. Nếu env var thiếu, lỗi sẽ crash toàn bộ app thay vì chỉ feature
  bị ảnh hưởng. PHẢI dùng guard (`if (!url) throw new Error(...)`) hoặc lazy
  initialization để lỗi xuất hiện rõ ràng và cô lập.

## Quy Trình Phát Triển & Cổng Chất Lượng

- Mọi feature PHẢI đi theo trình tự Spec Kit: spec → plan → tasks → implement.
- Mục "Constitution Check" trong plan.md là cổng bắt buộc: plan vi phạm nguyên
  tắc mà không có biện minh trong Complexity Tracking thì KHÔNG được triển khai.
- Mỗi user story PHẢI test được độc lập; khi hoàn thành story, các acceptance
  scenario tương ứng PHẢI có test tự động đi kèm (theo Nguyên tắc III & VI).
- Review (tự review hoặc review chéo) PHẢI đối chiếu thay đổi với 9 nguyên tắc
  trước khi đánh dấu task hoàn thành.
- **Đóng GitHub Issues**: Sau khi `/speckit-implement` hoàn thành và commit được
  push lên remote, mọi GitHub issue của feature đó PHẢI được đóng với comment
  reference đến commit SHA. Dùng script:
  `.specify/scripts/bash/close-feature-issues.sh <commit-sha>`
- **Cross-cutting Test Setup**: Khi một feature thay đổi cơ chế xác thực,
  session, hoặc bất kỳ shared state nào được dùng trong `beforeEach` của các
  test file khác, tasks PHẢI liệt kê **tất cả** file test bị ảnh hưởng —
  không chỉ file test của feature đó. `/speckit-tasks` không tự scan codebase
  nên người viết task PHẢI chủ động tìm: `grep -r "loginAsUser\|beforeEach"
  tests/` để xác định phạm vi. Vi phạm dẫn đến CI fail trên các test không
  liên quan feature (bài học từ incident 006-real-auth: đổi auth nhưng quên
  update `beforeEach` trong us2/us3/us4/us5).
- **Push & Pull Request sau Implement (BẮT BUỘC)**: Sau khi `/speckit-implement`
  hoàn thành tất cả tasks và đánh dấu `[x]` trong tasks.md, PHẢI thực hiện
  theo thứ tự:
  1. Chạy `git push origin <branch hiện tại>` để đẩy code lên remote.
  2. Tạo pull request vào nhánh `main` bằng `gh pr create` với:
     - **Title**: tên feature lấy từ tiêu đề `spec.md`
       (ví dụ: `feat: Xác Thực Người Dùng Thật`)
     - **Body**: danh sách tất cả task đã đánh dấu `[x]` trong `tasks.md`,
       kèm commit SHA vừa push
  3. Báo URL pull request cho người dùng ngay sau khi tạo xong.
  4. **Ngoại lệ**: Nếu branch hiện tại là `main`, PHẢI cảnh báo người dùng
     và bỏ qua bước tạo PR (KHÔNG tạo PR từ `main` vào `main`).

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

**Version**: 1.6.0 | **Ratified**: 2026-06-13 | **Last Amended**: 2026-06-14
