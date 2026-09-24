# Giao việc báo giá

## Cập nhật vai trò linh hoạt

Admin chọn Quản lý / Nhân viên / Không thuộc bộ phận cho từng tài khoản tại **Phân cấp giao việc**. Mỗi bộ phận có thể có nhiều quản lý; một người có thể thuộc nhiều bộ phận nếu có đủ quyền nghiệp vụ. Quản lý giao cho mình hoặc nhân viên cùng bộ phận. Quyền áp dụng ngay khi cấu hình thay đổi, không cần sửa mã hoặc đăng nhập lại. Cấu hình cũ tự đọc người phụ trách thành Quản lý và cấp dưới thành Nhân viên; công việc đang giao không bị đổi người. Không tự gán vai trò cho tài khoản thực tế.

- Admin mở **Phân cấp giao việc** ở thanh trên, chọn phụ trách kinh doanh, kỹ thuật, cập nhật giá và cấp dưới của từng bộ phận. Chỉ tài khoản đang hoạt động và có quyền tương ứng mới được chọn. Chưa tự gán nhân sự thật; đang chờ khách cung cấp danh sách.
- Sau khi lưu phân cấp, Admin giao được mọi phần; phụ trách kỹ thuật chỉ giao phần kỹ thuật cho mình/cấp dưới đã khai; phụ trách giá có quyền tương tự cho phần giá. Phân cấp không tự cấp thêm quyền đọc giá hoặc sửa dữ liệu.
- Xác nhận đầu vào gửi thông báo đến Admin và các phụ trách đã khai. Trước khi khai phân cấp, giữ luồng phân quyền cũ và thông báo theo các quyền bộ phận hiện có.
- Lưu giao việc hoặc đổi người sẽ gửi thông báo ngay cho người mới. Cập nhật lặp không gửi trùng; lưu từ phiên giao việc cũ bị từ chối.
- **Công việc báo giá** hiển thị việc của cá nhân; phụ trách xem thêm cấp dưới; Admin xem toàn bộ. Người nhận bấm **Bắt đầu làm**. Trạng thái hoàn thành lấy từ xác nhận bàn giao hiện tại, không có nút tự đánh dấu hoàn thành bỏ qua kiểm tra. Khi xác nhận mất hiệu lực, công việc không còn hiện hoàn thành.
- Giao việc và tiến độ cá nhân không ghi đè nội dung, giá hoặc phiên bản báo giá. Phân cấp có phiên bản, lịch sử thay đổi và nằm trong sao lưu máy chủ.

Kiểm tra: `tests/work-teams.test.cjs`, `tests/work-teams-browser.cjs`, `tests/notifications-server.test.cjs`, `tests/notifications-browser.cjs`, `tests/work-assignment-server.test.cjs`.
