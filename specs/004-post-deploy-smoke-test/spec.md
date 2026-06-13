# Feature Specification: Post-Deploy Smoke Test

**Feature Branch**: `004-post-deploy-smoke-test`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "Tạo GitHub Actions workflow chạy bộ regression test Playwright
(các happy path chính: login, add to cart, checkout) sau khi deploy Pages thành công.
Báo cáo kết quả test và fail PR nếu có test case nào fail."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Smoke test tự động xác nhận site đã deploy (Priority: P1)

Sau mỗi lần code được deploy lên GitHub Pages, một bộ smoke test tự động chạy
trực tiếp trên URL công khai của site — không phải môi trường local. Developer
biết ngay liệu phiên bản vừa deploy có hoạt động đúng hay không, mà không cần
mở trình duyệt kiểm tra thủ công.

**Why this priority**: Đây là giá trị cốt lõi của feature. Không có smoke test
post-deploy, một build pass trên CI nhưng render sai ở GitHub Pages (ví dụ: lỗi
base path, asset 404) sẽ không bị phát hiện cho đến khi có người truy cập thủ công.

**Independent Test**: Có thể kiểm tra độc lập bằng cách push một commit lên
`main`, đợi deploy hoàn thành, và xác nhận smoke test job tự động khởi động và
kết thúc với trạng thái "pass" — không cần thao tác nào thêm từ developer.

**Acceptance Scenarios**:

1. **Given** developer push commit lên `main` và deploy thành công,
   **When** smoke test job kết thúc,
   **Then** tất cả happy path tests (đăng nhập, thêm vào giỏ, checkout) pass
   trên URL GitHub Pages thực tế — trạng thái commit hiển thị ✅.

2. **Given** deploy thành công nhưng ứng dụng bị lỗi trên site thực
   (ví dụ: route không load được do cấu hình sai),
   **When** smoke test chạy,
   **Then** ít nhất một test fail — trạng thái commit hiển thị ❌, smoke test
   job được đánh dấu failed.

3. **Given** deploy chưa hoàn thành,
   **When** smoke test cố chạy,
   **Then** smoke test KHÔNG chạy — chỉ khởi động sau khi xác nhận deploy
   đã thành công.

---

### User Story 2 — Kết quả fail hiển thị rõ ràng, có thể debug ngay (Priority: P2)

Khi smoke test phát hiện ứng dụng bị lỗi sau deploy, developer nhận được đủ
thông tin để debug mà không cần tái hiện lại vấn đề thủ công: biết chính xác
test nào fail, trang nào lỗi, và có ảnh chụp màn hình làm bằng chứng.

**Why this priority**: Một smoke test chỉ báo "fail" mà không có thêm thông tin
thì ít có giá trị. Developer cần biết đủ để quyết định ngay: rollback, hotfix,
hay chấp nhận lỗi nhỏ.

**Independent Test**: Có thể kiểm tra bằng cách cố tình gây lỗi trên deployed
site (ví dụ: đổi tạm một route sai), push lên `main`, đợi smoke test fail, và
xác nhận: (1) commit/PR hiển thị trạng thái fail, (2) có thể download artifact
chứa báo cáo và screenshot trong vòng 5 phút sau khi job kết thúc.

**Acceptance Scenarios**:

1. **Given** smoke test fail do một hoặc nhiều happy path không pass,
   **When** developer xem trạng thái commit trên GitHub,
   **Then** commit hiển thị ❌ với tên check "Smoke Test" (hoặc tương đương) —
   không phải chỉ "pending" hay "cancelled".

2. **Given** smoke test fail,
   **When** developer mở trang pipeline trên GitHub,
   **Then** có thể download artifact chứa báo cáo HTML và screenshot của các
   test fail trong ít nhất 7 ngày.

3. **Given** smoke test fail trên commit thuộc một PR đang mở,
   **When** developer xem PR đó trên GitHub,
   **Then** check "Smoke Test" hiển thị trạng thái fail trên PR — cho phép
   cấu hình branch protection để block merge khi check này fail.

---

### Edge Cases

- Deploy hoàn thành nhưng GitHub Pages chưa propagate (CDN delay): smoke test
  nên retry một số lần hoặc chờ đủ lâu trước khi kết luận fail.
