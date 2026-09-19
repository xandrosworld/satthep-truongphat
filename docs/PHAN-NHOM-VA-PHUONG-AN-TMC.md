# Phân nhóm và phương án TMC trong báo giá hỗn hợp

Tại Giá & hệ số → Nguyên công / bề mặt, bảng **Phân nhóm và phạm vi tính giá** cho biết nhóm sản phẩm, cây cấu kiện/mã vật tư, giá bóc tách và giá phương án đang xem.

1. Bấm nút **Nhóm** của sản phẩm để phân nhóm ngay trong báo giá. Sản phẩm chưa phân loại khi chọn Cơ khí hoặc nhóm ngoài TMC được đưa về nhánh bóc tách; không đoán nhóm theo tên.
2. Với sản phẩm TMC, bấm **Chọn phần TMC / bảng giá**, chọn sản phẩm/cấu kiện/mã vật tư và bảng tương ứng. Chọn cấp cha có nghĩa bao gồm toàn nhánh; không gán chồng cấp cha/con.
3. Tích **Phần ngoài các phạm vi TMC đã chọn giữ vật tư và nguyên công bóc tách** để làm sản phẩm hỗn hợp. Phần này giữ giá vật tư bóc tách và công chi tiết, không bị bắt gán bảng TMC.
4. PA TMC thay đúng tiền công đã gồm trong phạm vi, một lần; giữ các công còn lại. Sản phẩm ngoài TMC giữ nguyên kết quả PA bóc tách. Với các phần trong cùng một sản phẩm, chi phí được tổng hợp trước khi áp chuỗi hệ số của phương án sản phẩm.
5. Chuyển tab chỉ xem đối chiếu. Bấm **Chọn phương án này để chào giá** hoặc chọn ở Phân tích giá để đổi phương án chào. Thiếu bảng, kích thước hoặc phạm vi chồng lặp vẫn bị chặn; không lấy giá bóc tách thay một phần TMC khai sai.

Báo giá cũ giữ hành vi kiểm tra phạm vi đầy đủ cho đến khi người dùng mở, chọn và lưu cách xử lý phần còn lại. Không đổi dữ liệu khách hàng khi triển khai.

Kiểm thử độc lập: 2 phần, mỗi phần vật tư 2.000 và công 140; áp TMC cho một phần có hao hụt 10%, công gói 200 → vật tư 4.200, công 340. Sản phẩm cơ khí riêng giữ đúng giá bóc tách. Có kiểm chồng phạm vi, thiếu bảng, lưu/tải lại và chuyển tab không đổi phương án chào.

Chạy `node --test tests/tmc-mixed-scope.test.cjs` và `node tools/verify-tmc-mixed-scope.cjs`.
