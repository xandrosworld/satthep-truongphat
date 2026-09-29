# Chọn phương thức vận chuyển — 29/09/2026

Runtime 69a2d81.

- Nút Chọn cách tính/Thêm tuyến mở bảng chọn phương thức trước: đơn giá đã khai đúng loại phí và 15 mẫu công thức dùng riêng trong báo giá.
- Chọn rồi Tiếp tục khai báo mới mở form thông số. Mẫu không tự lấy giá minh họa; đơn giá thực tế để trống cho người khai nhập. Đơn giá danh mục vẫn được lấy theo cặp giá/đơn vị và giữ snapshot hiện có.
- Tạo lô nhiều vật tư hoặc tuyến nhiều nguyên công giữ lựa chọn qua bước chọn phương thức. Sửa khoản chi đang có tiếp tục dùng form riêng, không tạo khoản mới.
- Không thay đổi danh mục, khoản chi hay phân quyền của dữ liệu thật khi triển khai.

Kiểm thử: logistics-method-picker-browser đạt (15 mẫu, chọn chưa ghi, giá thực tế, phạm vi, 2 chuyến × 200.000 = 400.000, F5, giá danh mục); quote-logistics-browser đạt 7 tình huống (vận chuyển, lắp đặt, mức tối thiểu/phân bổ, sửa/F5, màn hình hẹp, hủy, tuyến chung không tính lặp); logistics-lots.test đạt 2/2.
