# Danh sách báo giá — người phụ trách, tiến độ và cuộn trang

Ngày: 30/09/2026.

- Người kinh doanh phụ trách lấy từ người phụ trách khách hàng; dự phòng người chăm sóc/người gửi được phân công của bản chào đã duyệt. Không dùng người cập nhật gần nhất.
- Ngày hoàn thành lấy `request.quoteDeadline` đã khai. Ngày duyệt thực tế lấy thời điểm của phiên bản được duyệt và hiển thị bên dưới Đã duyệt; bản mở sửa không còn hiển thị ngày duyệt như trạng thái hiện tại.
- Trạng thái dòng: Chưa làm / Đang làm / Chờ duyệt / Đã duyệt / Đã hủy. Nhóm bản nháp đổi tên hiển thị thành Chưa duyệt; không thay đổi trạng thái nghiệp vụ lưu trong DB.
- Tình trạng xử lý thu gọn: phòng ban của người được phân công theo cơ cấu hiện tại; tên người bên dưới; ký hiệu xác nhận kèm màu, tooltip và nhãn cho trình đọc màn hình.
- Chưa gửi/Đã gửi dựa trên lịch sử xác nhận gửi. Số lần chăm sóc đếm bản ghi `care` qua các phiên bản; không tính gửi, đặt lịch, phân công hoặc phản hồi. Nút Theo dõi mở bảng chi tiết theo quyền sẵn có.
- Sửa khóa cuộn: Đơn hàng/Lệnh sản xuất đã thu nhỏ không khóa cuộn nền; cửa sổ đang hiện vẫn khóa đúng.
- Không bổ sung quyền hay trả về ghi chú chăm sóc/hồ sơ nhân sự trong API danh sách.

Kiểm tra đạt: `quote-list-details.test.cjs`, `quote-list-summary.test.cjs`, `quote-overview-browser.cjs`, `quote-list-browser.cjs`; build và cú pháp. Browser kiểm tra cả desktop/mobile và cuộn bằng wheel sau khi thu nhỏ hai cửa sổ.

`offer-followup.test.cjs` có ba lỗi tồn tại trước thay đổi (fixture tài khoản/phân công); đối chiếu bằng `server/app.cjs` tại HEAD trước bản sửa vẫn cùng ba lỗi. Log đối chiếu cục bộ: `artifacts/offer-followup-baseline.log`.
