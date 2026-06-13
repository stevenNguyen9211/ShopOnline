# Feature Specification: GitHub Pages Auto-Deploy

**Feature Branch**: `003-github-pages-deploy`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "Deploy SimpleShop lên GitHub Pages tự động mỗi khi push lên main branch."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Tự động deploy khi push lên main (Priority: P1)

Developer push code lên branch `main` và ứng dụng SimpleShop phiên bản mới
tự động được cập nhật trên GitHub Pages — không cần bất kỳ thao tác thủ công
nào sau khi push.

**Why this priority**: Đây là giá trị cốt lõi của feature: loại bỏ bước deploy
thủ công, đảm bảo `main` luôn phản ánh đúng những gì đang chạy trên production.

**Independent Test**: Có thể kiểm tra độc lập bằng cách push một thay đổi nhỏ
lên `main` (ví dụ: sửa một chuỗi văn bản trong app), đợi pipeline hoàn thành,
và xác nhận thay đổi đó hiện trên URL GitHub Pages.

**Acceptance Scenarios**:

1. **Given** developer push commit lên branch `main`,
   **When** pipeline hoàn thành thành công,
   **Then** phiên bản mới của ứng dụng accessible tại URL GitHub Pages trong
   vòng 5 phút kể từ lúc push.

2. **Given** developer push lên một branch khác (không phải `main`),
   **When** push hoàn thành,
   **Then** pipeline KHÔNG được kích hoạt — không có bước CI nào (build,
   test, hay deploy) được thực thi trong phạm vi feature này.

3. **Given** pipeline deploy thành công,
   **When** truy cập URL GitHub Pages,
   **Then** ứng dụng SimpleShop chạy đúng và đầy đủ chức năng (không bị lỗi
   404 trên route, không bị mất asset tĩnh).

---

### User Story 2 — Cổng chất lượng: chỉ deploy khi test pass (Priority: P2)

Pipeline KHÔNG được deploy lên GitHub Pages nếu bất kỳ bước kiểm tra nào
(build hoặc regression test) fail. Code lỗi không bao giờ đến tay người dùng.

**Why this priority**: Deploy code không pass test làm hỏng sản phẩm đang chạy
cho người dùng. Đây là điều kiện an toàn tối thiểu của mọi CI/CD pipeline.

**Independent Test**: Có thể kiểm tra bằng cách cố tình gây lỗi build (ví dụ:
thêm lỗi TypeScript), push lên `main`, và xác nhận pipeline fail ở bước build
và bước deploy bị bỏ qua — URL GitHub Pages vẫn chạy phiên bản cũ.

**Acceptance Scenarios**:

1. **Given** developer push code có lỗi build lên `main`,
   **When** pipeline chạy bước build,
   **Then** pipeline dừng ngay tại bước build — bước deploy PHẢI bị bỏ qua
   hoàn toàn, URL GitHub Pages PHẢI vẫn phục vụ phiên bản trước đó.

2. **Given** developer push code có regression test fail lên `main`,
   **When** pipeline chạy bước test,
   **Then** pipeline dừng tại bước test — bước deploy PHẢI bị bỏ qua.

3. **Given** một pipeline đang chạy bị fail,
   **When** developer nhìn vào trạng thái commit trên GitHub,
   **Then** commit đó hiển thị trạng thái fail rõ ràng (không phải "pending"
   hay "success").

---

### User Story 3 — Lưu artifact để debug khi test fail (Priority: P3)

Khi pipeline fail do test, developer có thể xem Playwright HTML report và
screenshot ngay trên GitHub — không cần cài đặt gì thêm, không cần chạy lại
test trên máy local.

**Why this priority**: Môi trường CI không có giao diện đồ hoạ — không có
artifact thì developer không thể biết tại sao test fail. Artifact là công cụ
debug duy nhất khi pipeline chạy trên cloud.

**Independent Test**: Có thể kiểm tra bằng cách cố tình làm fail một test,
push lên `main`, đợi pipeline fail, và xác nhận HTML report + screenshot có
thể download từ trang GitHub Actions.

**Acceptance Scenarios**:

1. **Given** pipeline fail do có test không pass,
   **When** developer mở trang pipeline trên GitHub,
   **Then** có thể download artifact chứa Playwright HTML report và screenshot
   của các test fail trong ít nhất 7 ngày.

2. **Given** pipeline pass hoàn toàn (không có test fail),
   **When** pipeline kết thúc thành công,
   **Then** không cần lưu artifact test (chỉ lưu khi fail để giảm storage).

---

### Edge Cases

