# Giá vận chuyển và các trường hợp kiểm thử

Mở **Đơn giá đầu vào → Vận chuyển** hoặc **Lắp đặt**.

- Bảng đơn giá hiển thị phương pháp, phép tính, giá cơ sở, hệ số, phạm vi sản phẩm, phí tối thiểu, giá đối chiếu và lịch sử. Mỗi dòng có **Sửa** và **Thử giá**.
- Bảng **Khai báo mẫu & kiểm thử** có sẵn 15 trường hợp vận chuyển và 4 trường hợp lắp đặt, kể cả khi danh mục thực tế còn trống. Giá mẫu là số minh họa, không phải báo giá thị trường.
- **Thử giá** cho thay các thông số liên quan đến phương thức; kết quả hiển thị lượng × giá × hệ số, số chuyến theo tải trọng, mức tối thiểu và số lượt. Tính bằng cùng bộ tính khoản chi của báo giá.
- **Dùng mẫu khai báo** mở form điền sẵn. Sửa tên, giá, nhóm sản phẩm và thông tin thực tế; bật **Cho phép chọn trong báo giá mới** khi đã kiểm tra. Lưu phương thức rồi **Lưu danh mục máy chủ** để dùng chung. Mặc định mẫu sao chép chưa cho chọn vào báo giá mới.

## Một số kết quả đối chiếu

| Trường hợp | Số liệu minh họa | Kết quả |
|---|---|---:|
| Kg × km | 1.200 kg × 25 km × 100 đ/(kg·km) | 3.000.000 đ |
| Xe / tải trọng | 1.200 kg; xe 500 kg; 500.000 đ/chuyến | 3 chuyến; 1.500.000 đ |
| Theo chuyến | 2 chuyến × 600.000 đ | 1.200.000 đ |
| Tối thiểu mỗi chuyến | 2 chuyến; giá 200.000 đ, tối thiểu 500.000 đ/chuyến | 1.000.000 đ |
| Có hệ số | Mẫu kg × km trên, tăng 10% | 3.300.000 đ |
| Lắp đặt theo sản phẩm | 4 bộ × 250.000 đ/bộ | 1.000.000 đ |

Mẫu chạy độc lập; mở, sửa số thử hoặc đóng hộp thoại không thay danh mục hay báo giá. Không tự thêm khoản chi vào đơn đang làm.

Kiểm tra: `tests/expense-preview.test.cjs` đối chiếu 19 kết quả, thay lượng/cự ly, mức tối thiểu, hệ số và giới hạn nhóm. `tools/verify-expense-preview.cjs` kiểm giao diện, sao chép mẫu, lưu/tải lại đơn giá riêng và điện thoại. Tham số `--live` chỉ đọc và mở form trên Railway; chặn yêu cầu ghi ngoài đăng nhập.
