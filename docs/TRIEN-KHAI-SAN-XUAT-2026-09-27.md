# Triển khai rà soát sản xuất — 27/09/2026

Bản chạy: `1998797`, thay bản `f89206e` tại https://truongphat-group.xyz.

## Nội dung

- Không gian rà soát mở ở tab riêng, dùng lại các form kỹ thuật đầu vào, cấu thành, công đoạn, khai triển. Bản vẽ sản xuất có nơi bổ sung riêng. Nháp kiến nghị tách theo người/lệnh, không ghi vào báo giá gốc.
- Sửa cấu thành, liên kết, công thức, khai triển tay, định mức, máy; tổng hợp vào kiến nghị. Kỹ thuật, kinh doanh, giá xác nhận cùng phạm vi trước khi duyệt áp dụng. Phần không duyệt giữ nguyên; thay cấu trúc cần duyệt cùng các mục liên quan.
- Một bảng xử lý kiến nghị kỹ thuật và quy trình. Hỗ trợ giá vật tư và nguyên công, kể cả công đoạn mới/đổi đơn vị. Thay giá cần kinh doanh xác nhận lại. Giá chỉ hiện cho người có quyền.
- Thay đổi kỹ thuật giữ các máy, phương pháp, định mức, công đoạn thêm/bỏ đã được duyệt. Cập nhật thông số làm mất hiệu lực xác nhận chuẩn bị và giải phóng các giữ kho chưa xuất để đối chiếu lại.
- Vật tư theo khổ tồn thực tế, khai triển và mạch cắt; không tính phôi đã giữ cho lệnh khác. Hình không chữ nhật dùng khung bao bảo thủ, không tuyên bố tối ưu cắt toàn cục.
- Quy trình trình bày bước thực tế, người phụ trách, máy, sản lượng, tiến độ, vướng mắc; QC và hoàn thành riêng. Chuỗi 8 công đoạn là tham khảo, không tự chèn vào mọi sản phẩm.

## Kiểm chứng

- 60 ca API/core liên quan đã qua. Ca mở rộng kiểm tra cấu thành mới, ngăn đổi số lượng gốc/tiêm giá, đổi giá nguyên công, xác nhận kinh doanh lại, và không phục hồi công đoạn đã bỏ sau sửa kỹ thuật.
- 6 kịch bản browser: editor đầy đủ + bản vẽ + khai triển tay + nháp/tải lại; bảng kiến nghị chung + ba bộ phận; bốn mục rà soát; máy mặc định; sản xuất cơ bản; quy trình tới đối soát nhập kho/QC/thành phẩm.
- Sao lưu mã: `/root/tp-before-1998797.tar.gz`. SQLite được xuất bởi `deploy/vietnix/backup.sh`; log tại `/root/tp-backup-1998797.log`.
- Build thành công, container `truongphat-quotation:1998797` healthy; health HTTPS OK. SHA-256 của 23 tệp runtime khớp gói local. HTML công khai chứa các thành phần mới.
- Kiểm thử nghiệp vụ trên dữ liệu thử riêng; không tạo dữ liệu thử vào cơ sở dữ liệu khách. Chưa thay thế nghiệm thu vận hành của khách.