- Smoke test bị timeout (site quá chậm load): cần phân biệt "site lỗi" và
  "site chậm tạm thời" — timeout rõ ràng thay vì treo vô thời hạn.
- Smoke test chạy song song với người dùng thật truy cập site: test KHÔNG được
  làm thay đổi trạng thái persistent nào của site (site là read-only về mặt
  dữ liệu — phù hợp với ứng dụng client-only này).
- Pipeline của feature 003 fail ở bước deploy: smoke test KHÔNG chạy trong
  trường hợp này (không có site mới để test).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Smoke test PHẢI tự động kích hoạt sau khi bước deploy lên GitHub
  Pages hoàn thành thành công — không cần thao tác thủ công từ developer.
- **FR-002**: Smoke test PHẢI chạy trực tiếp trên URL GitHub Pages công khai
  (site đã deploy thực tế) — KHÔNG chạy trên localhost hay môi trường dev.
- **FR-003**: Smoke test PHẢI phủ tối thiểu 3 happy path: đăng nhập thành công,
  thêm sản phẩm vào giỏ hàng, hoàn thành thanh toán.
- **FR-004**: Khi bất kỳ smoke test nào fail, trạng thái của commit PHẢI được
  đánh dấu là fail trong giao diện GitHub — hiển thị trên commit và trên PR
  nếu commit thuộc về một PR đang mở.
- **FR-005**: Khi smoke test fail, pipeline PHẢI lưu lại báo cáo chi tiết và
  screenshot dưới dạng artifact có thể download trong tối thiểu 7 ngày.
- **FR-006**: Smoke test PHẢI chạy được headless trong môi trường CI — không
  phụ thuộc display server hay cấu hình local của developer.
- **FR-007**: Nếu bước deploy KHÔNG thành công (pipeline feature 003 fail ở
  deploy job), smoke test KHÔNG được kích hoạt.
- **FR-008**: Smoke test PHẢI hoàn thành trong vòng 5 phút kể từ khi khởi động.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% lần deploy thành công đều có smoke test chạy ngay sau — không
  có deploy nào "không được kiểm tra" sau khi feature được bật.
- **SC-002**: Khi smoke test fail, artifact (báo cáo + screenshot) có thể
  download từ GitHub trong vòng 5 phút sau khi job kết thúc, và còn accessible
  tối thiểu 7 ngày.
- **SC-003**: Trạng thái smoke test (pass/fail) hiển thị trực tiếp trên commit
  và trên PR liên quan trong giao diện GitHub — 0 trường hợp trạng thái bị
  thiếu hoặc không rõ ràng.
- **SC-004**: Smoke test hoàn thành (pass hoặc fail) trong vòng 5 phút kể từ
  khi bắt đầu chạy.
- **SC-005**: Smoke test KHÔNG gây ra side effect nào trên site đã deploy
  (không tạo dữ liệu persistent, không thay đổi trạng thái server).

## Assumptions

- Feature 003 (GitHub Pages auto-deploy) đã được implement và đang hoạt động —
  smoke test này phụ thuộc vào deploy pipeline của feature 003.
- URL GitHub Pages là `https://stevennguyen9211.github.io/ShopOnline/` — smoke
  test cần được cấu hình với đúng base URL này khi implement.
- Ứng dụng SimpleShop là SPA thuần client-side (không có backend) — smoke test
  không tạo ra side effect persistent vì mọi state chỉ tồn tại trong browser
  session của test runner.
- Branch protection (yêu cầu smoke test pass trước khi merge PR) là tùy chọn
  — feature này cung cấp check status trên commit/PR, nhưng việc bật branch
  protection là quyết định của team, không phải yêu cầu của feature.
- Bộ happy path test đã được định nghĩa và hoạt động từ feature 002 (E2E test
  suite) — smoke test này tái sử dụng các kịch bản đó, chỉ thay đổi môi trường
  thực thi (từ localhost sang URL GitHub Pages thực tế).
- Chỉ trigger khi push lên `main` dẫn đến deploy thành công — smoke test không
  chạy trên branch khác hay khi deploy bị skip.
