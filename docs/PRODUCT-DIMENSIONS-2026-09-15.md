# Kích thước sản phẩm và liên kết vật tư

- Hiện L/W/H và Dày T ở phần đầu tất cả sản phẩm, kể cả sản phẩm mới chưa có params. Ô chưa khai để trống; không suy đoán từ vật tư hay tự gán số mẫu. Thu gọn cấu thành vẫn thấy kích thước.
- Nhập kích thước chung lưu vào sản phẩm, hỗ trợ báo giá cũ chưa có params. Nút Liên kết với vật tư mở cấu hình ngay từ phần đầu sản phẩm.
- Hộp công thức có các nút PRODUCT_L/W/H/T kèm tên và giá trị nguồn; bấm chèn biến, khai biểu thức và xem kết quả trước khi lưu.
- Dòng nhập riêng không tự liên kết. Dòng theo công thức cập nhật khi đổi nguồn; quy cách cố định của mã giữ nguyên. Dữ liệu mẫu và báo giá khác không đổi.
- Giữ kiểm tra vòng lặp, sai đơn vị, chia cho 0, số âm và chế độ nhập tay/cố định.

Kiểm chứng: 314 kiểm thử logic và 20 nhóm kiểm tra trình duyệt (luồng mới, công thức/công đoạn, Dày và mẫu). Chứng cứ build và live tại artifacts/customer-review/product-dimensions-2026-09-15/. Chưa đánh dấu khách nghiệm thu.
