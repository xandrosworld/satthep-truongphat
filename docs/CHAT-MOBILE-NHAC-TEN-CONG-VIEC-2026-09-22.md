# Chat: khung điện thoại, nhắc tên, đã xem và tạo việc

Phạm vi điện thoại chỉ màn hình chat: một cột, chuyển danh sách/hội thoại, chiều cao viewport và bàn phím, ảnh/sticker/form không tràn khung. Không triển khai responsive toàn ERP.

Gõ @ để chọn thành viên đang hoạt động trong phòng. Người được nhắc thấy nhãn và nội dung thông báo desktop riêng khi đã bật quyền. Máy chủ chặn nhắc người ngoài phòng.

Hiện người đã xem theo mốc đọc đã lưu. Chỉ ghi nhận đọc khi cửa sổ có tiêu điểm và đã cuộn đến cuối tin đang tải; không coi đã xem là nhận công việc.

Tạo công việc từ tin nhắn: sửa nội dung điền sẵn, chọn người trong hội thoại, hạn tùy chọn, giữ liên kết tin gốc. Danh sách Công việc nằm trong chat. Người phụ trách nhận → làm → báo xong; người tạo hoặc admin xác nhận hoàn thành. Một tin/người tạo chỉ sinh một công việc khi gửi lại. Đây là luồng giao việc cơ bản từ chat, không phải toàn bộ module 26.01.

Lưu SQLite và bổ sung chatTasks/chatMentions trong backup. Người ngoài phòng không truy cập; số phiên bản chặn cập nhật cũ. Giữ quy định các module GĐ2 khác admin-only, chỉ bổ sung thao tác gắn với chat.

Kiểm thử API chat và công việc; browser hai tài khoản, nhắc tên, đã xem, giao/nhận/xác nhận, nguồn tin, thông báo, ảnh/sticker/gửi lại; viewport 320/360/390/430/1366. Chưa kiểm tra thiết bị điện thoại vật lý. Mật khẩu vận hành cũ hiện không đăng nhập được; xác minh triển khai bằng hash public build, không thay đổi tài khoản.
