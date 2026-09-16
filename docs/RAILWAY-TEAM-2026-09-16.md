# Bản dùng chung trên Railway — 16/09/2026

- URL: https://quotation-production-19eb.up.railway.app
- Project: `truong-phat-quotation` (`214e4fd7-5566-43ad-b799-63db20833eb5`).
- Service: `quotation`, environment `production`, một tiến trình Node/SQLite.
- Volume `/data`; database `/data/truongphat.sqlite`. Không lưu database trong lớp filesystem tạm của container.
- Tài khoản quản trị và mật khẩu khởi tạo lưu riêng trong `artifacts/railway-team/private/`; không đưa vào Git hoặc log triển khai.

## Cách bắt đầu

1. Đăng nhập bằng tài khoản quản trị, đổi mật khẩu ở danh sách báo giá.
2. Mở **Tài khoản và phân quyền → Tạo tài khoản**. Nhập tên thật của nhân viên, cấp những phần người đó phụ trách. Chưa tự tạo tài khoản nhân viên thực tế khi chưa có danh sách.
3. Nhân viên mở báo giá trong **Danh sách báo giá**, cập nhật phần được cấp và bấm **Lưu máy chủ**.
4. Người có quyền tạo/trình báo giá trình bản nháp; người có quyền duyệt duyệt bản đã trình. Sửa bản đã duyệt phải tạo bản sửa, lịch sử cũ giữ nguyên.
5. Người phụ trách danh mục mở **Làm việc với danh mục**, chỉnh rồi **Lấy / phát hành danh mục → Phát hành**. Có kiểm tra phiên bản để tránh ghi đè thay đổi của người khác.

## Phạm vi phân quyền

Quản trị có toàn quyền. Vai trò kỹ thuật có thể được giới hạn các phần sửa; người duyệt có quyền duyệt riêng; kinh doanh có thể chỉ xem/xuất bản giá bán đã duyệt. Quyền xem nội bộ, duyệt, sửa hệ số và duyệt dưới giá gốc được cấp riêng.

Các phần sửa có thể chọn nhiều: khách hàng/yêu cầu; cấu thành/kích thước/hao hụt; nguyên công/định mức; giá vật tư; vận chuyển/lắp đặt; hệ số; giá chào/thuế/lịch sử gửi; tạo/trình/mở lại báo giá; danh mục vật tư; đơn giá nguyên công/nhóm sản phẩm; bảng giá vận chuyển/lắp đặt; quy ước/công thức; thư viện mẫu.

Đây là phân quyền **sửa theo phần**, không phải phân quyền chỉ xem từng khách hàng hay chỉ xem báo giá được giao. Người được xem nội bộ hiện xem được các báo giá nội bộ. Người chỉ xem giá bán không nhận cấu thành, giá vốn hoặc hệ số qua API.

Máy chủ kiểm tra dữ liệu thay đổi theo quyền, không chỉ ẩn nút. Khóa tài khoản, đặt lại mật khẩu hoặc đổi quyền thu hồi các phiên đăng nhập. Đổi mật khẩu cá nhân yêu cầu mật khẩu cũ.

Hai người mở cùng một báo giá có thể xem và sửa bản làm việc riêng. Người lưu sau khi phiên bản đã đổi phải lấy bản mới hoặc giữ bản sao; chưa có ghép tự động các thay đổi đồng thời.

## Dữ liệu và sao lưu

- Bản Netlify vẫn là bản riêng lưu theo trình duyệt, không tự chuyển dữ liệu qua Railway.
- Có thể xuất JSON ở bản cũ rồi dùng **Nhập báo giá từ bản sao lưu** trên Railway. Thao tác nhập báo giá đang mở trong tệp thành bản nháp, không tự nhập toàn bộ danh sách và lịch sử gửi cũ.
- `BG-MAU-RAILWAY` là dữ liệu minh họa dùng kiểm tra phân quyền; không phải báo giá thật của khách. Tài khoản QA tạo khi kiểm tra đã bị khóa.
- Sao lưu SQLite đầy đủ bằng `npx @railway/cli@latest ssh node server/backup.cjs`; bản sao nằm trong `/data/backups`. Có thể tải bản sao ra ngoài Railway để lưu riêng. Chưa cấu hình lịch sao lưu tự động.
- Không tăng số replica khi vẫn sử dụng SQLite và một volume.
- Full mobile workflow tiếp tục hoãn theo trao đổi với khách.

## Bằng chứng kiểm tra

- `artifacts/railway-team/unit-tests.log`: 400 kiểm thử logic/API đạt.
- `artifacts/railway-team/local-browser/results.json`: 6 luồng phân quyền/giao diện, gồm giới hạn danh mục và chống ghi đè.
- Kiểm tra lại 3 luồng lịch sử phiên bản trên máy chủ bằng `tests/quote-versions-team-browser.cjs`.
- `artifacts/railway-team/live/results.json`: kiểm tra HTTPS, đăng nhập thực tế, nhân viên lưu giá, API chặn sửa trái quyền và thu hồi phiên khi khóa tài khoản; có hash bản triển khai.
- `artifacts/railway-team/live/restart-check.json`: kết quả đọc lại dữ liệu sau khởi động lại.

## Triển khai lại

Build với `node tools/build.cjs`, chạy kiểm thử liên quan, rồi deploy Dockerfile vào đúng project/service. Chỉ đưa mã nguồn cần chạy vào thư mục đóng gói; không gửi bản sao lưu, hợp đồng, ảnh khách hoặc thông tin đăng nhập.

Các biến cần thiết: `TP_PUBLIC_ORIGIN`, `TP_DATABASE_PATH`, `TP_SETUP_KEY`. Railway cấp `PORT` và mount volume. `TP_SETUP_KEY` là mã riêng dùng cho lần tạo quản trị đầu tiên; không đưa vào giao diện hay log. Health check `/healthz`; HTTPS origin bắt buộc, cookie Secure/HttpOnly/SameSite và CSRF cho yêu cầu ghi.

Nguồn cấu hình triển khai: [Railway volumes](https://docs.railway.com/volumes), [healthcheck và hostname](https://docs.railway.com/deployments/healthchecks). `/healthz` nhận probe của nền tảng; các API dữ liệu vẫn kiểm tra đúng host HTTPS.
