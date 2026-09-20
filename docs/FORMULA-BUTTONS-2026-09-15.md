# Bộ công cụ công thức dùng chung

Cập nhật ngày 20/09/2026 theo phản hồi khách: thay các bộ nút lặp ở từng công thức bằng một bộ dùng chung.

- Chọn ô công thức hoặc chọn ô đích trong bộ công cụ. Nút “Bộ công thức” ở mỗi dòng mở cùng một bộ nút; nút trở về đưa con trỏ lại ô đang chỉnh.
- Giữ vùng chọn/con trỏ riêng của từng ô. Nút biến thay phần đang chọn; nút hàm bọc đoạn chọn. Không chèn vào ô khóa hoặc chiều rộng ẩn của thanh.
- Danh sách biến cập nhật theo thông số đầu vào và kích thước khai triển đã khai. Tấm tròn khai D0 chỉ gợi ý D0, không tự thêm L0/W0. Đổi tên, thêm hoặc bỏ kích thước sẽ cập nhật bộ nút. Không gợi ý chính đầu ra trong công thức của nó.
- Hai định mức KL_DV/DT_DV dùng ở công thức phôi. Quy ước cũ chưa khai đầu ra riêng vẫn dùng L0/W0 như trước.
- Giữ nguyên bộ tính, kiểm đơn vị, kiểm tham chiếu vòng và phiên bản của báo giá đã lập.

Kiểm thử: tests/formula-buttons-browser.cjs và tests/shared-formula-browser.cjs; bằng chứng tại artifacts/customer-review/shared-formula/.
