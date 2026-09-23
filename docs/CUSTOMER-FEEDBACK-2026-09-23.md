# Cập nhật khai báo và báo giá — 23/09/2026

- Công thức nguyên công dùng ký hiệu K và chú giải tên tiếng Việt, không hiển thị ID nội bộ. Giữ nguyên cách nhân hệ số và quy đổi phần trăm.
- Tổng khối lượng phôi, diện tích và số cấu kiện luôn hiện ở các bước kỹ thuật, không nằm trong phần thông tin thu gọn.
- Nút **Khai hình dạng tấm** hỗ trợ chữ nhật, tròn, tam giác vuông, tam giác ba cạnh, đa giác, hình thang, hình thoi và thông số khai triển đang dùng. Có xem trước và tính diện tích/khối lượng; chỉ đổi dòng đang chọn.
- Kinh doanh có quyền **Giá chào, thuế và lịch sử gửi** được mở **Đơn hàng → Tạo đơn từ báo giá đã duyệt**. Chỉ Admin chốt đơn để giao sản xuất. Phản hồi tạo đơn cho kinh doanh không chứa dữ liệu giá vốn.
- Nhân viên được cấp danh mục gửi thay đổi chờ Admin duyệt. Admin vào danh mục → **Kiểm tra khai báo chờ duyệt**, xem trước/sau và xác nhận hoặc trả lại. Duyệt kiểm tra phiên bản, khóa công thức và quyền hiện tại của người khai báo. Không tự ghi đè danh mục đã được người khác cập nhật.
- Báo giá vẫn lưu nháp được; phê duyệt danh mục không thay thế quy trình duyệt báo giá. Phạm vi hàng chờ mới là danh mục dùng chung, không phải từng lần gõ kích thước trong báo giá.

## Kiểm tra

- `npm test`: 134 kiểm tra đạt.
- Nhóm server, phân quyền, danh mục kỹ thuật, khóa công thức, production và phản hồi mới: 38 kiểm tra đạt.
- `tests/customer-feedback-browser.cjs`: hình dạng, diện tích, không sửa danh mục, tổng luôn hiện, công thức và chú giải.
- `tests/customer-feedback-team-browser.cjs`: gửi/duyệt/tải lại danh mục, kinh doanh tạo đơn, kỹ thuật đổi hình và lưu/tải lại.
- Kiểm tra giao diện cũ `pricing-declarations-browser.cjs`: phần ma trận và giá hệ số đạt; phần TMC tiếp theo còn dùng selector tạo bảng cũ `[data-ip=tmc-edit][data-id=""]`, không chạy hết. Không tính bài này là đạt toàn bộ.
- Không gọi API AI tính phí, không tạo/sửa báo giá hoặc đơn hàng thật để thử nghiệm.
- Chưa xác minh quyền riêng của tài khoản kinh doanh trên production: thông tin đăng nhập quản trị lưu cục bộ không còn được máy chủ chấp nhận. Không đổi mật khẩu hoặc tự thay quyền tài khoản thật.
