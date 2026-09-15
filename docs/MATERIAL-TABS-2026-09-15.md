# Bảng vật liệu — ghi chú sáng 15/09

Xử lý từng bảng theo yêu cầu mới. Phạm vi lượt này là DM-01: bỏ hai tab Mác vật liệu và Đặc tính trên thanh chính của Danh mục quy ước vì đã có nút quản lý tại từng dòng vật liệu.

- Vào Vật liệu, chọn nút số mác hoặc số đặc tính tại dòng cần sửa.
- Mở danh sách tương ứng theo vật liệu; vẫn thêm, sửa, xóa và kiểm tra nơi dùng như trước.
- Tab Vật liệu giữ trạng thái đang chọn khi xem danh sách con. Bấm Vật liệu để quay lại bảng tổng.
- Giữ nguyên dữ liệu đã khai, quan hệ vật liệu/mác/đặc tính và dữ liệu báo giá.

Kiểm bằng luồng trình duyệt hiện có `tests/rules-catalog-browser.cjs`: tạo vật liệu, mở mác/đặc tính từ dòng, khai và xóa dữ liệu con, kiểm quan hệ và bảo toàn báo giá đã duyệt; đồng thời chạy hồi quy công thức, xuất Excel, tính khối lượng và màn hình hẹp. Bằng chứng cục bộ và web nằm trong `artifacts/customer-review/material-tabs-2026-09-15/`.

Phản hồi về liên kết giá nguyên công, khai giá vận chuyển/lắp đặt tương tự và báo giá chỉ chọn phương thức được ghi nhận cho lượt riêng. Không coi đợt đơn giá trước đã đáp ứng trọn phản hồi sáng 15/09. Khách sẽ gửi ghi chú cụ thể; lượt này chưa thay đổi phần giá.
