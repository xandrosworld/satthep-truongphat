# Chọn nguồn phân quyền tài khoản

Runtime 5cdf948.

Quản trị mở Tài khoản và quyền dữ liệu, chọn nút Theo vị trí/Trực tiếp · Đổi, chọn nguồn rồi Lưu nguồn phân quyền.

- Theo vị trí áp dụng bộ quyền của vị trí đang hoạt động; từ chối khi chưa có bộ quyền/vị trí phù hợp.
- Trực tiếp giữ nguyên quyền đang có, ngừng tự cập nhật từ bộ quyền. Giữ vị trí nhân sự; lưu cơ cấu sau đó không tự đổi nguồn trở lại.
- Giữ kiểm tra phiên bản, quyền quản trị, chống tự thu hồi quản trị, lịch sử audit. Ngừng nhân sự vẫn khóa tài khoản dù dùng quyền trực tiếp.
- Không tự chuyển nguồn hay cấp thêm quyền cho tài khoản production khi triển khai.

Kiểm thử: 9/9 API (organization, permission-source, governance); browser đổi hai chiều từ danh sách tài khoản đạt.
