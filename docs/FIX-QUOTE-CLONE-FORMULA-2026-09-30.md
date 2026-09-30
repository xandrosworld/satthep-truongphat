# Lưu báo giá sau nhân bản

Release máy chủ: `c228838`, ngày 30/09/2026.

Người dùng xác nhận lỗi xuất hiện sau nhân bản. Kiểm tra quyền trước đây chỉ tìm dòng gốc bằng ID, nên bản sao nhận ID mới có thể bị coi là khai công thức mới khi công thức đã lưu khác danh mục hiện hành. Bản sửa đối chiếu toàn bộ bộ công thức cùng định danh vật tư/quy tắc với dòng đã lưu, chỉ cho phép kế thừa đối với ID mới. Dòng đã tồn tại vẫn đối chiếu chính nó; không cho ghép công thức từ nhiều dòng, không cấp thêm quyền sửa. Cổng duyệt quy cách kỹ thuật sử dụng cùng đối chiếu này. So sánh khai báo không còn phụ thuộc thứ tự khóa JSON.

23 kiểm tra đạt: formula-access, formula-lock-identity, technical-payload. Có kiểm tra API tài khoản kỹ thuật bị ẩn công thức: nhân bản, sửa kích thước, lưu, đọc lại; sửa công thức trái quyền trả 403 và không tăng phiên bản. Ca hồi quy nhân bản thất bại đúng thông báo trong ảnh trên mã trước sửa.

Đã sao lưu, triển khai và kiểm tra container healthy, healthz ok. Kiểm tra mã đang triển khai bằng bản sao riêng trong bộ nhớ của BG-20260923-003 (phiên bản 26 tại thời điểm kiểm tra): bản sao hiện tại và công thức lịch sử được chấp nhận, công thức giả bị từ chối. Không ghi vào báo giá thật. Phiên kiểm tra đã thu hồi. Giao diện không đổi; tab đang nhập có thể thử lưu lại mà không tải lại trang.

Kiểm tra mở rộng còn các lỗi có sẵn, đã đối chiếu trên mã trước bản sửa: catalog-approval và technical-access có fixture tài khoản/quyền không còn phù hợp; formula-sync-server thiếu lý do điều chỉnh giá đã xác nhận. Không tính các bộ này là đạt và không thay kiểm tra nghiệp vụ để bỏ qua lỗi.
