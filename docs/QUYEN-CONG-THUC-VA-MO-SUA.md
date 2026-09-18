# Quyền công thức và mở sửa báo giá

Tại **Tài khoản → Phân quyền**, quản trị cấp riêng:

- **Dùng công thức để tính:** chọn dạng cấu kiện, nhập thông số và tính kết quả.
- **Xem biểu thức công thức:** đọc nội dung biểu thức. Người chỉ có quyền dùng nhận kết quả tính từ máy chủ qua tham chiếu riêng; cần kết nối máy chủ.
- **Sửa công thức chưa khóa:** thay biểu thức và khai báo công thức trong phần được phép sửa. Giao diện biên tập cần cả quyền xem.
- **Khóa / mở sửa công thức đã chốt:** khóa, mở khóa hoặc chỉnh công thức đang khóa. Chỉnh sửa vẫn cần quyền sửa công thức và quyền sửa phần tương ứng.
- **Mở sửa báo giá đã trình / duyệt:** tạo phiên bản nháp với lý do. Bản đã duyệt còn trong lịch sử; bản sửa phải trình duyệt lại.

Tại **Danh mục quy ước → Khóa công thức**, chọn công thức đã lưu lên danh mục máy chủ, bấm **Khóa công thức** hoặc **Mở khóa**, nhập lý do. Khóa không chặn việc tính theo công thức. Kiểm tra quyền diễn ra ở máy chủ, kể cả khi công thức nằm trong bản sao của báo giá hoặc thư viện mẫu.

Quyền xem giá, sửa hệ số, duyệt giá và phạm vi từng phần vẫn được cấp riêng. Thay quyền sẽ hết hiệu lực các phiên đăng nhập cũ; người được phân quyền cần đăng nhập lại.

Khi nâng cấp, quyền dùng/xem và quyền sửa công thức cũ được giữ theo phạm vi hiện có. Quản trị luôn có toàn quyền; tài khoản khác phải được cấp riêng quyền khóa/mở sửa công thức và mở sửa báo giá đã hoàn thiện.

Kiểm chứng tự động: `tests/formula-access.test.cjs` kiểm API, khóa ở danh mục/báo giá/thư viện, cấp và thu hồi quyền, bảo vệ biểu thức, phiên bản và phạm vi chỉnh sửa. `tools/verify-formula-access.cjs` kiểm giao diện trên máy chủ thử; tùy chọn `--live` chỉ đọc bản triển khai và mở form, không thay dữ liệu kinh doanh.
