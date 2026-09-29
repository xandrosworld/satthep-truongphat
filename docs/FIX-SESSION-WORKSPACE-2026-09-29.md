# Giữ màn hình đang làm khi phiên hết hiệu lực

Runtime 56b76e2, triển khai 29/09/2026. Sao lưu trước triển khai; xác minh 101 SHA runtime, health và HTML công khai đạt.

Nguyên nhân tái hiện: team-access-ui nhận 401 từ yêu cầu bất kỳ (kể cả thông báo nền) rồi gọi teamSession với user=null; quá trình này render màn hình đăng nhập và thay thế màn hình làm việc. Phiên mặc định có thời hạn 8 giờ; cập nhật quyền/cơ cấu cũng có thể thu hồi phiên. Chưa xác định chính xác sự kiện máy chủ nào đã kết thúc phiên Phú tại thời điểm khách báo.

Sửa: kiểm tra phiên hiện tại trước khi coi phản hồi 401 cũ là hết phiên. Khi hết thật, giữ nguyên user/baseline/generation của bản nháp trong thẻ và mở dialog xác thực riêng, không thay DOM của form đang nhập. Mọi truy cập lưu vẫn qua quyền máy chủ. Đăng nhập chỉ chấp nhận đúng tài khoản; không tự gửi lại thay đổi sau đăng nhập. Nếu quyền thay đổi, giao diện bản nháp giữ cách hiển thị cũ cho tới khi lưu/mở lại, máy chủ áp dụng quyền mới ngay. Không sửa cơ chế thu hồi phiên khi thay quyền, mật khẩu, khóa/xóa tài khoản. Chỉ sửa họ tên không còn thu hồi phiên.

Kiểm tra: trình duyệt mất mạng, 401 trả về chậm với phiên còn hợp lệ, ba yêu cầu hết phiên đồng thời, mật khẩu sai/đúng, giữ ô chưa Áp dụng trong modal, giữ báo giá và tab, lưu/mở lại kỹ thuật, quyền bị thu hồi vẫn chặn lưu. 9 bài API phân quyền/tài khoản/cơ cấu đạt. Luồng Thảo xem/ẩn hệ số, cấp quyền, đăng nhập lại, lưu/mở lại đạt. Sửa test chờ hộp đăng nhập đóng trước khi nhập hệ số (Playwright fill có thể nhập vào ô nền trong lúc modal còn mở); chạy lại bản runtime phát hành đạt.

Không thay dữ liệu khách để thử. Bản nháp chỉ được giữ trong thẻ đang mở, không cam kết giữ sau đóng/tải lại thẻ. Máy khách cần tải bản mới sau khi đã lưu công việc hiện tại.
