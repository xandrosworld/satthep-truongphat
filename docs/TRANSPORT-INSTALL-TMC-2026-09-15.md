# Vận chuyển, lắp đặt và liên kết nhóm thang máng cáp

Theo phản hồi khách ngày 15/09/2026, 14:17–14:31.

## Hành vi

- Đơn giá vận chuyển/lắp đặt trình bày theo bảng giá: mã/tên, cách tính và đơn vị, cự ly/xe, giá hiện tại, giá đối chiếu có ghi chú, ba lần thay đổi gần nhất. Lịch sử lưu giá cũ/mới, thời điểm và cấu hình tại lần thay đổi; không tạo giá lịch sử giả cho mục mới. Đơn giá lẻ được hiển thị tới sáu chữ số thập phân.
- Bổ sung đ/kg/km, theo xe/tải trọng và theo đơn vị sản phẩm. Giữ các cách tính cũ như tấn/km, kg, m, m², chuyến, gói. Khai giá trước, chọn phương thức ở khoản chi của báo giá.
- Phí tối thiểu có phạm vi mỗi chuyến hoặc toàn khoản. Phương thức vận chuyển mới mặc định mỗi chuyến; cấu hình cũ không có phạm vi giữ nghĩa toàn khoản như trước.
- Quãng đường tham khảo từ bảng giá điền khi chọn phương thức; người lập báo giá sửa cự ly thực tế. Khoản mới chưa khai cự ly không tự lấy 10 km. Cách giá có nhân km yêu cầu cự ly dương.
- Giá đối chiếu sử dụng cùng đơn vị với giá hiện tại. Lịch sử giữ đơn vị cũ để không so lẫn kg/km với chuyến. Xuất Excel có cấu hình và lịch sử khoản phí.
- Bảng yếu tố vận chuyển/lắp đặt thu gọn dưới bảng giá; nguyên công giữ ma trận hiện có.

## Cách tính

- Kg/km: lượng kg trong phạm vi × cự ly km × đơn giá. Tấn/km đổi kg thành tấn một lần.
- Theo xe: số chuyến = giá trị lớn hơn giữa số chuyến khai và làm tròn lên (kg trong phạm vi / tải trọng xe). Không nhận lượng thay thế để tránh bỏ qua tải trọng.
- Mức sàn mỗi chuyến = giá tối thiểu một chuyến × số chuyến. Tiền khoản = giá trị lớn hơn giữa tiền theo lượng và mức sàn, sau đó nhân số lượt. Khai riêng tuyến có cự ly/lượng khác nhau.
- Lắp đặt theo đơn vị sản phẩm dùng tổng số lượng sản phẩm trong phạm vi × đơn giá. Tất cả sản phẩm được chọn phải cùng đơn vị với phương thức; sai đơn vị phải chọn lại phạm vi. Không lấy số lượng vật tư con thay cho số lượng sản phẩm.
- Giá đã chọn chụp vào báo giá; sửa danh mục không tự thay giá cũ. Chọn lại nguồn giá mới mới cập nhật khoản chi.

## Nhóm thang máng cáp

Trong nút Nhóm của sản phẩm, chọn Thang máng cáp sẽ liên kết nhóm tính giá TMC và mở phương án so sánh tương ứng. Có thể chọn bảng giá đã lưu hoặc bảng trong Đơn giá đầu vào tại đây. Nếu bảng mới trùng mã nhưng khác giá với bảng đã lưu, tạo bản riêng để không thay giá sản phẩm khác. Sản phẩm đang chia bảng giá theo cấu thành phải sửa tại cấu thành hoặc giữ cấu hình chi tiết.

Đổi sang nhóm khác bỏ phạm vi TMC của sản phẩm đó. Phương án bán cuối cùng vẫn do người lập chọn; các yêu cầu khổ rộng, chiều dài, bảng giá, chuỗi hệ số TMC vẫn được kiểm tra. Không tự chọn giá bán hay giả định thông số nghiệp vụ còn thiếu.

## Kiểm chứng

- 311 kiểm thử logic; 57 kiểm thử API cục bộ.
- Trình duyệt: luồng mới vận chuyển/lắp đặt/TMC; đơn giá đầu vào; ma trận khai giá; nhóm sản phẩm; so sánh theo nhóm; đồng bộ lựa chọn nguyên công.
- Ca trực tiếp: thay đổi bốn lần và xem ba lịch sử, giá đối chiếu 1,8 đ/kg/km, mức sàn ba chuyến, hai chuyến theo tải trọng, lắp đặt theo cái sản phẩm, giữ snapshot rồi chọn giá mới, đổi nhóm khác sang TMC và tính bằng bảng đã chọn, tải lại và màn hình hẹp.
- Chứng cứ cục bộ/live nằm tại `artifacts/customer-review/transport-install-tmc-2026-09-15/`. Bản Netlify dùng dữ liệu trình duyệt; kiểm thử API chỉ xác nhận luồng máy chủ cục bộ.

Các kiểm thử không thay thế việc khách rà và xác nhận cấu hình giá thực tế.
