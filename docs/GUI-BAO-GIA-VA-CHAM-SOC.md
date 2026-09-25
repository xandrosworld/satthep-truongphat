# Gửi báo giá và chăm sóc sau gửi

Theo trao đổi ngày 25/09/2026: trạng thái ghi nhận từ thao tác xác nhận trong hệ thống, không chọn trạng thái trực tiếp.

1. Duyệt báo giá tạo việc gửi cho đúng phiên bản. Nếu đã có người gửi hợp lệ ở bản trước hoặc người phụ trách khách hàng, hệ thống giao và thông báo cho người đó. Nếu chưa có, thông báo cho quản trị/người có quyền giao việc để phân công.
2. Vào **Gửi & chăm sóc báo giá** hoặc mở thông báo. Người được giao gửi trực tiếp xác nhận người nhận, kênh gửi, nội dung/căn cứ gửi, người chăm sóc và ngày nhắc nếu có.
3. Chỉ sau xác nhận đã gửi mới mở ghi nhận phản hồi, vướng mắc, xử lý vướng mắc và chăm sóc. Người chăm sóc có thể khác người gửi.
4. Người chăm sóc hoặc người có quyền giao việc ghi lịch sử, hẹn ngày tiếp theo, kết thúc hoặc mở lại việc chăm sóc. Phải xử lý hết vướng mắc trước khi kết thúc. Gửi lại sẽ mở lại chăm sóc.
5. Bản duyệt mới cần xác nhận gửi riêng. Lịch sử và việc chăm sóc bản cũ được giữ theo phiên bản. Thao tác này không sửa giá hay chứng từ đã duyệt.

## Phân quyền và dữ liệu cũ

- Người gửi/chăm sóc cần quyền xem, sửa báo giá và phạm vi giao dịch thương mại. Giao việc cần thêm quyền phân công báo giá; quản trị được giao việc nhưng không xác nhận gửi thay người được giao.
- Tài khoản mất quyền hoặc ngừng hoạt động cần được phân công lại.
- Báo giá cũ đã duyệt được hiển thị để phân công, không gửi thông báo hồi tố hàng loạt. Lịch sử gửi cũ giữ nguyên; cần chọn người chăm sóc nếu chưa có.
- Nhắc đến hạn được tạo khi người phụ trách sử dụng phần mềm và hệ thống lấy thông báo, có chống trùng theo bản chào/ngày/người. Chưa có lịch chạy nền gửi nhắc khi người dùng không mở hệ thống.
- Không tự gửi Zalo/email và không suy diễn xuất file thành đã gửi. Không tự đặt thời hạn chăm sóc khi chưa khai báo.

## Bằng chứng kiểm thử

- `tests/offer-followup.test.cjs`: duyệt, giao việc, đúng người xác nhận, chống lưu trùng, lịch sử bất biến, tách phiên bản, thu hồi quyền, nhắc hạn, xử lý vướng mắc, kết thúc/mở lại/gửi lại.
- `tests/offer-followup-browser.cjs`: hai tài khoản gửi và chăm sóc riêng, xử lý thực tế trên trình duyệt, kiểm tra bố cục 390px.
- Bộ kiểm thử toàn hệ thống: 704/704 đạt ngày 25/09/2026 trước triển khai.
