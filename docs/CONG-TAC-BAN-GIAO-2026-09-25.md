# Công tắc bàn giao từng phần

Đã triển khai `c639bf4` ngày 25/09/2026. Thay nút chữ bằng công tắc có nhãn trạng thái ở hai cột Kỹ thuật và Giá vật tư. Bật là khóa bàn giao, tắt là mở sửa. Thao tác vẫn có bước xác nhận; mở sửa phải ghi lý do. Trạng thái chỉ đổi sau khi máy chủ chấp nhận. Tài khoản thiếu quyền thấy công tắc bị vô hiệu hóa. Giữ nguyên quy tắc mở kỹ thuật làm phần giá liên quan cần xác nhận lại.

Công tắc hỗ trợ bàn phím, role switch và aria-checked; bảng cuộn ngang trên điện thoại. Tên loại dòng hiển thị tiếng Việt. Kiểm thử trình duyệt bật kỹ thuật/giá, tắt mở sửa, trạng thái công tắc và mobile đạt; kiểm thử máy chủ khóa phạm vi và kiểm tra phụ thuộc đạt. Đã sao lưu trước triển khai, kiểm tra HTTPS với báo giá có dữ liệu, không ghi nghiệp vụ thật; thu hồi phiên kiểm tra và healthcheck đạt.
