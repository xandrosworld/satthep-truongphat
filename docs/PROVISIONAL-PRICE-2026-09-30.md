# Giá tạm tính cho Admin — 30/09/2026

Yêu cầu: giá vật tư mới nhất theo mã tương ứng; chỉ Admin xem giá trị tạm tính.

Triển khai 51ac742 (kèm 413b596), máy chủ healthy.
- Nguồn gợi ý là danh mục giá hiện hành trên máy chủ, khớp mã vật tư và đơn vị.
- Giá vật tư đã xác nhận trong báo giá được giữ. Nguyên công, vận chuyển và hệ số lấy từ báo giá.
- Kỹ thuật thêm dòng mới nhận giá danh mục phù hợp khi lưu; không nhận quyền xem tiền.
- Admin có bảng tạm tính riêng trên báo giá chưa duyệt, cập nhật mỗi 20 giây từ dữ liệu đã lưu. Có phiên bản dữ liệu, chi tiết nguồn và cảnh báo thiếu giá.
- API chỉ cho Admin, tính trên bản sao, không thay giá trị/chứng nhận/phiên bản báo giá.
- Chưa đủ giá hoặc có lỗi tính toán thì không hiển thị tổng đầy đủ giả định.

Kiểm thử: 11 ca node (provisional-price, technical-payload, formula-lock-identity, technical-feedback-regressions) đạt; provisional-price-browser đạt kiểm tra nguồn giá thay đổi, mobile và ẩn khi đổi vai trò.
Web thật: mở báo giá nháp có dữ liệu, đối chiếu kết quả API và giao diện desktop/mobile; không ghi dữ liệu nghiệp vụ. Mẫu V19 có 1 dòng có nguồn và 16 dòng chưa tìm được giá phù hợp; giao diện báo thiếu, không tự bịa giá. Phiên kiểm tra đã thu hồi.

Giới hạn: số tạm tính phản ánh dữ liệu đã lưu, không phải nội dung kỹ thuật chưa gửi lên máy chủ. Chưa rà soát toàn bộ danh mục để bổ sung giá còn thiếu.
