# Sửa danh sách hệ số và chọn mức độ phức tạp

- Danh sách hệ số không còn lọc ngầm theo loại vừa lưu. Bộ lọc nhóm sản phẩm và tìm kiếm vẫn có hiệu lực.
- Ẩn ID nội bộ trong danh sách, ma trận và biểu mẫu khai hệ số. ID vẫn giữ trong dữ liệu và Excel để liên kết.
- Biểu mẫu hệ số cho chọn nhiều công việc áp dụng; kiểm tra phạm vi nhóm trước khi lưu. Bỏ chọn một công việc không xóa các hệ số khác.
- Trong công việc của báo giá, chọn **Chọn mức đã khai hoặc nhập hệ số riêng**, rồi chọn mức từ bảng đã gắn với nguyên công và đúng nhóm sản phẩm. Hiển thị rõ nguồn **Trong báo giá** hoặc **Danh mục hiện tại**.
- Mức được chọn lưu tên và hệ số cho riêng công việc, thay phần phức tạp kế thừa, chỉ nhân một lần. Đổi danh mục không tự đổi báo giá đã lưu.
- Chế độ theo bảng yếu tố vẫn yêu cầu cách tính có hệ số. Các giá trị phân loại có danh sách chọn.
- Lỗi xác nhận lượng hoàn thiện vẫn phải xử lý riêng bằng lượng thực hiện đúng hoặc xác nhận lượng cấu thành.

## Kiểm tra

`node --test tests/factor-matrix.test.cjs`

`node tools/verify-factor-feedback.cjs`

Kiểm tra thêm/sửa/gắn nhiều công việc, bảo toàn hệ số cũ và bản báo giá, không ghi dở khi liên kết sai; thử hệ số 1,2 chỉ nhân một lần, lọc đúng nhóm, lưu và tải lại giao diện.
