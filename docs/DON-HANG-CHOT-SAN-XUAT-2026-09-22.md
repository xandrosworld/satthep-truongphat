# Báo giá → Đơn hàng → Lệnh sản xuất

- Chỉ admin thấy và truy cập hồ sơ đơn hàng có giá.
- Báo giá đã duyệt → Chuyển đơn hàng → kiểm tra sản phẩm, lượng, giá và thuế → xác nhận đã thống nhất với khách → Chốt đơn hàng → Phát hành lệnh theo sản phẩm/lô.
- Đơn mới ở trạng thái chờ chốt. API và màn hình sản xuất chỉ nhận đơn đã chốt.
- Chốt giữ nguyên dữ liệu phiên bản đã duyệt, có thời gian/người chốt và nhật ký. Gửi lại không tạo trùng.
- Đơn cũ vốn ở trạng thái awaiting-production giữ hiệu lực; không làm gián đoạn lệnh đang chạy.
- Không thêm điều kiện đặt cọc/chứng từ hợp đồng bắt buộc. Đây là bước xác nhận đơn, chưa phải toàn bộ module hợp đồng hoặc quản lý đơn hàng giai đoạn 2.
- Kỹ thuật chỉ nhận dữ liệu sản xuất không giá qua API riêng.

Kiểm thử: 29 ca server/technical/production; trình duyệt admin chốt → phát hành, kỹ thuật nhận → chuẩn bị → công đoạn → QC → hoàn thành; kiểm tra xung đột phiên bản, tải lại và laptop 1366/1920.
