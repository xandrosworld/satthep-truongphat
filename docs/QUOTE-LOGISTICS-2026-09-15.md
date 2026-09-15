# Chọn vận chuyển và lắp đặt trong báo giá

Ngày 15/09/2026.

Gom vận chuyển và lắp đặt vào tab Giá & hệ số, đưa thanh Giá áp dụng cho báo giá này lên đầu. Bỏ bước vận chuyển riêng; điều hướng cũ vẫn mở đúng tab mới.

Danh sách vật tư được gom theo mã trong báo giá, bao gồm vật tư hoàn thiện có phát sinh nhu cầu. Chọn vận chuyển nhập hoặc thuê ngoài ngay trên dòng vật tư. Giao hàng và lắp đặt chọn theo dòng sản phẩm. Phương thức lấy từ Đơn giá đầu vào đúng loại phí; bổ sung cự ly, số chuyến và phạm vi thực tế trong form trước khi lưu.

Khoản đã chọn có thể mở lại để sửa. Một khoản dùng chung hiển thị ở các dòng liên quan để đối chiếu nhưng chỉ được tính một lần. Giữ bảng khoản chi, phân bổ và chuyển đổi chi phí cũ. Không tự đổi giá đã chụp trong báo giá khi danh mục thay đổi. Chưa khai phương thức thì dẫn về Đơn giá đầu vào.

Sửa lỗi form không lưu được khi mở lại giá theo chuyến có quãng đường 0: chỉ các phương thức tính theo km mới bắt buộc cự ly lớn hơn 0.

## Kiểm chứng

- 324 kiểm tra logic đạt.
- 7 nhóm trình duyệt cho luồng mới: phạm vi, giá, mức sàn, F5, sửa khoản cũ, điều hướng, thiếu danh mục và khoản chung.
- 6 nhóm vận chuyển/lắp đặt/TMC đạt.
- 7 nhóm đơn giá đầu vào đạt, gồm sửa chuyến không khai cự ly và chọn lại giá mới.
- Chứng cứ cục bộ: artifacts/customer-review/quote-logistics-2026-09-15.

Chưa thay thế nghiệm thu của khách hàng. Thay đổi này tập trung phần chọn vận chuyển/lắp đặt và bố trí Giá & hệ số.
