# Lưu đơn giá vận chuyển khi đang xem phiên bản báo giá

- Tách quyền danh mục khỏi cờ chỉ xem phiên bản báo giá. Người có quyền danh mục vẫn sửa bảng dùng chung; dữ liệu báo giá được giữ nguyên, không mở khóa báo giá.
- Chặn ngay khi mở form nếu thiếu quyền thêm/sửa bảng giá vận chuyển, lắp đặt. Không tự cấp thêm quyền tài khoản.
- Lưu phương thức chỉ thay `expenseRates`, không ghi lại bảng nguyên công do chuẩn hóa mặc định và gây lỗi quyền `catalogOperations`.
- Thông báo lưu phân biệt bản đang soạn với lưu máy chủ/Gửi Admin duyệt; giữ quy trình duyệt danh mục hiện có.
- Trình duyệt kiểm tra tài khoản lập giá được cấp riêng quyền logistics: mở phiên bản cũ → thêm phương thức 450 đ/kg, tối thiểu 450.000 đ → gửi Admin duyệt → phát hành → sửa phương thức; báo giá và cờ khóa giữ nguyên. Thiếu quyền bị chặn ngay. Các kiểm tra duyệt danh mục và xung đột hai người sửa cũng đạt.
- Hồi quy 737/737 đạt. Phát hành `5768ce1`, có sao lưu trước triển khai; HTTPS kiểm tra mở phiên bản cũ → danh mục vận chuyển → form trên desktop/mobile đạt, không ghi nghiệp vụ khách hàng. Phiên tạm đã thu hồi; healthcheck đạt.
