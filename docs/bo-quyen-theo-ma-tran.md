# Bộ quyền theo ma trận

1. Mở **Vai trò & phân quyền → Thêm bộ quyền**, đặt tên tùy ý (ví dụ Kế toán trưởng).
2. Chọn mức quyền cho từng chức năng trên ma trận. Bộ quyền mới bắt đầu với Không được xem và không bật quyền đặc biệt.
3. Bật riêng quyền xem chi phí, duyệt giá, sửa hệ số hoặc công thức khi cần. Những chức năng liên quan đến giá yêu cầu quyền xem chi phí; phần mềm báo rõ nếu khai không tương thích.
4. Lưu, mở **Cơ cấu tổ chức → Vị trí làm việc** và chọn bộ quyền cho vị trí.
5. Bố trí nhân sự vào một hoặc nhiều vị trí. Quyền thực tế là mức cao nhất được cấp bởi các vị trí đang hoạt động. Không được xem là không cấp quyền, không phải phủ định quyền từ vị trí khác.

Sửa bộ quyền hoặc bỏ vị trí sẽ cập nhật quyền tài khoản liên quan và kết thúc phiên cần đăng nhập lại. Bộ quyền cũ giữ nguyên mô hình nền để không tự đổi quyền đang vận hành. Bộ quyền mới không tự cấp quyền quản trị dù chọn toàn bộ ô trên ma trận.

Ma trận này áp dụng các chức năng báo giá và danh mục hiện được hệ thống kiểm soát. Quyền khai báo hồ sơ nhân sự vẫn cấp tại Nhân sự → Phân công người khai báo; không coi ma trận này là quyền tùy biến cho mọi phân hệ. Hạn mức duyệt nhiều cấp, ủy quyền có thời hạn và quyền riêng theo dự án không thuộc thay đổi này.

Kiểm tra: `tests/named-permission-matrix.test.cjs` và `tests/named-permission-matrix-browser.cjs`, cùng các bài kiểm tra quyền theo vị trí và nhiều bộ quyền.
