# Thông báo thiết bị

Trong Chat hoặc bảng Thông báo công việc, bấm **Bật thông báo thiết bị** và cho phép trình duyệt gửi thông báo. Đăng ký riêng trên từng thiết bị. Thông báo nền dùng âm mặc định của hệ điều hành, tuân theo chế độ im lặng/Không làm phiền và quyền thông báo.

Trên iPhone/iPad (iOS/iPadOS 16.4 trở lên): mở trang bằng Safari, chọn Chia sẻ → Thêm vào Màn hình chính. Mở ứng dụng từ biểu tượng vừa thêm, đăng nhập rồi bật thông báo. Cần kiểm tra nhận tin khi khóa màn hình trên điện thoại thực tế; kiểm thử máy tính không thay thế bước này.

Thông báo chỉ hiện nội dung chung, không đưa tin nhắn hay giá nội bộ ra màn hình khóa. Bấm thông báo để mở chat hoặc thông báo công việc. Nếu phiên đăng nhập hết hạn, đăng nhập lại để xem nội dung.

Máy chủ giữ đăng ký sau khi đóng trình duyệt/hết hạn phiên; đăng xuất, tắt thông báo, khóa tài khoản hoặc đổi quyền/mật khẩu sẽ ngắt đăng ký tương ứng. Thiết bị hết hiệu lực bị xóa khi nhà cung cấp trả 404/410. Lỗi tạm thời được thử lại với khoảng nghỉ tăng dần; thông báo không phải cam kết giao ngay khi điện thoại mất mạng hoặc hệ điều hành hạn chế nền.

Khóa VAPID tạo một lần và lưu trong SQLite (`push_keys`), được giữ khi khởi động lại và nằm trong bản sao lưu cơ sở dữ liệu đầy đủ. Không xuất khóa riêng ra API hoặc kho mã. Khi phục hồi phải giữ nguyên khóa để các đăng ký hiện có tiếp tục dùng được. Service worker không lưu đệm trang đăng nhập hoặc dữ liệu báo giá.

Hàng đợi được ghi cùng giao dịch tạo tin nhắn/thông báo bàn giao; không quét gửi lại lịch sử cũ khi triển khai. Trước mỗi lần gửi, máy chủ kiểm tra tài khoản, thành viên chat, quyền nhận thông báo và trạng thái đã đọc. Đây là thông báo chat và chuyển bước/giao việc báo giá; không phải chức năng gọi điện.
