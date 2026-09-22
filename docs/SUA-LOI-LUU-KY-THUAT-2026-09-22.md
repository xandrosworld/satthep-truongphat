# Lưu kỹ thuật: thống nhất danh mục khi đóng gói

Ảnh khách báo lỗi "Dữ liệu kỹ thuật chứa trường giá hoặc trường không được phép". Bản máy chủ của báo giá được kiểm tra chỉ đọc, chưa có cấu thành đang nhập ở máy khách. Không xác nhận được toàn bộ dữ liệu chưa lưu trên máy đó.

Tái hiện cùng lỗi khi danh mục mức độ công đoạn tại trình duyệt khác danh mục đã tải cùng báo giá. technicalQuoteDocument trước đây ghép quote đã chiếu theo danh mục đang làm với phần danh mục cũ, khiến kiểm tra chiếu lại ở máy chủ không đồng nhất.

Sửa: ghép dữ liệu trước rồi chiếu một lần theo danh mục đã tải cùng báo giá. Không bỏ kiểm tra máy chủ. Giá giả mạo vẫn bị từ chối. Lỗi máy chủ bổ sung đường dẫn trường khác biệt, không trả giá trị.

Kiểm thử: 7 ca kỹ thuật và bảo vệ giá; trình duyệt sửa số lượng sau khi đổi danh mục mức độ, lưu thành công. Chưa khẳng định máy khách gặp duy nhất nguyên nhân này.

Máy đang có thay đổi chưa lưu cần Sao lưu dữ liệu trước khi tải lại trang để nhận bản giao diện mới.
