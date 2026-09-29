# Khung làm việc và kích thước chat — 29/09/2026

Runtime: `55291ae`, triển khai tại https://truongphat-group.xyz, container healthy.

- Đơn hàng và Lệnh sản xuất mở rộng ngay từ lần mở đầu, giữ thanh tab phía dưới.
- Bấm vùng ngoài còn lại hoặc Thu nhỏ/Escape giữ nội dung; chọn tab để mở lại/chuyển bảng.
- Chat có tay kéo góc phải dưới và hỗ trợ phím mũi tên khi chọn tay kéo. Kích thước lưu riêng theo tài khoản trên trình duyệt, được giới hạn theo màn hình. Toàn màn hình rồi thu gọn khôi phục kích thước đã chọn. Điện thoại dùng toàn màn hình.
- Nút chat nổi hiển thị lại khi bảng làm việc đã thu nhỏ.
- Các biểu mẫu xác nhận/chỉnh sửa vẫn dùng hộp thoại riêng.

Kiểm thử: build; tests/chat-frame-browser.cjs; tests/console-workspace-browser.cjs; tests/console-workspace-server-browser.cjs đều đạt. Kiểm tra trình duyệt HTTPS thật ở 1440x1000 và 390x844: mở rộng mặc định, bấm ngoài thu nhỏ, chuyển tab, giữ bộ lọc và mã đơn chưa lưu, kéo khung chat, toàn màn hình/khôi phục. Chặn ghi nghiệp vụ trong kiểm tra trực tiếp; không gửi tin nhắn hay tạo đơn. Phiên xác minh tạm đã thu hồi. HTML production khớp bản build local.
