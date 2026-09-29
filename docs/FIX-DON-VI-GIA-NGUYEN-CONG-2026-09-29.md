# Sửa cập nhật đơn vị giá nguyên công — 29/09/2026

Runtime đã triển khai: `bffff4a`.

## Nguyên nhân và thay đổi
- Bản sao báo giá BG-20260922-002 giữ bảng cũ: ID weld tên Hàn lắp, 35.000 đ/m. Danh mục hiện tại cùng ID là Chấn, giá tại xưởng 2.000 đ/kg. Khai báo công việc dùng kg. Không thể đổi nhãn đơn vị mà giữ nguyên số giá cũ.
- Bảng nguyên công nay hiển thị thông báo cập nhật đơn vị, tên hiện tại và tên trong bảng giá lưu. Người có quyền xem trước cả giá và đơn vị cũ/mới rồi áp dụng.
- Cập nhật đơn vị giá từng bị nhận nhầm là sửa kỹ thuật đã bàn giao. Đã tách đơn vị giá khỏi dấu kiểm tra kỹ thuật ở frontend/backend, cả bàn giao toàn bộ và từng phần. Giữ tương thích xác nhận cũ qua phiên bản đã lưu. Đơn vị lượng công việc vẫn là dữ liệu kỹ thuật được kiểm soát.
- Giá sai đơn vị vẫn lưu nháp được, nhưng không được xác nhận giá. Không tự đổi đơn giá, lượng kỹ thuật hoặc cấp thêm quyền.

## Kiểm tra
- 9/9 kiểm thử core/API: cập nhật giá và đơn vị theo cặp, giá riêng, dữ liệu cũ, trạng thái duyệt, bàn giao từng phần, lưu nháp và chặn xác nhận khi lệch đơn vị.
- Browser operation-unit-refresh-server-browser: cập nhật, lỗi lưu, thử lưu lại, mở lại.
- Browser quote-operation-choice-browser: lựa chọn cách tính, đơn vị, lưu/mở lại, dữ liệu lỗi và mobile.
- Browser với bản sao DB thật: Thảo thấy hướng dẫn và không có nút cập nhật vượt quyền; Admin xem 35.000 đ/m → 2.000 đ/kg, lưu và mở lại thành công; nguyên công giữ nguyên, lỗi lệch m biến mất.
- Hai kiểm thử notifications-server hiện thất bại cả ở HEAD trước bản sửa (đã đối chiếu bằng require hook): kỳ vọng khóa khi chữ ký cũ không hợp lệ, và kỳ vọng khóa đầu vào khi submitted. Không coi đây là kết quả đạt của bản sửa.
- Production: health và HTML public đạt; SHA256 của 97 file runtime trong container khớp manifest. Đã sao lưu trước triển khai.

## Việc cần người phụ trách giá thực hiện
Giá của báo giá thật chưa bị sửa tự động. Anh Hợp hoặc người được cấp quyền mở mục 6 → Nguyên công → Cập nhật giá đúng đơn vị, kiểm tra bảng so sánh và xác nhận áp dụng. Thảo hiện chỉ được xem nguyên công; việc cấp quyền do người quản trị quyết định.
