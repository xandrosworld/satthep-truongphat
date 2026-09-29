# Phạm vi khóa hệ số chi phí — 29/09/2026

Yêu cầu khách: khóa hệ số tác động và hệ số đơn giá; hệ số chi phí chào giá vẫn sửa được bởi bộ phận được cấp quyền.

Đã hoàn thiện phần độc lập, runtime 4ca3aa5:
- Hệ số chung, quản lý, lợi nhuận, xử lý, đơn hàng, khách hàng, dự phòng, đặc thù sản xuất và các yếu tố chi phí bổ sung không bị khóa chung với bảng nguyên công khi người dùng có quyền sửa hệ số.
- Giữ quyền sửa danh mục, sửa báo giá, khóa báo giá đã duyệt và quyền công thức hiện có. Không tự cấp thêm quyền tài khoản. Thêm yếu tố mới vẫn theo quyền Admin hiện có; người cập nhật được sửa giá trị đã khai.
- Form bước 6 hiển thị được các hệ số chi phí và hệ số sản xuất theo quyền; không phải mở khóa bảng nguyên công để sửa chi phí.
- Các bảng hệ số nguyên công, phạm vi áp dụng và hao hụt TMC vẫn được bảo vệ.

Chưa thực hiện: chia bảng nguyên công hiện có thành hai khóa độc lập tác động/đơn giá. Đã hỏi người dùng về cách phân loại (ví dụ hệ số phức tạp, chiều dày); không tự suy diễn từ tên vì cùng dữ liệu đang dùng chung trong bảng.

Kiểm thử: 13 ca formula-access API đạt, gồm lưu/đọc hệ số chi phí, bảo vệ bảng nguyên công, quyền bị thu hồi, tham chiếu cũ và kỹ thuật; cost-factor-lock-browser đạt sửa quản lý tại bước 6, sửa yếu tố SX tại hộp hệ số, lưu và tải lại trong khi khóa vẫn bật. Không sửa hệ số thực của khách để thử.
