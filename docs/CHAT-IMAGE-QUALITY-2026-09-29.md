# Sửa chất lượng ảnh chat — 29/09/2026

Nguyên nhân: ảnh trong khung cắt được thu nhỏ tối đa 1400 × 1000 để xem trước; ảnh gửi lại được xuất theo kích thước xem trước này, làm mất nét ảnh lớn.

Bản sửa runtime `e596665`:
- Cắt theo tọa độ điểm ảnh gốc, làm tròn và giữ đúng biên; PNG không mất dữ liệu. Ghi chú/khoanh vùng được quy đổi theo ảnh gốc.
- Không cắt/ghi chú: giữ nguyên dữ liệu ảnh nguồn, kể cả JPEG chọn từ máy; không chuyển sang PNG hoặc nén lại.
- Đọc file trước khi mở khung cắt, kiểm tra hội thoại/phiên còn đúng sau thao tác bất đồng bộ.
- Vượt 3 MB: báo rõ, giữ khung chỉnh sửa, không tự giảm độ phân giải. Có thể cắt vùng nhỏ hơn hoặc gửi nhiều ảnh.
- Ảnh cũ đã giảm độ phân giải không thể khôi phục chi tiết không còn; cần gửi lại bản gốc.

Kiểm thử đạt:
1. `chat-image-quality-browser.cjs`: ảnh 4K giữ nguyên; cắt sọc 1 pixel không mờ; JPEG 4031 × 2267 giữ nguyên byte; lưu/đọc ảnh qua API nhóm thực trên máy chủ cục bộ khớp byte; xem 100%; desktop/mobile; ảnh quá dung lượng không gửi.
2. `chat-browser.cjs`: hai tài khoản, ảnh/cắt/ghi chú, sticker, gửi lại chống trùng, hội thoại/nhóm, tải lại, đăng xuất.
3. `chat-interactions-browser.cjs`: cảm xúc/thu hồi/nhắc tên, phóng to/kéo/chụm ảnh trên điện thoại.
4. Build và kiểm tra whitespace đạt.

Đã sao lưu và triển khai máy chủ thật; container healthy, HTTPS health thành công, HTML khớp build. `chat-image-quality-browser.cjs --live` đạt với mã tải từ web thật và hội thoại giả lập chỉ trong bộ nhớ trình duyệt; chặn ghi API, không gửi tin vào nhóm khách. Luồng lưu và tải ảnh từ máy chủ đã được kiểm tra cục bộ như trên.

Hai fixture chat cũ được chuyển sang helper tạo tài khoản từ hồ sơ nhân sự được duyệt, không thay đổi quyền runtime.
