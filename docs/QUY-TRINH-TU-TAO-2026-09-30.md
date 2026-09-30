# Quy trình tự tạo — 30/09/2026

Admin vào Quy trình & phân luồng → Bảng tổng hợp quy trình → Thêm quy trình.
Tự đặt tên, thêm/bỏ/di chuyển bước, chọn đơn vị hoặc Admin, khai nội dung xác nhận. Có thể lưu nháp khi chưa bố trí đơn vị. Tối đa 30 bước.

Bước phòng ban có thể ghép song song với bước trước; nhóm chỉ chuyển tiếp khi toàn bộ đã xác nhận. Bước Admin giữ riêng. Nhân sự phải có quyền Xử lý quy trình và quyền xem nghiệp vụ được chọn. Trưởng phòng xử lý hoặc giao nhân viên; nhân viên gửi trưởng phòng rà soát. Không tự cấp quyền khi lưu quy trình.

Sau khi bật áp dụng, nút Tạo công việc theo quy trình xuất hiện cho Admin hoặc người có quyền Xem + Trình duyệt quy trình. Khai tên/mã tham chiếu và nội dung để chạy công việc độc lập. Các quy trình tự tạo không tự liên kết hoặc thay thế luồng của báo giá/đơn hàng/chứng từ. Luồng nghiệp vụ có sẵn vẫn cấu hình riêng.

Công việc lưu bản chụp quy trình. Sửa tên/bước hoặc ngừng áp dụng chỉ ảnh hưởng công việc mới. Người tạo thấy công việc của mình; bộ phận xử lý thấy công việc trong phạm vi. Yêu cầu tạo lặp cùng mã không tạo trùng. Kết quả, trả lại và bổ sung được ghi lịch sử.

Kiểm thử: process-custom.test.cjs, process-routing.test.cjs, process-routing-lifecycle.test.cjs; process-custom-browser.cjs và process-routing-browser.cjs (Edge, desktop/mobile). Bao gồm chặn người không có quyền cấu hình/tạo/xác nhận, giữ phiên bản, song song, Admin xác nhận và ngừng áp dụng.
