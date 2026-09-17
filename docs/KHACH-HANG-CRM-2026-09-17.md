# Hồ sơ khách hàng và chăm sóc

- Hồ sơ có trạng thái hoạt động/tạm dừng/ngừng giao dịch; công ty/khách lẻ/chưa phân loại; người phụ trách; ngành nghề, nguồn khách, ghi chú; đánh giá và căn cứ; lịch hẹn chăm sóc.
- Khách mới trên máy chủ mặc định giao cho người tạo. Quản trị điều chuyển có lý do; ghi người cũ, người mới, người thực hiện và thời điểm. Giữ lịch sử khi tài khoản bị khóa.
- Lưu trao đổi theo kênh, ngày thực hiện, nội dung và lịch hẹn tiếp. Sửa hồ sơ, cập nhật cơ hội và điều chuyển đều có lịch sử. Máy chủ gắn người thực hiện từ phiên đăng nhập; không nhận lịch sử giả từ trình duyệt.
- Cơ hội có tên, mô tả, giai đoạn, hạn và giá trị dự kiến. Tạo báo giá từ cơ hội kế thừa khách, dự án và nhu cầu; lưu mã liên kết. Sửa cơ hội không thay báo giá đã lưu.
- Hồ sơ hiển thị báo giá và đơn hàng liên quan theo mã khách, không ghép theo tên. Khách trùng tên được tách biệt. Báo giá cũ chỉ có tên cần chọn lại hồ sơ trong bản nháp để liên kết.
- Số đơn là số đơn hàng đã chuyển từ báo giá trên máy chủ; không đếm báo giá hoặc cơ hội thắng thành đơn. Đơn hàng giữ mã khách theo dữ liệu lúc bàn giao.
- Cấu hình ngưỡng đơn để gợi ý VIP, số ngày không chăm sóc, tiêu chí rủi ro và hệ số theo đánh giá. Để trống cho đến khi khách chốt quy tắc. Không tự đánh giá rủi ro hoặc tự điều chuyển; chỉ nhắc quá hạn từ lịch hẹn/ngưỡng đã cấu hình.
- Hệ số chỉ áp qua nút xác nhận vào báo giá đúng khách đang mở, cần quyền sửa hệ số. Dùng hệ số khách hàng sẵn có, không cộng thêm một lớp; lưu lý do và cấu hình nguồn. Không tự áp vào mọi báo giá khi thay đánh giá.
- Sửa danh bạ không thay thông tin đã chụp vào báo giá. Báo giá mới chỉ lấy liên hệ cần thiết; ghi chú chăm sóc và cơ hội nội bộ không đưa vào bản chào hay giao diện kỹ thuật.
- Danh bạ, lịch sử, cơ hội và chính sách có trong bản sao lưu quản trị. Ghi dữ liệu kiểm tra phiên bản để tránh ghi đè khi nhiều người cùng sửa.

## Phân quyền

Giữ quyền danh bạ của hệ thống hiện tại: tài khoản xem chi phí được đọc danh bạ; sửa cần quyền “Khách hàng và yêu cầu”. Quản trị cấu hình chính sách và điều chuyển. Lập báo giá cần quyền quản lý báo giá. Nhân viên kỹ thuật không được xem CRM nội bộ.

## Chờ xác nhận nghiệp vụ

Khách chưa chốt ngưỡng VIP, tiêu chí rủi ro, hệ số và thời hạn chuyển người chăm sóc. Bản này cung cấp cấu hình, nhắc việc và điều chuyển thủ công; không thiết lập quy tắc tự động thay khách. Thuế theo sản phẩm/nhóm là câu hỏi riêng đang chờ xác nhận ở phần báo giá.

## Kiểm tra

`tests/crm.test.cjs`, `tests/crm-server.test.cjs`, `tests/crm-browser.cjs` kiểm tra hồ sơ → trao đổi → cơ hội → báo giá, lưu lại, phân quyền, chống ghi đè, lịch sử, thống kê, snapshot và hệ số. `tests/customer-directory-team-browser.cjs` kiểm tra hồi quy danh bạ dùng chung. `tools/verify-crm-live.cjs` chỉ đọc trên bản Railway; không tạo khách/cơ hội thử trên dữ liệu thật.
