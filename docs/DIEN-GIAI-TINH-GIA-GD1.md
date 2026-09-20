# Bảng diễn giải tính giá GĐ1

Trong **Báo giá → Phân tích giá → Bảng diễn giải tính giá**, người có quyền xem chi phí nội bộ và biểu thức công thức có thể xem trước, tải Excel để rà số liệu với người phụ trách. Đây là báo cáo nội bộ, độc lập với Excel chào giá gửi người mua.

## Nội dung

- Thông tin báo giá, phiên bản, phương án đang chọn và cách đọc.
- Đầu vào vật tư, thông số sau khi giải liên kết, số lượng nhân qua các cấp.
- Kích thước khai triển đúng ký hiệu đã khai; công thức và thay số khối lượng/diện tích phôi. Khổ bao sắp xếp không thay diện tích thực của đa giác.
- Vật tư dự tính, vật tư phụ, phần dư chọn tận dụng, hao hụt còn lại trên khối lượng phôi.
- Lượng thực hiện riêng, đơn giá nguyên công, định mức hoàn thiện, gói thuê, công lắp thiết bị đã khai.
- Vận chuyển/lắp đặt, lượng tính phí, mức tối thiểu, hệ số, số lượt, phân bổ.
- Giá nguồn và thuế trong giá; giá đang dùng và căn cứ xác nhận.
- Đầu mục phương án đang chọn, TMC hoặc công thức nhóm; giá sản xuất, giao hàng/lắp đặt, cơ sở chi phí chung và quản lý, hệ số bán nối tiếp, làm tròn, thuế và tổng.
- Danh sách dữ liệu cần bổ sung/xác nhận.

## Hành vi cần giữ

Xuất không thay số liệu, không xác nhận giá/thuế/điều kiện chào thay người lập, không chuyển báo giá cũ sang luồng mới. Bản nháp thiếu dữ liệu vẫn xuất để rà, nhưng tổng tiền không hoàn chỉnh phải hiện “Chưa đủ dữ liệu”. Giá bằng 0 được giữ và nhắc kiểm tra. Bản dùng luồng giá cũ được ghi rõ.

File giữ các kết quả số của bộ tính hiện tại. Biểu thức và thay số là văn bản an toàn trong Excel; sửa ô không tính lại báo giá. Chi tiết vật tư/nguyên công là căn cứ nhánh tính toán, không cộng lần nữa vào giá gói đặc thù. Các dòng cấp cha và con không được cộng trùng.

Kiểm quyền khi mở và khi tải. Chặn dữ liệu chứa tham chiếu công thức được bảo vệ. Không thêm báo cáo nội bộ vào file chào khách.

## Kiểm tra

`tests/calculation-report.test.cjs` đối chiếu đáp án độc lập cho số lượng, hai loại diện tích, tam giác ba cạnh, phần dư tận dụng, cơ sở hệ số nối tiếp, nguồn giá gồm thuế, báo giá thiếu dữ liệu, TMC hỗn hợp, vận chuyển và quyền truy cập.

`tests/calculation-report-browser.cjs` tải XLSX thật, kiểm tra ô số, công thức dạng văn bản, xem trước trên desktop/mobile, xuất bản thiếu dữ liệu, không thay dữ liệu và chặn quyền bị thu hồi. Chạy cùng kiểm tra pricing, tax, cost-flow, polygon-remnant và luồng báo giá trong `confirmed-flow-browser.cjs`.

STEP/CAD, tối ưu ghép sát biên dạng, danh mục máy sản xuất và chi phí sản xuất thực tế vẫn thuộc phần đã ghi nhận cho GĐ2.