- Push nhiều commit liên tiếp nhanh: pipeline của commit sau không ảnh hưởng
  kết quả deploy của commit trước đang chạy.
- Pipeline bị cancel giữa chừng: URL GitHub Pages PHẢI vẫn phục vụ phiên bản
  cuối cùng được deploy thành công — không bị corrupt hay trống.
- Lần đầu tiên thiết lập (repo chưa có GitHub Pages): pipeline phải hoàn thành
  thành công và GitHub Pages phải accessible sau khi thiết lập đúng cấu hình.
- Ứng dụng được deploy ở sub-path (ví dụ `/shop-sdd/`): tất cả route, asset
  và link nội bộ PHẢI hoạt động đúng với base path đó.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Pipeline CI PHẢI tự động kích hoạt mỗi khi có push lên branch `main` —
  và CHỈ kích hoạt bởi push lên `main`; push lên các branch khác không trigger pipeline.
- **FR-002**: Pipeline CI PHẢI build ứng dụng thành tập hợp file tĩnh (HTML,
  JS, CSS, assets) trước khi deploy.
- **FR-003**: File build output KHÔNG được commit vào repository; chỉ tồn tại
  trong môi trường CI trong suốt quá trình chạy.
- **FR-004**: Bước deploy CHỈ được thực thi sau khi tất cả bước trước đó (build,
  test) hoàn thành thành công — pipeline PHẢI fail fast.
- **FR-005**: Pipeline PHẢI chạy regression test (phủ happy path các luồng chính:
  đăng nhập, xem sản phẩm, thêm vào giỏ, checkout) trước bước deploy.
- **FR-006**: Regression test trên CI PHẢI chạy được headless, không phụ thuộc
  môi trường local, không cần display server.
- **FR-007**: Khi pipeline deploy thành công, ứng dụng PHẢI accessible qua URL
  GitHub Pages công khai và tất cả tính năng PHẢI hoạt động đúng.
- **FR-008**: Khi push lên branch không phải `main`, pipeline KHÔNG được kích hoạt
  — không có bước build, test, hay deploy nào được thực thi.
- **FR-009**: Khi có test fail, pipeline PHẢI lưu Playwright HTML report và
  screenshot dưới dạng artifact downloadable trong tối thiểu 7 ngày.
- **FR-010**: Trạng thái pipeline (pass/fail/pending) PHẢI hiển thị trực tiếp
  trên commit tương ứng trong giao diện GitHub.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sau khi push lên `main`, phiên bản mới của ứng dụng accessible
  trên GitHub Pages trong vòng 5 phút — có thể đo bằng timestamp push vs.
  timestamp site cập nhật.
- **SC-002**: 100% lần deploy trên `main` chỉ xảy ra sau khi build VÀ test đều
  pass — không có trường hợp ngoại lệ.
- **SC-003**: Khi test fail, artifact (HTML report + screenshot) download được từ
  GitHub Actions trong vòng 2 phút sau khi pipeline kết thúc, và còn accessible
  ít nhất 7 ngày.
- **SC-004**: Pipeline hoàn thành thành công (build + test + deploy) trong vòng
  10 phút kể từ khi push.
- **SC-005**: Developer không cần thực hiện bất kỳ bước thủ công nào sau push để
  site cập nhật — 0 thao tác thủ công.

## Clarifications

### Session 2026-06-13

- Q: Pipeline chỉ chạy trên branch `main`, hay chạy trên mọi branch và điều kiện deploy là branch=main? → A: Pipeline chỉ kích hoạt trên branch `main` (Option A). Push lên branch khác không trigger pipeline.

## Assumptions

- Repository đã được host trên GitHub và developer có quyền push lên `main`.
- GitHub Pages đã được enable cho repository trong Settings (hoặc sẽ được bật
  như một phần của quá trình thiết lập feature này).
- Ứng dụng SimpleShop là SPA thuần client-side (không có backend), phù hợp để
  deploy lên GitHub Pages dưới dạng static site.
- GitHub Pages của project repo sẽ serve từ sub-path (ví dụ:
  `https://<username>.github.io/<repo-name>/`) — ứng dụng cần được cấu hình
  đúng base path để hoạt động ở sub-path này.
- Regression test trên CI chỉ phủ happy path (không cần chạy toàn bộ 27 test
  case như local) — phù hợp với Constitution VII.
- Không có secret hay environment variable bí mật cần thiết cho build hoặc
  runtime (ứng dụng hoàn toàn client-side per Constitution IV).
- Pipeline chỉ cần trigger trên push — không cần trigger theo lịch (cron) hay
  pull request trong phạm vi feature này.
