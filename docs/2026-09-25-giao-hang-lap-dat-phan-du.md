# Giao hàng, lắp đặt và khối lượng phần dư — 25/09/2026

Theo phản hồi được anh Hợp xác nhận:

- Giá & hệ số → Vận chuyển/lắp đặt có hai mục độc lập **Chi phí vận chuyển giao hàng** và **Chi phí lắp đặt**. Mỗi mục chọn phương thức đúng loại, có lượng/đơn vị và phân bổ riêng. Sửa giá lắp đặt không làm đổi chi phí giao hàng; khoản chung chỉ được tính một lần.
- Khi chọn phần dư tận dụng, khối lượng phân bổ theo khổ cho báo giá = khối lượng mua cả khổ − khối lượng phần dư đã chọn. Vẫn tính phôi và hao hụt còn lại. Tính trực tiếp theo hình học, kể cả khi đơn giá vật tư bằng 0; phân bổ theo các dòng trong nhóm một lần.
- Dòng đã khai dự tính hao hụt riêng giữ khối lượng theo dự tính đó, không trừ thêm phần dư lần thứ hai. Lựa chọn giá tính cả/loại phần dư đã lưu vẫn được giữ; bản sửa không tự đổi phương án giá hoặc sửa chứng từ đã duyệt.
- Bảng phân tích và Excel đầu vào dùng **Khối lượng vật tư tính cho báo giá**; bảng diễn giải có khối lượng mua cả khổ, phần tận dụng và khối lượng sau trừ để đối chiếu. Số tấm/thanh mua vật lý, tồn kho và kg phôi thực không giảm bởi việc chọn giữ phần dư.

Kiểm chứng: 726/726 bài test đạt, gồm ba bài mới về phần dư giá 0, không trừ hai lần vào dự tính và hai loại phí độc lập. Browser hiện hành kiểm tra chọn đơn giá/phạm vi, lưu/F5, phân bổ, màn hình 390 px, công thức khối lượng và đường dẫn khai báo. Bài `remnants-browser.cjs` cũ dùng đường dẫn giao diện trước khi tách đề xuất tổ hợp; kiểm tra hiện hành nằm ở `delivery-remnant-feedback-browser.cjs`.
