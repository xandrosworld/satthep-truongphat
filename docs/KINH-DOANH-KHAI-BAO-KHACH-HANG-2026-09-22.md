# Kinh doanh khai báo khách hàng — 22/09/2026

Quyền “Đầu vào báo giá / khai báo khách hàng” cho phép Kinh doanh thêm và sửa danh bạ cơ bản, độc lập với quyền xem chi phí. Quyền sửa/tạo báo giá, duyệt giá và danh mục giá không thay đổi.

Máy chủ chỉ trả tên, liên hệ, điện thoại, email, địa chỉ, mã số thuế, ID và phiên bản cho tài khoản không xem nội bộ. Khi ghi chỉ nhận các trường cơ bản; giữ nguyên chủ sở hữu, đánh giá, lịch sử, cơ hội và thông tin CRM. Khách mới được giao cho người tạo. Các API CRM chi tiết, chính sách, nhập hàng loạt và tài liệu vẫn kiểm tra quyền cũ. Phiên bản cũ bị từ chối để tránh ghi đè.

Giao diện Kinh doanh có mục Đầu vào khách hàng khi được cấp quyền, dùng biểu mẫu cơ bản. Thu hồi quyền sẽ đăng xuất phiên hiện tại. Tài khoản đang đăng nhập cần đăng nhập lại để nhận quyền mới sau khi triển khai.

Kiểm tra: 16 bài kiểm tra máy chủ/phân quyền đạt; Playwright tạo, sửa, tải lại, thu hồi quyền, không hiện CRM nâng cao và bố cục laptop 1093/1366/1920 px đạt. Không ghi dữ liệu khách hàng thử lên máy chủ thật.
