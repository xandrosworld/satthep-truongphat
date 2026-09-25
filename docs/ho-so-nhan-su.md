# Hồ sơ nhân sự và phê duyệt

Đối chiếu mẫu `Ho so nhan vien (1).xlsx`: 101 trường thông tin, kèm bảng quá trình công tác. Không nhập dữ liệu cá nhân của nhân viên mẫu vào hệ thống thật.

## Cách dùng

1. Quản trị mở **Nhân sự → Phân công người khai báo**. Chỉ cấp cho người được phép xem toàn bộ hồ sơ, bao gồm lương, định danh và sức khỏe.
2. Người phụ trách chọn **Khai báo nhân sự**, điền hồ sơ, phòng ban/vị trí và quá trình công tác, rồi **Gửi duyệt hồ sơ**.
3. Quản trị xem tab **Chờ duyệt**, mở hồ sơ và duyệt hoặc từ chối có lý do. Hồ sơ mới chỉ vào danh sách nhân viên khi được duyệt; cập nhật chưa duyệt không thay bản chính thức.
4. Người phụ trách gửi **Yêu cầu kích hoạt** cho nhân viên đã có vị trí. Quản trị duyệt, đặt tên đăng nhập và mật khẩu ban đầu. Quyền lấy từ vị trí/bộ quyền đã khai trong cơ cấu tổ chức.
5. **Lịch sử hồ sơ** giữ người gửi, thời điểm, kết quả và lý do. Hồ sơ bị từ chối có thể sửa và gửi lại.
6. **Xuất hồ sơ** tạo Excel đầy đủ của từng nhân viên; **Xuất Excel danh sách** xuất các trường theo bộ lọc.

Hồ sơ nhân sự hiện có được giữ lại, không yêu cầu duyệt lại toàn bộ. Tài khoản đang sử dụng không bị tự đổi quyền khi triển khai. Dữ liệu hồ sơ và yêu cầu duyệt nằm trong bản sao lưu cơ cấu và lịch sử phiên bản.

## Kiểm tra

- `tests/personnel.test.cjs`: quyền người khai báo, dữ liệu nhạy cảm, ngày không hợp lệ, duyệt/từ chối, kích hoạt riêng, chặn gửi trùng và lịch sử.
- `tests/personnel-browser.cjs`: khai báo, duyệt, đủ 101 ô dữ liệu, lưu quá trình công tác, tải Excel và giao diện điện thoại.
- Toàn bộ kiểm thử Node: 682 đạt.
