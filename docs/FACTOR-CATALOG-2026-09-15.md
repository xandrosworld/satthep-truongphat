# Hệ số tính toán trong Danh mục quy ước

Nguồn: ảnh khách yêu cầu thay hai mục Nhóm khách hàng / Độ phức tạp bằng Hệ số tính toán, bên trong có quy ước hệ số khách hàng, độ phức tạp, hệ số khối lượng và các hệ số khác. Tin kèm ảnh: nội dung thống kê, quy ước đưa về Danh mục quy ước.

- Thanh chính chỉ có Hệ số tính toán; bên trong chia Hệ số khách hàng, Độ phức tạp, Hệ số khối lượng, Hệ số khác. Các đường mở danh mục khách hàng/độ phức tạp trước đây dẫn vào đúng nhóm con.
- Giữ dữ liệu khách hàng và độ phức tạp hiện có. Các bảng hệ số nguyên công được đọc trực tiếp từ danh mục hiện hành, cùng một nguồn cho cả phần đơn giá và phần quy ước.
- Khối lượng bao gồm các đại lượng đã hỗ trợ: tổng kg, kg/đơn vị, số lượng tại các cấp, lượng công việc. Mỗi dòng ghi rõ đại lượng tra và nguyên công áp dụng. Kích thước, diện tích, vật liệu/mác và các bảng khác xuất hiện ở Hệ số khác.
- Khai/sửa hệ số trong bảng quy ước: chọn nguyên công, cơ sở tra, khoảng số hoặc phân loại, phần trăm hoặc hệ số nhân, cách xử lý mốc, trạng thái áp dụng. Có nhập giá trị thử và kiểm kết quả; sai bậc, giá trị thiếu hoặc hệ số nhân không dương bị từ chối.
- Đơn giá đầu vào chỉ hiển thị các hệ số dùng chung để tham chiếu. Lưu giá tại đó giữ nguyên bảng hệ số. Bản điều chỉnh riêng của từng báo giá vẫn nằm trong báo giá và giữ cơ chế bản chụp hiện có.
- Áp bảng độ phức tạp vào danh mục nguyên công giữ nguyên báo giá đang mở. Sửa/xóa hệ số danh mục chỉ ảnh hưởng lần lấy bảng mới; không tự sửa các đơn cũ.
- Excel danh mục bổ sung bảng Hệ số tính toán, đầy đủ nguyên công, đại lượng, cách nhập và các bậc. Khách hàng/độ phức tạp giữ các sheet dữ liệu hiện có.

Ca số độc lập: đóng gói giá cơ sở 25.000, đến 10 kg ×1,2 = 30.000; trên 10 kg ×1,1 = 27.500. Trong trình duyệt, báo giá mới kế thừa và áp hệ số thật vào công việc; xóa bảng dùng chung vẫn giữ giá của đơn đã tạo. Đây là hệ số điều chỉnh giá theo khối lượng công việc, không phải phép thay đổi khối lượng hình học của phôi.

Kiểm: 295 ca logic, 1 ca máy chủ cục bộ, 22 nhóm trình duyệt cục bộ (6 hệ số, 9 khai báo/đơn giá, 7 danh mục/công thức). Bằng chứng tại artifacts/customer-review/factor-catalog-2026-09-15/. Đối chiếu đầy đủ HTML triển khai và thử lại luồng hệ số trên web trong trình duyệt riêng. Các tỷ lệ thử là dữ liệu kiểm thử, không được đưa vào danh mục mặc định của khách. Không xác nhận nghiệm thu thay khách.
