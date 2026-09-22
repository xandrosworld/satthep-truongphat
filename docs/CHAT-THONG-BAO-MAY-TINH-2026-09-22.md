# Bong bóng chat và thông báo máy tính

- Bong bóng cố định góc phải dưới, số tin chưa đọc, mở chat từ mọi màn hình làm việc.
- Tin mới có khung báo trong web; bấm mở đúng hội thoại.
- Trong chat: Bật thông báo máy tính → Cho phép. Có thể tắt riêng trên mỗi tài khoản/máy.
- Kiểm tra hội thoại tiếp tục khi trang chạy nền; không đánh dấu đã đọc khi cửa sổ mất tập trung.
- Chỉ thông báo tin mới từ người khác, không phát lại lịch sử khi tải trang. Desktop chỉ hiện tên hội thoại và lời báo chung, không đưa nội dung tin lên màn hình khóa.
- Đăng xuất đóng thông báo và xóa dữ liệu hiển thị. Bộ nhớ cục bộ chỉ lưu lựa chọn bật/tắt và số thứ tự chống báo lặp, không lưu nội dung chat.
- Cần giữ trang web mở và máy hoạt động. Chưa triển khai Web Push khi đã đóng trang; trình duyệt tiết kiệm bộ nhớ hoặc Windows Không làm phiền có thể trì hoãn/ẩn thông báo.

Kiểm thử: API chat; trình duyệt hai tài khoản gửi tin/ảnh/sticker, kiểm tra bong bóng, quyền theo thao tác bấm, nhận khi chạy nền, không báo lặp, mở đúng phòng, tắt/từ chối quyền, dọn dữ liệu đăng xuất. Notification được mô phỏng trong kiểm thử tự động; không xác nhận thông báo Windows thực tế trên máy khách.

Tham chiếu API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
