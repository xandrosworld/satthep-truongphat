# Đề nghị cấp vật tư — 30/09/2026

- Tìm mã/tên vật tư trên từng dòng, hỗ trợ tìm không dấu; giữ lựa chọn của dòng khi lọc và không tự chọn kết quả khác.
- Hiển thị đơn vị kho và quy cách từ danh mục theo chủng loại; yêu cầu riêng nhập độc lập. Máy chủ chụp lại quy cách tại lúc lập phiếu, không nhận quy cách danh mục do người gửi tự sửa.
- Khai báo mã chưa có ngay trong phiếu: mã, tên, đơn vị, loại tấm/thanh/vật tư khác, kích thước tương ứng và quy cách bổ sung. Chỉ gửi khai báo, không tự gửi phiếu cấp vật tư.
- Khai báo lưu trạng thái chờ duyệt trong dữ liệu dùng chung. Người có quyền duyệt kho và tạo vật tư kho được duyệt/trả lại tại “Khai báo mã vật tư / chờ duyệt”. Sau duyệt, mã được tạo vào danh mục vật tư kho hiện có; không tạo tồn kho hoặc chi phí.
- Người lập chỉ xem khai báo của mình; người có quyền duyệt kho xem hàng chờ. Kiểm tra mã trùng cả lúc gửi và lúc duyệt, phiên bản, quyền duyệt, lý do trả lại và mã thao tác chống gửi lặp. Có thông báo hàng chờ cho người đủ quyền.
- “Cập nhật vật tư đã duyệt” cập nhật lựa chọn trong phiếu đang mở, giữ người nhận, căn cứ, yêu cầu và số lượng đã nhập. Không hứa khôi phục phiếu chưa gửi sau tải lại trang.
- Giới hạn: đây là khai báo vật tư kho để cấp/mua; không tự tạo công thức hình học hoặc đơn giá trong danh mục báo giá.

Kiểm thử: service-requests.test.cjs; request-context.test.cjs; service-material-picker-browser.cjs; service-requests-browser.cjs. Đạt tìm kiếm, dòng độc lập, đơn vị/quy cách, giữ phiếu khi gửi khai báo và tải mã duyệt, mobile; kiểm tra API từ chối quyền thiếu, mã chưa duyệt chưa được chọn, xung đột phiên bản/mã, trả lại và lưu quy cách từ máy chủ. Luồng cấp một phần/toàn phần và sửa chữa hồi quy đạt.
