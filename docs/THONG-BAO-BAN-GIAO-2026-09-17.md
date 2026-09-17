# Thông báo bàn giao báo giá

## Cách sử dụng

1. Kỹ thuật khai xong cấu thành, kích thước, công đoạn và định mức, bấm **Lưu máy chủ**, rồi **Xác nhận hoàn tất kỹ thuật** ở khung **Xác nhận & bàn giao** phía trên báo giá.
2. Hệ thống gửi thông báo trong ứng dụng đến các tài khoản đang hoạt động có quyền sửa **Giá vật tư** và các tài khoản có quyền phê duyệt. Quản trị cũng nhận thông báo theo quyền này.
3. Vật tư bấm **Thông báo → Mở báo giá** để mở bước **Giá & hệ số**, cập nhật giá, bấm **Lưu máy chủ**, rồi **Xác nhận đã cập nhật giá vật tư**.
4. Người duyệt nhận thông báo mới, mở sang **Phân tích giá** để kiểm tra. Trình duyệt/phê duyệt vẫn dùng quy trình hiện có; xác nhận bàn giao không tự trình hoặc duyệt báo giá.

Người có nhiều quyền có thể thực hiện nhiều bước. Tài khoản chỉ có quyền xem giá hoặc sửa phần khác không mặc nhiên được xác nhận giá vật tư. Thông báo nhận theo quyền bộ phận, chưa phân công riêng người phụ trách từng báo giá.

## Trạng thái và dữ liệu

- Hiển thị người xác nhận, thời gian và phiên bản đã xác nhận. Có ghi chú bàn giao tùy chọn.
- Bộ đếm chưa đọc và trạng thái đã đọc được lưu trên máy chủ theo từng tài khoản. Mở thông báo lấy bản báo giá hiện tại; lịch sử thông báo giữ phiên bản tại thời điểm gửi.
- Danh sách hiển thị 200 thông báo gần nhất; bộ đếm tính tất cả thông báo chưa đọc còn đúng quyền. Tự cập nhật mỗi 30 giây khi ứng dụng đang hiển thị, khi chuyển lại cửa sổ và sau khi xác nhận.
- Phải lưu trước khi xác nhận. Máy chủ từ chối phiên bản cũ, bản đã trình/duyệt và tài khoản không đủ quyền.
- Xác nhận lặp lại trên cùng dữ liệu không tạo thông báo trùng, kể cả hai yêu cầu đồng thời.
- Đổi đơn giá không làm mất xác nhận kỹ thuật. Đổi dữ liệu kỹ thuật yêu cầu kỹ thuật xác nhận lại; xác nhận giá vật tư cũng hết hiệu lực theo dữ liệu đã đổi. Mã nội bộ được bổ sung cho báo giá cũ không được coi là thay đổi kỹ thuật.
- Kỹ thuật phải bổ sung dữ liệu cấu thành/kích thước thiếu trước khi xác nhận. Vật tư chỉ xác nhận sau khi kỹ thuật đã xác nhận dữ liệu hiện tại; giá vật tư không hợp lệ bị chặn. Đây vẫn là xác nhận nghiệp vụ của nhân viên, không thay thế việc người duyệt kiểm tra toàn bộ giá.
- Tài khoản kỹ thuật không xem giá hoặc ghi chú bàn giao nội bộ từ bộ phận vật tư. Thu hồi quyền khiến thông báo không còn thuộc phạm vi bị ẩn; tài khoản đã ngừng hoạt động không nhận thông báo mới.
- Thông báo ở trong ứng dụng. Không gửi email, Zalo hoặc thông báo đẩy khi đã đóng ứng dụng.
- Các bảng bàn giao, sự kiện và thông báo nằm trong SQLite dùng chung; được bao gồm trong bản sao lưu SQLite và xuất JSON của quản trị.

## Kiểm tra

- `node --test tests/notifications-server.test.cjs`: phân quyền, người nhận, đã đọc, phiên bản, thay đổi dữ liệu, chống trùng đồng thời và sao lưu.
- `node tests/notifications-browser.cjs`: ba tài khoản kỹ thuật → vật tư → người duyệt; lưu, xác nhận, mở thông báo, tải lại và bố cục di động.
- `node tools/verify-notifications-live.cjs`: đối chiếu bản build và kiểm tra giao diện trên Railway bằng thao tác đọc; không gửi thông báo thử đến nhân viên thật.
