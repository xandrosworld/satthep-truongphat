# Khai báo phân loại khách hàng trong phân tích giá

Yêu cầu được anh Hợp xác nhận ngày 25/09/2026: bộ phận khai báo phải tiếp cận được mục Phân loại khách hàng dù hệ số bị ẩn.

- Tại Phân tích giá → Phân loại khách hàng → Khai báo / xem, mở cửa sổ chọn riêng, không điều hướng vào trang hệ số bị ẩn.
- Danh sách lấy từ loại khách hàng trong danh mục đã phát hành. Người khai báo chỉ thấy tên và mô tả; máy chủ áp dụng hệ số tương ứng và tính lại báo giá.
- Được khai báo khi có quyền sửa báo giá, xem nội bộ và quyền khai đầu vào hoặc sử dụng/cài đặt hệ số. Quyền xem phân tích giá vẫn được kiểm tra. Không cấp thêm quyền quản trị danh mục hay mở khóa hệ số.
- Lưu tạo phiên bản và lịch sử thay đổi. Giữ khóa bàn giao, khóa bản trình/duyệt và kiểm tra phiên bản để tránh ghi đè.
- Có thay đổi chưa lưu thì cần lưu báo giá trước. Chưa có loại khách trong danh mục thì hiển thị hướng dẫn người quản lý khai và phát hành.
- Tên loại khách đã chọn vẫn hiển thị trong phân tích giá khi số liệu hệ số được bảo vệ.

Kiểm thử: API tài khoản hạn chế, hệ số khóa/ẩn, dữ liệu giả mạo, phiên bản cũ, bản duyệt, lưu lại dữ liệu bảo vệ; trình duyệt lưu/tải lại, cảnh báo thay đổi chưa lưu, màn hình điện thoại và đường dẫn khai báo khác.
